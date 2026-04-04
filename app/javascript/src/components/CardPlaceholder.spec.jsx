import React from "react";
import { render } from "@testing-library/react";
import { CardPlaceholder } from "./CardPlaceholder";

describe("<CardPlaceholder />", () => {
  it("renders placeholder sections for title, text, and actions", () => {
    const { container } = render(<CardPlaceholder />);

    const placeholders = container.querySelectorAll(".placeholder");
    expect(placeholders).toHaveLength(5);

    const primaryAction = container.querySelector(".placeholder.col-4.bg-primary");
    const secondaryAction = container.querySelector(".placeholder.col-2.bg-secondary");

    expect(primaryAction).toBeInTheDocument();
    expect(secondaryAction).toBeInTheDocument();
  });
});
