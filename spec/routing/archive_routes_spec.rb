require "rails_helper"

describe "Archive routes", type: :routing do
  it "routes collected inks archive index" do
    expect(get: "/collected_inks/archive").to route_to("collected_inks_archive#index")
  end

  it "routes collected inks archive unarchive member action" do
    expect(post: "/collected_inks/archive/1/unarchive").to route_to(
      "collected_inks_archive#unarchive",
      id: "1"
    )
  end

  it "routes collected pens archive index" do
    expect(get: "/collected_pens/archive").to route_to("collected_pens_archive#index")
  end

  it "routes currently inked archive unarchive member action" do
    expect(post: "/currently_inked/archive/1/unarchive").to route_to(
      "currently_inked_archive#unarchive",
      id: "1"
    )
  end

  it "routes usage records index" do
    expect(get: "/usage_records").to route_to("usage_records#index")
  end
end
