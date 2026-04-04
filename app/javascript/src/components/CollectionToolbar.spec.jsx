import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollectionToolbar } from "./CollectionToolbar";

const defaultProps = {
  hiddenFields: [],
  onHiddenFieldsChange: jest.fn(),
  switchFields: [{ name: "color", label: "Color" }],
  searchValue: "",
  onSearchChange: jest.fn(),
  searchPlaceholder: "Search inks..."
};

describe("<CollectionToolbar />", () => {
  it("renders the search input with placeholder", () => {
    render(<CollectionToolbar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search inks...")).toBeInTheDocument();
  });

  it("calls onSearchChange with the typed value when the search input changes", () => {
    const onSearchChange = jest.fn();
    render(<CollectionToolbar {...defaultProps} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText("Search inks..."), {
      target: { value: "Diamine" }
    });
    expect(onSearchChange).toHaveBeenCalledWith("Diamine");
  });

  it("calls onSearchChange with undefined when the search input is cleared", () => {
    const onSearchChange = jest.fn();
    render(
      <CollectionToolbar {...defaultProps} searchValue="Diamine" onSearchChange={onSearchChange} />
    );
    fireEvent.change(screen.getByPlaceholderText("Search inks..."), { target: { value: "" } });
    expect(onSearchChange).toHaveBeenCalledWith(undefined);
  });

  it("renders switchFields labels in the dropdown form", () => {
    render(
      <CollectionToolbar
        {...defaultProps}
        switchFields={[
          { name: "brand", label: "Brand" },
          { name: "color", label: "Color" }
        ]}
      />
    );
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();
  });

  it("renders links when provided", () => {
    render(
      <CollectionToolbar
        {...defaultProps}
        links={[{ href: "/collected_inks/archive", label: "Archive" }]}
      />
    );
    const link = screen.getByText("Archive");
    expect(link).toHaveAttribute("href", "/collected_inks/archive");
  });

  it("renders the add button when addHref is provided", () => {
    render(
      <CollectionToolbar {...defaultProps} addHref="/collected_inks/new" addLabel="Add ink" />
    );
    expect(screen.getByText("Add ink")).toHaveAttribute("href", "/collected_inks/new");
  });

  it("does not render the add button when addHref is not provided", () => {
    render(<CollectionToolbar {...defaultProps} addLabel="Add ink" />);
    expect(screen.queryByText("Add ink")).not.toBeInTheDocument();
  });

  it("renders the layout toggle when activeLayout is provided", () => {
    render(<CollectionToolbar {...defaultProps} activeLayout="table" onLayoutChange={jest.fn()} />);
    expect(screen.getByRole("group", { name: "Choose layout" })).toBeInTheDocument();
  });

  it("does not render the layout toggle when activeLayout is not provided", () => {
    render(<CollectionToolbar {...defaultProps} />);
    expect(screen.queryByRole("group", { name: "Choose layout" })).not.toBeInTheDocument();
  });

  it("calls onHiddenFieldsChange with null when 'Restore defaults' is clicked", () => {
    const onHiddenFieldsChange = jest.fn();
    render(<CollectionToolbar {...defaultProps} onHiddenFieldsChange={onHiddenFieldsChange} />);
    fireEvent.click(screen.getByText("Restore defaults"));
    expect(onHiddenFieldsChange).toHaveBeenCalledWith(null);
  });
});
