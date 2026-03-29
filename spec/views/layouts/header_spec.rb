require "rails_helper"

RSpec.describe "layouts/_header", type: :view do
  before do
    allow(view).to receive(:root_path).and_return("/")
    allow(view).to receive(:brands_path).and_return("/brands")
    allow(view).to receive(:pen_brands_path).and_return("/pen_brands")
    allow(view).to receive(:missing_reviews_path).and_return("/missing_reviews")
    allow(view).to receive(:missing_descriptions_path).and_return("/missing_descriptions")
    allow(view).to receive(:page_path).with("leaderboards").and_return("/pages/leaderboards")
    allow(view).to receive(:users_path).and_return("/users")
    allow(view).to receive(:blog_index_path).and_return("/blog")
    allow(view).to receive(:dashboard_path).and_return("/dashboard")
    allow(view).to receive(:currently_inked_index_path).and_return("/currently_inked")
    allow(view).to receive(:collected_pens_path).and_return("/collected_pens")
    allow(view).to receive(:collected_inks_path).and_return("/collected_inks")
    allow(view).to receive(:account_path).and_return("/account")
    allow(view).to receive(:collected_pens_archive_index_path).and_return("/collected_pens_archive")
    allow(view).to receive(:currently_inked_archive_index_path).and_return(
      "/currently_inked_archive"
    )
    allow(view).to receive(:usage_records_path).and_return("/usage_records")
    allow(view).to receive(:destroy_user_session_path).and_return("/logout")
    allow(view).to receive(:profile_image).with(size: 100).and_return(
      "<img alt='profile'>".html_safe
    )
    allow(view).to receive(:user_signed_in?).and_return(true)
    allow(view).to receive(:admin?).and_return(false)
    allow(view).to receive(:theme_mode).and_return("dark")
  end

  it "renders theme mode controls and marks the selected mode active" do
    render partial: "layouts/header"

    expect(rendered).to include("Theme")
    expect(rendered).to include('data-theme-mode="auto"')
    expect(rendered).to include('data-theme-mode="dark"')
    expect(rendered).to include('data-theme-mode="light"')
    expect(rendered).to include("dropdown-item active")
  end
end
