module RubyLlmAgent
  extend ActiveSupport::Concern

  included do
    unless method_defined?(:agent_log) || private_method_defined?(:agent_log)
      define_method(:agent_log) do
        raise NotImplementedError, "#{self.class} must implement #agent_log"
      end
    end
  end

  def chat
    @chat ||= build_chat
  end

  # Use this instead of chat.ask to ensure the transcript is saved
  # before the API call, matching the old AgentTranscript behavior.
  def ask(prompt)
    chat.add_message(role: :user, content: prompt)
    save_transcript
    chat.complete
  end

  # Like ask, but forces the LLM to produce a tool call via tool_choice: required.
  # Use this when a tool call (that halts) is required for the agent to proceed.
  def ask!(prompt)
    chat.add_message(role: :user, content: prompt)
    save_transcript
    chat.with_tool(nil, choice: :required)
    chat.complete
  end

  def find_or_create_agent_log(owner)
    @agent_log ||= owner.agent_logs.processing.where(name: self.class.name).first
    @agent_log ||= owner.agent_logs.create!(name: self.class.name, transcript: [])
  end

  private

  def model_id
    self.class::MODEL_ID
  end

  def system_directive
    self.class::SYSTEM_DIRECTIVE
  end

  def tools
    []
  end

  def build_chat
    c = ruby_llm_context.chat(model: model_id)
    c.with_instructions(system_directive)
    tools.each { |tool| c.with_tool(tool) }
    restore_transcript(c)
    register_callbacks(c)
    c
  end

  def ruby_llm_context
    @ruby_llm_context ||= RubyLLM.context { |config| config.openai_api_key = access_token }
  end

  def access_token
    if Rails.env.development?
      ENV.fetch("OPEN_AI_DEV_TOKEN", nil)
    else
      ENV.fetch(agent_token_env_var, ENV.fetch("OPEN_AI_TOKEN", nil))
    end
  end

  def agent_token_env_var
    "OPEN_AI_#{self.class.name.underscore.upcase}_TOKEN"
  end

  MAX_TOOL_CALLS = 50

  # Multiple saves per round-trip are intentional: we save after each
  # interaction so the agent log reflects progress incrementally.
  def register_callbacks(c)
    @tool_call_count = 0
    c.on_end_message { |message| save_transcript_and_usage(message) }
    c.on_tool_call do
      @tool_call_count += 1
      raise "Max tool calls (#{MAX_TOOL_CALLS}) exceeded" if @tool_call_count > MAX_TOOL_CALLS
      save_transcript
    end
  end

  def save_transcript_and_usage(message)
    if message&.input_tokens
      agent_log.usage["model"] = message.model_id
      agent_log.usage["prompt_tokens"] += message.input_tokens.to_i
      agent_log.usage["completion_tokens"] += message.output_tokens.to_i
      agent_log.usage["total_tokens"] += message.input_tokens.to_i + message.output_tokens.to_i
    end
    save_transcript
  end

  def save_transcript
    agent_log.transcript = serialize_messages(chat.messages)
    agent_log.save!
  end

  def serialize_messages(messages)
    messages.map do |msg|
      entry = { role: msg.role.to_s, content: sanitize_for_pg(msg.content.to_s) }
      entry[:tool_calls] = serialize_tool_calls(msg.tool_calls) if msg.tool_call?
      entry[:tool_call_id] = msg.tool_call_id if msg.tool_result?
      entry
    end
  end

  def serialize_tool_calls(tool_calls)
    tool_calls.map { |id, tc| { id: id, name: tc.name, arguments: tc.arguments } }
  end

  # PostgreSQL cannot store \u0000 (null bytes) in text/jsonb columns.
  # LLM responses occasionally contain these characters.
  def sanitize_for_pg(str)
    str.delete("\u0000")
  end

  # Restores non-system messages from a previously saved transcript,
  # allowing agents to resume interrupted conversations.
  def restore_transcript(chat)
    return if agent_log.transcript.blank?

    entries = trim_dangling_tool_calls(agent_log.transcript)

    entries.each do |entry|
      entry = entry.deep_symbolize_keys
      next if entry[:role].blank?
      next if entry[:role].to_s.in?(%w[system developer])

      attrs = { role: entry[:role].to_sym, content: entry[:content].to_s }
      attrs[:tool_call_id] = entry[:tool_call_id] if entry[:tool_call_id]
      attrs[:tool_calls] = deserialize_tool_calls(entry[:tool_calls]) if entry[:tool_calls]
      chat.add_message(attrs)
    end
  end

  # If the transcript ends with an assistant message containing tool_calls
  # but the corresponding tool responses are missing (e.g. due to a crash),
  # remove the dangling assistant message so the API won't reject the transcript.
  def trim_dangling_tool_calls(transcript)
    entries = transcript.map(&:deep_symbolize_keys)
    return entries if entries.empty?

    last = entries.last
    if last[:tool_calls].present? && last[:role].to_s == "assistant"
      entries[0...-1]
    else
      entries
    end
  end

  def deserialize_tool_calls(tool_calls_array)
    tool_calls_array.to_h do |tc|
      tc = tc.deep_symbolize_keys
      [tc[:id], RubyLLM::ToolCall.new(id: tc[:id], name: tc[:name], arguments: tc[:arguments])]
    end
  end
end
