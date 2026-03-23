class WebPageSummarizer
  include RubyLlmAgent

  SYSTEM_DIRECTIVE = <<~TEXT
    You will be given the raw HTML of a web page. Your task is to summarize the page
    and return the summary in a human-readable format. The summary should include
    the title, description, and any other relevant information that can be extracted.
  TEXT

  def initialize(parent_agent_log, raw_html)
    @parent_agent_log = parent_agent_log
    @raw_html = raw_html
  end

  def perform
    response = ask(raw_html)
    agent_log.waiting_for_approval!
    response.content
  end

  def agent_log
    @agent_log ||= parent_agent_log.agent_logs.processing.where(name: self.class.name).first
    @agent_log ||= parent_agent_log.agent_logs.create!(name: self.class.name, transcript: [])
  end

  private

  attr_reader :parent_agent_log, :raw_html

  def model_id = "gpt-4.1-mini"
  def system_directive = SYSTEM_DIRECTIVE
  def tools = []
end
