import React from "react";
import { render } from "@testing-library/react";
import { CollectionEmptyStateAlert } from "./CollectionEmptyStateAlert";

describe("CollectionEmptyStateAlert", () => {
  it("renders children inside the alert", () => {
    const { getByText, container } = render(
      <CollectionEmptyStateAlert>
        <span>Your collection is empty. What a sad state.</span>
      </CollectionEmptyStateAlert>
    );
    expect(getByText("Your collection is empty. What a sad state.")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("alert");
    expect(container.firstChild).toHaveClass("alert-secondary");
  });
});
