import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CollectedPensTable } from "./CollectedPensTable";

const setup = (jsx, options) => {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
};

const noop = () => {};

describe("<CollectedPensTable />", () => {
  const pens = [
    {
      brand: "Faber-Castell",
      model: "Loom",
      nib: "B",
      color: "gunmetal",
      comment: "some comment",
      usage: 1,
      daily_usage: 2,
      last_used_on: "2023-01-15",
      created_at: "2022-06-01",
      model_variant_id: 123
    },
    {
      brand: "Faber-Castell",
      model: "Ambition",
      nib: "EF",
      color: "red",
      comment: "",
      usage: null,
      daily_usage: null,
      last_used_on: null,
      created_at: "2022-07-15",
      model_variant_id: null
    },
    {
      brand: "Majohn",
      model: "Q1",
      nib: "fude",
      color: "gold",
      comment: null,
      usage: 5,
      daily_usage: 1,
      last_used_on: "2023-02-10",
      created_at: "2022-08-20",
      model_variant_id: 456
    }
  ];

  it("renders the pens", () => {
    const { queryByText } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );
    expect(queryByText("Loom")).toBeDefined();
    expect(queryByText("Ambition")).toBeDefined();
    expect(queryByText("Q1")).toBeDefined();
  });

  it("renders the action buttons", () => {
    const { getAllByTitle } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );
    expect(getAllByTitle("Edit 'Faber-Castell Loom'")).toHaveLength(1);
    expect(getAllByTitle("Edit 'Faber-Castell Ambition'")).toHaveLength(1);
    expect(getAllByTitle("Edit 'Majohn Q1'")).toHaveLength(1);
    expect(getAllByTitle("Archive 'Faber-Castell Loom'")).toHaveLength(1);
  });

  it("renders the correct footers", () => {
    const { queryByText } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );
    expect(queryByText("2 brands")).toBeDefined();
    expect(queryByText("3 pens")).toBeDefined();
  });

  it("hides columns specified in hiddenFields prop", () => {
    const { queryByText } = setup(
      <CollectedPensTable pens={pens} hiddenFields={["usage"]} onHiddenFieldsChange={noop} />
    );

    expect(queryByText("Usage")).not.toBeInTheDocument();
  });

  it("sorts descending for the usage column", async () => {
    const { getAllByRole, user } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );
    const headerCell = getAllByRole("columnheader").find(
      (e) => e.innerHTML.includes("Usage") && !e.innerHTML.includes("Daily Usage")
    );

    if (!headerCell) {
      throw new Error("Could not find header cell");
    }

    await user.click(headerCell);
    expect(getAllByRole("row")[1]).toHaveTextContent(/Q1/);
    await user.click(headerCell);
    expect(getAllByRole("row")[1]).toHaveTextContent(/Ambition/);
  });

  it("sorts descending for the daily usage column", async () => {
    const { getAllByRole, user } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );
    const headerCell = getAllByRole("columnheader").find((e) =>
      e.innerHTML.includes("Daily Usage")
    );

    if (!headerCell) {
      throw new Error("Could not find header cell");
    }

    await user.click(headerCell);
    expect(getAllByRole("row")[1]).toHaveTextContent(/Loom/);
    await user.click(headerCell);
    expect(getAllByRole("row")[1]).toHaveTextContent(/Ambition/);
  });

  it("null usage values sort correctly", async () => {
    const { getAllByRole, user } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const headerCell = getAllByRole("columnheader").find(
      (e) => e.innerHTML.includes("Usage") && !e.innerHTML.includes("Daily Usage")
    );

    if (!headerCell) {
      throw new Error("Could not find header cell");
    }

    await user.click(headerCell);
    const rowsDesc = getAllByRole("row");
    expect(rowsDesc[1]).toHaveTextContent(/Q1/);

    await user.click(headerCell);
    const rowsAsc = getAllByRole("row");
    expect(rowsAsc[1]).toHaveTextContent(/Ambition/);
    expect(rowsAsc[2]).toHaveTextContent(/Loom/);
    expect(rowsAsc[3]).toHaveTextContent(/Q1/);
  });

  it("brand counting with varied data", () => {
    const pensWithDuplicateBrands = [
      ...pens,
      {
        brand: "Faber-Castell",
        model: "Essentio",
        nib: "M",
        color: "black",
        comment: "",
        usage: 0,
        daily_usage: 0,
        last_used_on: null,
        created_at: "2023-01-01",
        model_variant_id: null
      }
    ];

    const { getByText } = setup(
      <CollectedPensTable
        pens={pensWithDuplicateBrands}
        hiddenFields={[]}
        onHiddenFieldsChange={noop}
      />
    );

    expect(getByText("2 brands")).toBeInTheDocument();
    expect(getByText("4 pens")).toBeInTheDocument();
  });

  it("comment column renders correctly", () => {
    const { container } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    expect(container).toHaveTextContent("some comment");
  });

  it("sorting multiple times toggles direction correctly", async () => {
    const { getAllByRole, user } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const headerCell = getAllByRole("columnheader").find((e) => e.innerHTML.includes("Brand"));

    if (!headerCell) {
      throw new Error("Could not find Brand header cell");
    }

    await user.click(headerCell);
    let rows = getAllByRole("row");
    expect(rows[1]).toHaveTextContent(/Faber-Castell/);

    await user.click(headerCell);
    rows = getAllByRole("row");
    expect(rows[1]).toHaveTextContent(/Majohn/);

    await user.click(headerCell);
    rows = getAllByRole("row");
    expect(rows[1]).toHaveTextContent(/Loom/);
  });

  it("model variant link renders when model_variant_id exists", () => {
    const { container } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    const modelLinks = container.querySelectorAll('a[href*="/pen_variants/"]');
    expect(modelLinks.length).toBe(2);
    expect(modelLinks[0].getAttribute("href")).toBe("/pen_variants/123");
    expect(modelLinks[1].getAttribute("href")).toBe("/pen_variants/456");
  });

  it("model renders without link when model_variant_id is null", () => {
    const { container, getByText } = setup(
      <CollectedPensTable pens={pens} hiddenFields={[]} onHiddenFieldsChange={noop} />
    );

    expect(getByText("Ambition")).toBeInTheDocument();

    const modelLinks = container.querySelectorAll('a[href*="/pen_variants/"]');
    expect(modelLinks.length).toBe(2);
  });
});
