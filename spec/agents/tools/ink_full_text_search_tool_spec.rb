require "rails_helper"

RSpec.describe Tools::InkFullTextSearchTool do
  subject { described_class.new }

  let(:macro_cluster_1) do
    double(
      "MacroCluster",
      id: 1,
      name: "Pilot Iroshizuku Kon-peki",
      synonyms: ["Pilot Kon-peki", "Iroshizuku Blue"],
      color: "#1E3A8A"
    )
  end

  let(:macro_cluster_2) do
    double(
      "MacroCluster",
      id: 2,
      name: "Sailor Sei-boku",
      synonyms: ["Sailor Blue", "Sei-boku"],
      color: nil
    )
  end

  let(:macro_cluster_3) do
    double(
      "MacroCluster",
      id: 3,
      name: "Diamine Oxford Blue",
      synonyms: ["Oxford Blue"],
      color: "#003366"
    )
  end

  before do
    allow(MacroCluster).to receive(:full_text_search).and_return(
      [macro_cluster_1, macro_cluster_2, macro_cluster_3]
    )
  end

  it "has the correct name" do
    expect(subject.name).to eq("ink_full_text_search")
  end

  it "has the correct description" do
    expect(subject.description).to eq(
      "Fallback search, when results using similarity search inconclusive. Finds inks by full text search"
    )
  end

  it "calls MacroCluster.full_text_search with search string" do
    subject.call(search_string: "pilot blue")

    expect(MacroCluster).to have_received(:full_text_search).with("pilot blue")
  end

  it "returns formatted cluster data without distances" do
    result = subject.call(search_string: "pilot blue")

    expect(result).to eq(
      [
        {
          id: 1,
          name: "Pilot Iroshizuku Kon-peki",
          synonyms: ["Pilot Kon-peki", "Iroshizuku Blue"],
          color: "#1E3A8A"
        },
        { id: 2, name: "Sailor Sei-boku", synonyms: ["Sailor Blue", "Sei-boku"] },
        { id: 3, name: "Diamine Oxford Blue", synonyms: ["Oxford Blue"], color: "#003366" }
      ]
    )
  end

  it "excludes color when not present" do
    result = subject.call(search_string: "sailor")

    cluster_without_color = result.find { |c| c[:id] == 2 }
    expect(cluster_without_color).not_to have_key(:color)
  end

  it "includes color when present" do
    result = subject.call(search_string: "pilot")

    cluster_with_color = result.find { |c| c[:id] == 1 }
    expect(cluster_with_color[:color]).to eq("#1E3A8A")
  end

  it "handles empty search results" do
    allow(MacroCluster).to receive(:full_text_search).and_return([])

    result = subject.call(search_string: "nonexistent ink")

    expect(result).to eq([])
  end

  it "handles clusters with empty synonyms" do
    cluster = double("MacroCluster", id: 4, name: "Test Ink", synonyms: [], color: nil)
    allow(MacroCluster).to receive(:full_text_search).and_return([cluster])

    result = subject.call(search_string: "test")

    expect(result.first[:synonyms]).to eq([])
  end

  it "handles blank color strings" do
    cluster = double("MacroCluster", id: 5, name: "Test Ink", synonyms: ["Test"], color: "")
    allow(MacroCluster).to receive(:full_text_search).and_return([cluster])

    result = subject.call(search_string: "test")

    expect(result.first).not_to have_key(:color)
  end

  it "does not include distance in results" do
    result = subject.call(search_string: "test")

    result.each { |cluster_data| expect(cluster_data).not_to have_key(:distance) }
  end
end
