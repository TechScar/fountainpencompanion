import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("<Card />", () => {
  it("renders base classes and merges className", () => {
    render(
      <Card className="custom-card" data-testid="card-root">
        Content
      </Card>
    );

    const node = screen.getByTestId("card-root");
    expect(node).toHaveClass("card");
    expect(node).toHaveClass("fpc-card");
    expect(node).toHaveClass("custom-card");
    expect(node).toHaveTextContent("Content");
  });

  it("forwards arbitrary props", () => {
    render(
      <Card data-testid="card-root" id="card-id" aria-label="Card root">
        Content
      </Card>
    );

    const node = screen.getByTestId("card-root");
    expect(node).toHaveAttribute("id", "card-id");
    expect(node).toHaveAttribute("aria-label", "Card root");
  });
});

describe("Card subcomponents", () => {
  it("renders Card.Image with expected base class", () => {
    render(<Card.Image data-testid="image" className="extra" />);
    const node = screen.getByTestId("image");
    expect(node).toHaveClass("card-img-top");
    expect(node).toHaveClass("extra");
  });

  it("renders Card.Header with expected base class", () => {
    render(<Card.Header data-testid="header" className="extra" />);
    const node = screen.getByTestId("header");
    expect(node).toHaveClass("card-header");
    expect(node).toHaveClass("extra");
  });

  it("renders Card.Title as paragraph with expected class", () => {
    render(<Card.Title data-testid="title">Title</Card.Title>);
    const node = screen.getByTestId("title");
    expect(node.tagName).toBe("P");
    expect(node).toHaveClass("h5");
    expect(node).toHaveClass("card-title");
    expect(node).toHaveTextContent("Title");
  });

  it("renders Card.Body with expected base class", () => {
    render(<Card.Body data-testid="body">Body</Card.Body>);
    const node = screen.getByTestId("body");
    expect(node).toHaveClass("card-body");
    expect(node).toHaveTextContent("Body");
  });

  it("renders Card.Text as paragraph with expected class", () => {
    render(<Card.Text data-testid="text">Text</Card.Text>);
    const node = screen.getByTestId("text");
    expect(node.tagName).toBe("P");
    expect(node).toHaveClass("card-text");
    expect(node).toHaveTextContent("Text");
  });

  it("renders Card.Footer with expected base class", () => {
    render(<Card.Footer data-testid="footer">Footer</Card.Footer>);
    const node = screen.getByTestId("footer");
    expect(node).toHaveClass("card-footer");
    expect(node).toHaveTextContent("Footer");
  });
});
