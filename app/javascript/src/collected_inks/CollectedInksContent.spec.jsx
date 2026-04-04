import React from "react";
import { render } from "@testing-library/react";
import { CollectedInksContent } from "./CollectedInksContent";

const noop = () => {};

const setup = (props) => {
  return render(<CollectedInksContent onLayoutChange={noop} {...props} />);
};

describe("<CollectedInksContent />", () => {
  afterEach(() => localStorage.clear());

  const ink = {
    id: "4",
    brand_name: "Sailor",
    line_name: "Shikiori",
    ink_name: "Yozakura",
    maker: "Sailor",
    color: "#ac54b5",
    archived_on: null,
    comment: null,
    kind: "bottle",
    private: false,
    private_comment: null,
    simplified_brand_name: "sailor",
    simplified_ink_name: "yozakura",
    simplified_line_name: "shikiori",
    swabbed: true,
    used: true,
    archived: false,
    ink_id: 3,
    usage: 2,
    daily_usage: 1,
    tags: [],
    cluster_tags: []
  };

  it("renders the empty state for a non-archive collection", () => {
    const { getByText } = setup({ inks: [], archive: false, showCards: true });
    expect(getByText(/your ink collection is empty/i)).toBeInTheDocument();
  });

  it("renders the empty state for an archive collection", () => {
    const { getByText } = setup({ inks: [], archive: true, showCards: true });
    expect(getByText(/your ink archive is empty/i)).toBeInTheDocument();
  });

  it("renders cards when showCards is true", async () => {
    const { findByText, queryByRole } = setup({
      inks: [ink],
      archive: false,
      showCards: true
    });
    await findByText("Sailor Shikiori Yozakura");
    expect(queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table when showCards is false", async () => {
    const { findByRole } = setup({ inks: [ink], archive: false, showCards: false });
    await findByRole("table");
  });
});
