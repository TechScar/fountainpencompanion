require "rails_helper"

RSpec.describe "layouts/_theme_initializer", type: :view do
  it "renders the early theme initialization script" do
    render partial: "layouts/theme_initializer"

    expect(rendered).to include("fpc-theme")
    expect(rendered).to include("fpc-theme-mode")
    expect(rendered).to include("window.matchMedia(\"(prefers-color-scheme: dark)\")")
    expect(rendered).to include("document.documentElement.setAttribute(\"data-bs-theme\", theme)")
  end
end
