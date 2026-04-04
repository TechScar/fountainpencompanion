import React from "react";
import { render } from "@testing-library/react";
import { CollectionLoadingPlaceholder, shouldUseCardLayout } from "./CollectionLoadingPlaceholder";

jest.mock("./CardsPlaceholder", () => ({
  CardsPlaceholder: () => <div data-testid="cards-placeholder" />
}));

jest.mock("./TablePlaceholder", () => ({
  TablePlaceholder: () => <div data-testid="table-placeholder" />
}));

describe("<CollectionLoadingPlaceholder />", () => {
  it("renders cards placeholder when showCards is true", () => {
    const { queryByTestId } = render(<CollectionLoadingPlaceholder showCards={true} />);

    expect(queryByTestId("cards-placeholder")).toBeVisible();
    expect(queryByTestId("table-placeholder")).toBeNull();
  });

  it("renders table placeholder when showCards is false", () => {
    const { queryByTestId } = render(<CollectionLoadingPlaceholder showCards={false} />);

    expect(queryByTestId("table-placeholder")).toBeVisible();
    expect(queryByTestId("cards-placeholder")).toBeNull();
  });
});

describe("shouldUseCardLayout", () => {
  it("returns true when layout is card", () => {
    expect(shouldUseCardLayout("card", false)).toBe(true);
  });

  it("returns true when layout is unset and screen is small", () => {
    expect(shouldUseCardLayout(undefined, true)).toBe(true);
  });

  it("returns false when layout is table", () => {
    expect(shouldUseCardLayout("table", true)).toBe(false);
  });

  it("returns false when layout is unset and screen is not small", () => {
    expect(shouldUseCardLayout(undefined, false)).toBe(false);
  });
});
