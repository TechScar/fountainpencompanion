import React from "react";
import { render } from "@testing-library/react";
import { SharedGridCards } from "./SharedGridCards";

describe("<SharedGridCards />", () => {
  it("renders inside a fpc-cards-grid div", () => {
    const { container } = render(
      <SharedGridCards data={[]} hiddenFields={[]} renderCard={() => null} />
    );
    expect(container.firstChild).toHaveClass("fpc-cards-grid");
  });

  it("calls renderCard for each item in data", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const renderCard = jest.fn((row, i) => <div key={i}>{row.id}</div>);
    render(<SharedGridCards data={data} hiddenFields={[]} renderCard={renderCard} />);
    expect(renderCard).toHaveBeenCalledTimes(2);
    expect(renderCard).toHaveBeenCalledWith({ id: 1 }, 0, []);
    expect(renderCard).toHaveBeenCalledWith({ id: 2 }, 1, []);
  });

  it("passes hiddenFields to renderCard", () => {
    const data = [{ id: 1 }];
    const renderCard = jest.fn((row, i) => <div key={i}>{row.id}</div>);
    render(<SharedGridCards data={data} hiddenFields={["color"]} renderCard={renderCard} />);
    expect(renderCard).toHaveBeenCalledWith({ id: 1 }, 0, ["color"]);
  });

  it("renders nothing inside the grid when data is empty", () => {
    const { container } = render(
      <SharedGridCards data={[]} hiddenFields={[]} renderCard={() => null} />
    );
    expect(container.firstChild.childNodes).toHaveLength(0);
  });
});
