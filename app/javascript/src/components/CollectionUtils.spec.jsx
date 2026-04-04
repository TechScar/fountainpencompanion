import { pluralizedCountLabel } from "./CollectionUtils";

describe("CollectionCount", () => {
  it("pluralizes labels with the default plural form", () => {
    expect(pluralizedCountLabel(1, "pen")).toEqual("1 pen");
    expect(pluralizedCountLabel(2, "pen")).toEqual("2 pens");
  });

  it("supports an explicit plural form", () => {
    expect(pluralizedCountLabel(2, "person", "people")).toEqual("2 people");
  });
});
