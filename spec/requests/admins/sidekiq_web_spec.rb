require "rails_helper"

describe "Sidekiq Web UI" do
  let(:admin) { create(:user, :admin) }

  before(:each) { sign_in(admin) }

  it "renders the dashboard" do
    get "/admins/sidekiq/"
    expect(response).to be_successful
  end
end
