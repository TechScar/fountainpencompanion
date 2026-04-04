require "rails_helper"

describe "Leaderboards pages", type: :request do
  describe "GET /pages/leaderboards" do
    before do
      allow(LeaderBoard).to receive(:top_inks).and_return([])
      allow(LeaderBoard).to receive(:top_bottles).and_return([])
      allow(LeaderBoard).to receive(:top_samples).and_return([])
      allow(LeaderBoard).to receive(:top_cartridges).and_return([])
      allow(LeaderBoard).to receive(:top_brands).and_return([])
      allow(LeaderBoard).to receive(:top_currently_inked).and_return([])
      allow(LeaderBoard).to receive(:top_usage_records).and_return([])
      allow(LeaderBoard).to receive(:top_ink_review_submissions).and_return([])
      allow(LeaderBoard).to receive(:top_users_by_description_edits).and_return([])
      allow(LeaderBoard).to receive(:top_inks_by_popularity).and_return([])
      allow(LeaderBoard).to receive(:top_pens_by_popularity).and_return([])
    end

    it "renders successfully with page title and layout header" do
      get page_path("leaderboards")

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Leaderboards")
      expect(response.body).to include("<main")
      expect(response.body).to include("Sign up")
      expect(response.body).to include("Login")
    end
  end

  describe "GET /pages/currently_inked_leaderboard" do
    before { allow(LeaderBoard).to receive(:currently_inked).and_return([]) }

    it "renders successfully" do
      get page_path("currently_inked_leaderboard")

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Currently Inked Leaderboard")
      expect(response.body).to include("Leaderboards")
    end
  end

  describe "GET /pages/ink_review_submissions_leaderboard" do
    before { allow(LeaderBoard).to receive(:ink_review_submissions).and_return([]) }

    it "renders successfully with hint text" do
      get page_path("ink_review_submissions_leaderboard")

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Review Submissions Leaderboard")
      expect(response.body).to include("you need to be logged in")
    end
  end
end
