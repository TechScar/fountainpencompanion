import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { CollectionEntryActions } from "./CollectionEntryActions";

const defaultProps = {
  name: "Faber-Castell Loom",
  editHref: "/items/1/edit",
  archiveHref: "/items/1/archive",
  unarchiveHref: "/items/1/unarchive",
  deleteHref: "/items/1"
};

describe("<CollectionEntryActions />", () => {
  describe("non-archived", () => {
    beforeEach(() => {
      render(<CollectionEntryActions {...defaultProps} archived={false} />);
    });

    it("shows an edit link pointing to editHref", () => {
      expect(screen.getByTitle("Edit 'Faber-Castell Loom'").getAttribute("href")).toBe(
        "/items/1/edit"
      );
    });

    it("shows an archive button that submits to archiveHref", () => {
      const button = screen.getByTitle("Archive 'Faber-Castell Loom'");
      expect(button.getAttribute("href")).toBe("/items/1/archive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("does not show unarchive or delete links", () => {
      expect(screen.queryByTitle("Unarchive 'Faber-Castell Loom'")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Delete 'Faber-Castell Loom'")).not.toBeInTheDocument();
    });
  });

  describe("archived", () => {
    beforeEach(() => {
      render(<CollectionEntryActions {...defaultProps} archived={true} />);
    });

    it("shows an edit link pointing to editHref", () => {
      expect(screen.getByTitle("Edit 'Faber-Castell Loom'").getAttribute("href")).toBe(
        "/items/1/edit"
      );
    });

    it("shows an unarchive button that submits to unarchiveHref", () => {
      const button = screen.getByTitle("Unarchive 'Faber-Castell Loom'");
      expect(button.getAttribute("href")).toBe("/items/1/unarchive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("shows a delete button that submits to deleteHref with method override", () => {
      const button = screen.getByTitle("Delete 'Faber-Castell Loom'");
      expect(button.getAttribute("href")).toBe("/items/1");
      expect(button.getAttribute("data-method")).toBe("delete");
    });

    it("does not show an archive link", () => {
      expect(screen.queryByTitle("Archive 'Faber-Castell Loom'")).not.toBeInTheDocument();
    });

    it("can hide the unarchive link", () => {
      cleanup();

      const { queryByTitle } = render(
        <CollectionEntryActions {...defaultProps} archived={true} showUnarchive={false} />
      );

      expect(queryByTitle("Unarchive 'Faber-Castell Loom'")).not.toBeInTheDocument();
    });
  });
});
