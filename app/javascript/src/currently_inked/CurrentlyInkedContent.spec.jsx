import React from "react";
import { render } from "@testing-library/react";
import { CurrentlyInkedContent } from "./CurrentlyInkedContent";

const noop = () => {};

const setup = (props) => {
  return render(<CurrentlyInkedContent onLayoutChange={noop} onUsageRecorded={noop} {...props} />);
};

describe("<CurrentlyInkedContent />", () => {
  afterEach(() => localStorage.clear());

  const entry = {
    id: "1",
    inked_on: "2023-01-15",
    archived_on: null,
    comment: "",
    last_used_on: "2023-02-04",
    pen_name: "Sailor Pro Gear, Black, M",
    ink_name: "Sailor Shikiori Yozakura",
    used_today: false,
    daily_usage: 1,
    refillable: true,
    unarchivable: false,
    archived: false,
    collected_ink: {
      color: "#ac54b5",
      micro_cluster: { id: 1 }
    },
    collected_pen: { model_variant_id: 123 }
  };

  it("renders the empty state for a non-archive collection", () => {
    const { getByText } = setup({ currentlyInked: [], archive: false, showCards: true });
    expect(getByText(/you currently have no inked pens/i)).toBeInTheDocument();
  });

  it("renders the empty state for an archive collection", () => {
    const { getByText } = setup({ currentlyInked: [], archive: true, showCards: true });
    expect(getByText(/your currently inked archive is empty/i)).toBeInTheDocument();
  });

  it("renders cards when showCards is true", async () => {
    const { findByText, queryByRole } = setup({
      currentlyInked: [entry],
      archive: false,
      showCards: true
    });
    await findByText("Sailor Shikiori Yozakura");
    expect(queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table when showCards is false", async () => {
    const { findByRole } = setup({ currentlyInked: [entry], archive: false, showCards: false });
    await findByRole("table");
  });
});
