import React from "react";
import { render } from "@testing-library/react";
import { CurrentlyInkedCards } from "./CurrentlyInkedCards";

const setup = (jsx, options) => {
  return {
    ...render(jsx, options)
  };
};

describe("<CurrentlyInkedCards />", () => {
  const currentlyInked = [
    {
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
    }
  ];

  it("renders", async () => {
    const { findByText } = setup(
      <CurrentlyInkedCards
        currentlyInked={currentlyInked}
        hiddenFields={[]}
        onUsageRecorded={() => {}}
      />
    );

    const result = await findByText("Sailor Shikiori Yozakura");

    expect(result).toBeInTheDocument();
  });

  it("hides pen_name when specified in hiddenFields prop", () => {
    const { queryByText } = setup(
      <CurrentlyInkedCards
        currentlyInked={currentlyInked}
        hiddenFields={["pen_name"]}
        onUsageRecorded={() => {}}
      />
    );

    expect(queryByText("Sailor Pro Gear, Black, M")).not.toBeInTheDocument();
  });
});
