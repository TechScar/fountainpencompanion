import React from "react";
import { render } from "@testing-library/react";
import { CollectedInksCards } from "./CollectedInksCards";

const setup = (jsx, options) => {
  return {
    ...render(jsx, options)
  };
};

describe("<CollectedInksCards />", () => {
  const inks = [
    {
      id: "4",
      brand_name: "Sailor",
      line_name: "Shikiori",
      ink_name: "Yozakura",
      maker: "Sailor",
      color: "#ac54b5",
      archived_on: null,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      kind: "bottle",
      private: false,
      private_comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      simplified_brand_name: "sailor",
      simplified_ink_name: "yozakura",
      simplified_line_name: "shikiori",
      swabbed: true,
      used: true,
      archived: false,
      ink_id: 3,
      usage: 2,
      daily_usage: 1,
      tags: [
        { id: "1", type: "tag", name: "maximum" },
        { id: "2", type: "tag", name: "taggage" }
      ]
    }
  ];

  it("renders", async () => {
    const { findByText } = setup(<CollectedInksCards inks={inks} hiddenFields={[]} />);

    const result = await findByText("Sailor Shikiori Yozakura");

    expect(result).toBeInTheDocument();
  });

  it("hides fields specified in hiddenFields prop", () => {
    const { queryByTestId } = setup(
      <CollectedInksCards inks={inks} hiddenFields={["usage", "daily_usage"]} />
    );

    expect(queryByTestId("usage")).not.toBeInTheDocument();
  });
});
