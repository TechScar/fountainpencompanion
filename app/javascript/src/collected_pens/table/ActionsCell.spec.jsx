import React from "react";
import { render, screen } from "@testing-library/react";
import { ActionsCell } from "./ActionsCell";

describe("<ActionsCell />", () => {
  describe("non-archived pen", () => {
    beforeEach(() => {
      render(<ActionsCell id={1} brand="Faber-Castell" model="Loom" archived={false} />);
    });

    it("includes a link to the edit page with the combined display name", () => {
      expect(screen.getByTitle("Edit 'Faber-Castell Loom'").getAttribute("href")).toBe(
        "/collected_pens/1/edit"
      );
    });

    it("includes an archive button that submits to the archive URL", () => {
      const button = screen.getByTitle("Archive 'Faber-Castell Loom'");
      expect(button.getAttribute("href")).toBe("/collected_pens/1/archive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("does not show unarchive or delete links", () => {
      expect(screen.queryByTitle("Unarchive 'Faber-Castell Loom'")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Delete 'Faber-Castell Loom'")).not.toBeInTheDocument();
    });
  });

  describe("archived pen", () => {
    beforeEach(() => {
      render(<ActionsCell id={1} brand="Faber-Castell" model="Loom" archived={true} />);
    });

    it("includes a link to the archive edit page", () => {
      expect(screen.getByTitle("Edit 'Faber-Castell Loom (archived)'").getAttribute("href")).toBe(
        "/collected_pens/archive/1/edit"
      );
    });

    it("includes an unarchive button that submits to the unarchive URL", () => {
      const button = screen.getByTitle("Unarchive 'Faber-Castell Loom (archived)'");
      expect(button.getAttribute("href")).toBe("/collected_pens/archive/1/unarchive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("includes a delete button that submits as delete", () => {
      const button = screen.getByTitle("Delete 'Faber-Castell Loom (archived)'");
      expect(button.getAttribute("href")).toBe("/collected_pens/archive/1");
      expect(button.getAttribute("data-method")).toBe("delete");
    });

    it("does not show an archive link", () => {
      expect(screen.queryByTitle("Archive 'Faber-Castell Loom'")).not.toBeInTheDocument();
    });
  });
});
