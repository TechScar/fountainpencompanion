require "rails_helper"

RSpec.describe RubyLlmAgent do
  let(:test_class) do
    Class.new do
      include RubyLlmAgent

      attr_accessor :agent_log

      def initialize(agent_log)
        self.agent_log = agent_log
      end
    end
  end

  let(:agent_log) { AgentLog.create!(name: "TestAgent", transcript: []) }
  let(:agent) { test_class.new(agent_log) }

  describe "#sanitize_for_pg" do
    it "strips null bytes from strings" do
      result = agent.send(:sanitize_for_pg, "hello\u0000world")
      expect(result).to eq("helloworld")
    end

    it "leaves normal strings unchanged" do
      result = agent.send(:sanitize_for_pg, "hello world")
      expect(result).to eq("hello world")
    end

    it "handles empty strings" do
      result = agent.send(:sanitize_for_pg, "")
      expect(result).to eq("")
    end

    it "strips multiple null bytes" do
      result = agent.send(:sanitize_for_pg, "\u0000foo\u0000bar\u0000")
      expect(result).to eq("foobar")
    end
  end

  describe "#trim_dangling_tool_calls" do
    it "removes the last entry if it is an assistant message with tool_calls" do
      transcript = [
        { role: "user", content: "hello" },
        {
          role: "assistant",
          content: "",
          tool_calls: [{ id: "call_1", name: "my_tool", arguments: {} }]
        }
      ]

      result = agent.send(:trim_dangling_tool_calls, transcript)
      expect(result.length).to eq(1)
      expect(result.first[:role].to_s).to eq("user")
    end

    it "does not remove the last entry if it has tool responses following" do
      transcript = [
        { role: "user", content: "hello" },
        {
          role: "assistant",
          content: "",
          tool_calls: [{ id: "call_1", name: "my_tool", arguments: {} }]
        },
        { role: "tool", content: "result", tool_call_id: "call_1" }
      ]

      result = agent.send(:trim_dangling_tool_calls, transcript)
      expect(result.length).to eq(3)
    end

    it "does not remove the last entry if it is a user message" do
      transcript = [{ role: "user", content: "hello" }]

      result = agent.send(:trim_dangling_tool_calls, transcript)
      expect(result.length).to eq(1)
    end

    it "handles an empty transcript" do
      result = agent.send(:trim_dangling_tool_calls, [])
      expect(result).to eq([])
    end

    it "works with string keys" do
      transcript = [
        { "role" => "user", "content" => "hello" },
        {
          "role" => "assistant",
          "content" => "",
          "tool_calls" => [{ "id" => "call_1", "name" => "my_tool", "arguments" => {} }]
        }
      ]

      result = agent.send(:trim_dangling_tool_calls, transcript)
      expect(result.length).to eq(1)
    end
  end
end
