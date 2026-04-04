import { render } from "@testing-library/react";
import {
  currentlyInkedCollectionEmptyStateMessage,
  inkCollectionEmptyStateMessage,
  penCollectionEmptyStateMessage
} from "./collectionEmptyStateMessages";

describe("currentlyInkedCollectionEmptyStateMessage", () => {
  it("returns archive message when archive is true", () => {
    const { getByText } = render(currentlyInkedCollectionEmptyStateMessage(true));
    expect(getByText("Your currently inked archive is empty.")).toBeInTheDocument();
  });

  it("returns active message when archive is false", () => {
    const { getByText } = render(currentlyInkedCollectionEmptyStateMessage(false));
    expect(getByText("You currently have no inked pens.")).toBeInTheDocument();
  });
});

describe("inkCollectionEmptyStateMessage", () => {
  it("returns archive message when archive is true", () => {
    const { getByText } = render(inkCollectionEmptyStateMessage(true));
    expect(getByText("Your ink archive is empty.")).toBeInTheDocument();
  });

  it("returns active message with documentation link when archive is false", () => {
    const { getByText } = render(inkCollectionEmptyStateMessage(false));
    expect(getByText("documentation")).toHaveAttribute("href", "/pages/guide");
  });
});

describe("penCollectionEmptyStateMessage", () => {
  it("returns archive message when archive is true", () => {
    const { getByText } = render(penCollectionEmptyStateMessage(true));
    expect(getByText("Your pen archive is empty.")).toBeInTheDocument();
  });

  it("returns active message when archive is false", () => {
    const { getByText } = render(penCollectionEmptyStateMessage(false));
    expect(getByText("Your pen collection is empty.")).toBeInTheDocument();
  });
});
