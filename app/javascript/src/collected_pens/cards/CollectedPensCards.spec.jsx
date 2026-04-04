import React from "react";
import { render } from "@testing-library/react";
import { CollectedPensCards } from "./CollectedPensCards";

const setup = (jsx, options) => {
  return {
    ...render(jsx, options)
  };
};

describe("<CollectedPensCards />", () => {
  const pens = [
    {
      brand: "Faber-Castell",
      model: "Loom",
      nib: "B",
      color: "gunmetal",
      comment: "some comment",
      usage: 1,
      daily_usage: 2
    },
    {
      brand: "Faber-Castell",
      model: "Ambition",
      nib: "EF",
      color: "red",
      comment: "",
      usage: null,
      daily_usage: null
    },
    {
      brand: "Majohn",
      model: "Q1",
      nib: "fude",
      color: "gold",
      comment: null,
      usage: 5,
      daily_usage: 1
    }
  ];

  it("renders", async () => {
    const { findByText } = setup(<CollectedPensCards pens={pens} hiddenFields={[]} />);

    const result = await findByText("Faber-Castell Loom");

    expect(result).toBeInTheDocument();
  });

  it("hides fields specified in hiddenFields prop", () => {
    const { queryAllByTestId } = setup(
      <CollectedPensCards pens={pens} hiddenFields={["usage", "daily_usage", "last_used_on"]} />
    );

    expect(queryAllByTestId("usage")).toEqual([]);
  });
});
