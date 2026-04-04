import React from "react";
import { render } from "@testing-library/react";
import { CollectedPensContent } from "./CollectedPensContent";

const noop = () => {};

const setup = (props) => {
  return render(<CollectedPensContent onLayoutChange={noop} {...props} />);
};

describe("<CollectedPensContent />", () => {
  afterEach(() => localStorage.clear());

  const pen = {
    brand: "Faber-Castell",
    model: "Loom",
    nib: "B",
    color: "gunmetal",
    comment: "some comment",
    usage: 1,
    daily_usage: 2,
    last_used_on: "2023-01-15",
    created_at: "2022-06-01",
    model_variant_id: 123
  };

  it("renders the empty state for a non-archive collection", () => {
    const { getByText } = setup({ pens: [], archive: false, showCards: true });
    expect(getByText(/your pen collection is empty/i)).toBeInTheDocument();
  });

  it("renders the empty state for an archive collection", () => {
    const { getByText } = setup({ pens: [], archive: true, showCards: true });
    expect(getByText(/your pen archive is empty/i)).toBeInTheDocument();
  });

  it("renders cards when showCards is true", async () => {
    const { findByText, queryByRole } = setup({
      pens: [pen],
      archive: false,
      showCards: true
    });
    await findByText("Faber-Castell Loom");
    expect(queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table when showCards is false", async () => {
    const { findByRole } = setup({ pens: [pen], archive: false, showCards: false });
    await findByRole("table");
  });
});
