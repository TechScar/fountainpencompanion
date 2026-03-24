require "rails_helper"

RSpec.describe Tools::InkSimilaritySearchTool do
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

  let(:search_result_1) { double("SearchResult", cluster: macro_cluster_1, distance: 0.15) }
  let(:search_result_2) { double("SearchResult", cluster: macro_cluster_2, distance: 0.23) }
  let(:search_result_3) { double("SearchResult", cluster: macro_cluster_3, distance: 0.31) }

  before do
    allow(MacroCluster).to receive(:embedding_search).and_return(
      [search_result_1, search_result_2, search_result_3]
    )
  end

  it "has the correct name" do
    expect(subject.name).to eq("ink_similarity_search")
  end

  it "has the correct description" do
    expect(subject.description).to eq("Find the 20 most similar ink clusters by cosine distance")
  end

  it "calls MacroCluster.embedding_search with search string" do
    subject.call(search_string: "blue ink")

    expect(MacroCluster).to have_received(:embedding_search).with("blue ink")
  end

  it "returns formatted cluster data with distances" do
    result = subject.call(search_string: "blue ink")

    expect(result).to eq(
      [
        {
          id: 1,
          name: "Pilot Iroshizuku Kon-peki",
          distance: 0.15,
          synonyms: ["Pilot Kon-peki", "Iroshizuku Blue"],
          color: "#1E3A8A"
        },
        { id: 2, name: "Sailor Sei-boku", distance: 0.23, synonyms: ["Sailor Blue", "Sei-boku"] },
        {
          id: 3,
          name: "Diamine Oxford Blue",
          distance: 0.31,
          synonyms: ["Oxford Blue"],
          color: "#003366"
        }
      ]
    )
  end

  it "limits results to 20 items" do
    mock_results =
      25.times.map do |i|
        cluster = double("Cluster#{i}", id: i, name: "Ink #{i}", synonyms: [], color: nil)
        double("SearchResult", cluster: cluster, distance: 0.1 + (i * 0.01))
      end

    allow(MacroCluster).to receive(:embedding_search).and_return(mock_results)

    result = subject.call(search_string: "test")

    expect(result.length).to eq(20)
  end

  it "excludes color when not present" do
    result = subject.call(search_string: "blue ink")

    cluster_without_color = result.find { |c| c[:id] == 2 }
    expect(cluster_without_color).not_to have_key(:color)
  end

  it "includes color when present" do
    result = subject.call(search_string: "blue ink")

    cluster_with_color = result.find { |c| c[:id] == 1 }
    expect(cluster_with_color[:color]).to eq("#1E3A8A")
  end

  it "handles empty search results" do
    allow(MacroCluster).to receive(:embedding_search).and_return([])

    result = subject.call(search_string: "nonexistent ink")

    expect(result).to eq([])
  end

  it "handles clusters with empty synonyms" do
    cluster = double("MacroCluster", id: 4, name: "Test Ink", synonyms: [], color: nil)
    search_result = double("SearchResult", cluster: cluster, distance: 0.5)
    allow(MacroCluster).to receive(:embedding_search).and_return([search_result])

    result = subject.call(search_string: "test")

    expect(result.first[:synonyms]).to eq([])
  end

  it "handles blank color strings" do
    cluster = double("MacroCluster", id: 5, name: "Test Ink", synonyms: ["Test"], color: "")
    search_result = double("SearchResult", cluster: cluster, distance: 0.5)
    allow(MacroCluster).to receive(:embedding_search).and_return([search_result])

    result = subject.call(search_string: "test")

    expect(result.first).not_to have_key(:color)
  end
end
