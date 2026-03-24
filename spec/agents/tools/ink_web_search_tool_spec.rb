require "rails_helper"

RSpec.describe Tools::InkWebSearchTool do
  let(:agent_log) { AgentLog.create!(name: "InkClusterer", transcript: []) }
  subject { described_class.new(agent_log) }

  it "has the correct name" do
    expect(subject.name).to eq("search_web")
  end

  it "has the correct description" do
    expect(subject.description).to eq("Search the web")
  end

  it "appends 'ink' to the search query and delegates to GoogleSearchSummarizer" do
    summarizer = instance_double(GoogleSearchSummarizer, perform: "Summary of results")
    expect(GoogleSearchSummarizer).to receive(:new).with(
      "blue pen ink",
      parent_agent_log: agent_log
    ).and_return(summarizer)

    result = subject.call(search_query: "blue pen")

    expect(result).to include("blue pen ink")
    expect(result).to include("Summary of results")
  end

  it "returns formatted search results" do
    summarizer = instance_double(GoogleSearchSummarizer, perform: "Found 3 results about the ink.")
    allow(GoogleSearchSummarizer).to receive(:new).and_return(summarizer)

    result = subject.call(search_query: "Pilot Iroshizuku")

    expect(result).to eq(
      "The search results for 'Pilot Iroshizuku ink' are:\n Found 3 results about the ink."
    )
  end
end
