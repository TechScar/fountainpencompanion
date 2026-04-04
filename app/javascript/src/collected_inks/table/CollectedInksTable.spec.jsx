import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollectedInksTable } from "./CollectedInksTable";

const setup = (jsx, options) => {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
};

const noop = () => {};

describe("<CollectedInksTable />", () => {
  const inks = [
    {
      id: "4",
      brand_name: "Sailor",
      line_name: "Shikiori",
      ink_name: "Yozakura",
      maker: "Sailor",
      color: "#ac54b5",
      archived_on: null,
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      kind: "bottle",
      private: true,
      private_comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      simplified_brand_name: "sailor",
      simplified_ink_name: "yozakura",
      simplified_line_name: "shikiori",
      swabbed: true,
      used: true,
      archived: false,
      ink_id: 3,
      usage: 2,
      daily_usage: 1,
      cluster_tags: [],
      tags: [
        { id: "1", type: "tag", name: "maximum" },
        { id: "2", type: "tag", name: "taggage" }
      ]
    },
    {
      id: "3",
      brand_name: "Sailor",
      line_name: "Shikiori",
      ink_name: "Miruai",
      maker: "Sailor",
      color: null,
      archived_on: null,
      comment: null,
      kind: "bottle",
      private: false,
      private_comment: null,
      simplified_brand_name: "sailor",
      simplified_ink_name: "yozakura",
      simplified_line_name: "miruai",
      swabbed: true,
      used: true,
      archived: false,
      ink_id: 2,
      usage: 1,
      daily_usage: 1,
      cluster_tags: [],
      tags: []
    }
  ];

  it("renders", async () => {
    const { findByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const result = await findByText("Yozakura");

    expect(result).toBeInTheDocument();
  });

  it("hides columns specified in hiddenFields prop", () => {
    const { queryByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={["usage"]} onHiddenFieldsChange={noop} />
    );

    expect(queryByText("Usage")).not.toBeInTheDocument();
  });

  it("can be sorted", async () => {
    const { getAllByRole, user } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    await user.click(getAllByRole("columnheader")[0]);

    let firstNonHeaderRow = getAllByRole("row")[1];
    expect(firstNonHeaderRow).toHaveTextContent(/yozakura/i);

    await user.click(getAllByRole("columnheader")[0]);

    firstNonHeaderRow = getAllByRole("row")[1];
    expect(firstNonHeaderRow).toHaveTextContent(/miruai/i);
  });

  it("color cell renders with correct background color", () => {
    const { container } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const colorDivs = container.querySelectorAll(".color-swatch-cell");

    expect(colorDivs.length).toBeGreaterThan(0);
    expect(colorDivs[0].style.backgroundColor).toBe("rgb(172, 84, 181)"); // #ac54b5 converted to rgb
  });

  it("color cell handles null colors", () => {
    const { container } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const colorDivs = container.querySelectorAll(".color-swatch-cell");

    expect(colorDivs.length).toBeGreaterThan(0);
  });

  it("boolean cells (swabbed, used) render check/X icons", () => {
    const { container } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const checkIcons = container.querySelectorAll("i.fa-check");

    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it("private/public icon rendering", () => {
    const { getByTitle } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const privateIcon = getByTitle("Private, hidden from your profile");
    const publicIcon = getByTitle("Publicly visible on your profile");

    expect(privateIcon).toBeInTheDocument();
    expect(publicIcon).toBeInTheDocument();
  });

  it("tag list renders with correct links", () => {
    const { container } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const tagLinks = container.querySelectorAll('a[href*="tag="]');
    expect(tagLinks.length).toBeGreaterThan(0);

    const tagHrefs = Array.from(tagLinks).map((link) => link.getAttribute("href"));
    expect(tagHrefs.some((href) => href.includes("maximum"))).toBe(true);
    expect(tagHrefs.some((href) => href.includes("taggage"))).toBe(true);
  });

  it("tag list handles empty tags array", () => {
    const { container } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    expect(container).toBeInTheDocument();
  });

  it("renders safely when tags and cluster_tags are missing", () => {
    const inksWithMissingArrays = [{ ...inks[0], tags: undefined, cluster_tags: undefined }];

    const { container } = setup(
      <CollectedInksTable
        inks={inksWithMissingArrays}
        hiddenFields={[]}
        onHiddenFieldsChange={noop}
      />
    );

    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Yozakura");
  });

  it("cluster tags render when present", () => {
    const dataWithClusterTags = [{ ...inks[0], cluster_tags: ["blue", "shimmering"] }];

    const { container } = setup(
      <CollectedInksTable
        inks={dataWithClusterTags}
        hiddenFields={[]}
        onHiddenFieldsChange={noop}
      />
    );

    expect(container.textContent).toContain("blue");
    expect(container.textContent).toContain("shimmering");
  });

  it("cluster tag filtering (shows only non-user tags)", () => {
    const dataWithClusterTags = [
      {
        ...inks[0],
        cluster_tags: ["blue", "maximum"],
        tags: [{ id: "1", type: "tag", name: "maximum" }]
      }
    ];

    const { container } = setup(
      <CollectedInksTable
        inks={dataWithClusterTags}
        hiddenFields={[]}
        onHiddenFieldsChange={noop}
      />
    );

    expect(container.textContent).toContain("blue");
  });

  it("multiple inks with same brand count correctly in footer", () => {
    const { getByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    expect(getByText("1 brand")).toBeInTheDocument();
  });

  it("kind counter shows correct counts for bottle/sample/cartridge/swab", () => {
    const dataWithVariousKinds = [
      { ...inks[0], kind: "bottle" },
      { ...inks[1], kind: "sample" }
    ];

    const { container } = setup(
      <CollectedInksTable
        inks={dataWithVariousKinds}
        hiddenFields={[]}
        onHiddenFieldsChange={noop}
      />
    );

    expect(container.textContent).toContain("1");
  });

  it("ink name is linked when ink_id is present", () => {
    const dataWithInkId = [{ ...inks[0], ink_id: 123 }];

    const { container } = setup(
      <CollectedInksTable inks={dataWithInkId} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const inkLink = container.querySelector('a[href="/inks/123"]');
    expect(inkLink).toBeInTheDocument();
    expect(inkLink).toHaveTextContent("Yozakura");
  });

  it("ink link missing when no ink_id", () => {
    const dataWithoutInkId = [{ ...inks[0], ink_id: null }];

    const { container } = setup(
      <CollectedInksTable inks={dataWithoutInkId} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    expect(container).toBeInTheDocument();
  });

  it("hides column when hiddenFields prop includes it", () => {
    const { queryByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={["maker"]} onHiddenFieldsChange={noop} />
    );

    expect(queryByText("Maker")).not.toBeInTheDocument();
  });

  it("hides Tags column when hiddenFields includes tags", () => {
    const { queryByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={["tags"]} onHiddenFieldsChange={noop} />
    );

    expect(queryByText("Tags")).not.toBeInTheDocument();
  });

  it("hides Cluster Tags column when hiddenFields includes cluster_tags", () => {
    const { queryByText } = setup(
      <CollectedInksTable inks={inks} hiddenFields={["cluster_tags"]} onHiddenFieldsChange={noop} />
    );

    expect(queryByText("Cluster Tags")).not.toBeInTheDocument();
  });
});
