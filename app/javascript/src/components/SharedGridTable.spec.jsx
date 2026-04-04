import React from "react";
import { render, screen } from "@testing-library/react";
import { SharedGridTable, renderCountFooter } from "./SharedGridTable";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "brand", header: "Brand" }
];

const data = [
  { name: "Sepia", brand: "Diamine" },
  { name: "Cerulean Blue", brand: "Pilot" }
];

describe("<SharedGridTable />", () => {
  it("renders all data rows", () => {
    render(<SharedGridTable columns={columns} data={data} />);
    expect(screen.getByText("Sepia")).toBeInTheDocument();
    expect(screen.getByText("Cerulean Blue")).toBeInTheDocument();
    expect(screen.getByText("Diamine")).toBeInTheDocument();
    expect(screen.getByText("Pilot")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<SharedGridTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders no data rows when data is empty", () => {
    render(<SharedGridTable columns={columns} data={[]} />);
    expect(screen.queryAllByRole("row").filter((row) => row.closest("tbody"))).toHaveLength(0);
  });

  it("hides columns listed in hiddenFields", () => {
    render(<SharedGridTable columns={columns} data={data} hiddenFields={["brand"]} />);
    expect(screen.getByText("Sepia")).toBeInTheDocument();
    expect(screen.queryByText("Diamine")).not.toBeInTheDocument();
  });

  it("wraps output in a fpc-table-grid div", () => {
    const { container } = render(<SharedGridTable columns={columns} data={data} />);
    expect(container.firstChild).toHaveClass("fpc-table-grid");
  });
});

describe("renderCountFooter", () => {
  it("renders a singular count label", () => {
    render(renderCountFooter(1, "pen"));
    expect(screen.getByText("1 pen")).toBeInTheDocument();
  });

  it("renders a plural count label", () => {
    render(renderCountFooter(3, "pen"));
    expect(screen.getByText("3 pens")).toBeInTheDocument();
  });

  it("renders a custom plural form", () => {
    render(renderCountFooter(2, "person", "people"));
    expect(screen.getByText("2 people")).toBeInTheDocument();
  });
});
