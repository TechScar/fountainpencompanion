module RubyLlmAgent
  extend ActiveSupport::Concern

  included do
    %i[agent_log model_id system_directive tools].each do |method|
      unless method_defined?(method) || private_method_defined?(method)
        define_method(method) do
          raise NotImplementedError, "#{self.class} must implement ##{method}"
        end
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

  private

  # Agents must implement these methods:
  # - agent_log   → AgentLog instance
  # - model_id    → string (e.g., "gpt-4.1-mini")
  # - system_directive → string (system prompt)
  # - tools       → array of RubyLLM::Tool subclasses (can be empty)

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
      entry = { role: msg.role.to_s, content: msg.content.to_s }
      entry[:tool_calls] = serialize_tool_calls(msg.tool_calls) if msg.tool_call?
      entry[:tool_call_id] = msg.tool_call_id if msg.tool_result?
      entry
    end
  end

  def serialize_tool_calls(tool_calls)
    tool_calls.map { |id, tc| { id: id, name: tc.name, arguments: tc.arguments } }
  end

  # Restores non-system messages from a previously saved transcript,
  # allowing agents to resume interrupted conversations.
  def restore_transcript(chat)
    return if agent_log.transcript.blank?

    agent_log.transcript.each do |entry|
      entry = entry.deep_symbolize_keys
      next if entry[:role].to_s.in?(%w[system developer])

      attrs = { role: entry[:role].to_sym, content: entry[:content].to_s }
      attrs[:tool_call_id] = entry[:tool_call_id] if entry[:tool_call_id]
      attrs[:tool_calls] = deserialize_tool_calls(entry[:tool_calls]) if entry[:tool_calls]
      chat.add_message(attrs)
    end
  end

  def deserialize_tool_calls(tool_calls_array)
    tool_calls_array.to_h do |tc|
      tc = tc.deep_symbolize_keys
      [tc[:id], RubyLLM::ToolCall.new(id: tc[:id], name: tc[:name], arguments: tc[:arguments])]
    end
  end
end
