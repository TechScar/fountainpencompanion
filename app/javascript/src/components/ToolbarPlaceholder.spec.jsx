import React from "react";
import { render, screen } from "@testing-library/react";
import { ToolbarPlaceholder } from "./ToolbarPlaceholder";

describe("<ToolbarPlaceholder />", () => {
  it("renders the toolbar placeholder", () => {
    render(<ToolbarPlaceholder />);
    expect(screen.getByTestId("toolbar-placeholder")).toBeInTheDocument();
  });

  it("renders five placeholder elements inside", () => {
    const { getByTestId } = render(<ToolbarPlaceholder />);
    expect(getByTestId("toolbar-placeholder").childNodes).toHaveLength(5);
  });
});
