import React from "react";
import { render } from "@testing-library/react";
import { WithLink } from "./WithLink";

describe("WithLink", () => {
  it("renders children in a span if no href is provided", () => {
    const { getByText } = render(<WithLink>Plain text</WithLink>);
    const el = getByText("Plain text");
    expect(el.tagName).toBe("SPAN");
  });

  it("renders children in an anchor if href is provided", () => {
    const { getByText } = render(<WithLink href="https://example.com">External</WithLink>);
    const el = getByText("External");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "https://example.com");
  });
});
