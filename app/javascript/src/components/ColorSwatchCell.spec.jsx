import React from "react";
import { render } from "@testing-library/react";
import { ColorSwatchCell } from "./ColorSwatchCell";

describe("<ColorSwatchCell />", () => {
  it("renders a div with the color-swatch-cell class", () => {
    const { container } = render(<ColorSwatchCell value="#ff0000" />);
    expect(container.firstChild).toHaveClass("color-swatch-cell");
  });

  it("applies the given value as the background color", () => {
    const { container } = render(<ColorSwatchCell value="#ff0000" />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("renders without a color when value is not provided", () => {
    const { container } = render(<ColorSwatchCell />);
    expect(container.firstChild).toHaveClass("color-swatch-cell");
  });
});
