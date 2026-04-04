import React from "react";
import { render, screen } from "@testing-library/react";
import { ActionsCell } from "./ActionsCell";

describe("<ActionsCell />", () => {
  describe("non-archived ink", () => {
    beforeEach(() => {
      render(
        <ActionsCell
          id={1}
          brand_name="Pilot"
          line_name="Iroshizuku"
          ink_name="Kon-peki"
          kind="bottle"
          archived={false}
        />
      );
    });

    it("includes a link to the edit page with the combined display name", () => {
      expect(
        screen.getByTitle("Edit 'Pilot Iroshizuku Kon-peki - bottle'").getAttribute("href")
      ).toBe("/collected_inks/1/edit");
    });

    it("includes an archive button that submits to the archive URL", () => {
      const button = screen.getByTitle("Archive 'Pilot Iroshizuku Kon-peki - bottle'");
      expect(button.getAttribute("href")).toBe("/collected_inks/1/archive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("does not show unarchive or delete actions", () => {
      expect(
        screen.queryByTitle("Unarchive 'Pilot Iroshizuku Kon-peki - bottle'")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTitle("Delete 'Pilot Iroshizuku Kon-peki - bottle'")
      ).not.toBeInTheDocument();
    });
  });

  describe("archived ink", () => {
    beforeEach(() => {
      render(
        <ActionsCell
          id={1}
          brand_name="Pilot"
          line_name="Iroshizuku"
          ink_name="Kon-peki"
          archived={true}
        />
      );
    });

    it("includes a link to the archive edit page", () => {
      expect(
        screen.getByTitle("Edit 'Pilot Iroshizuku Kon-peki (archived)'").getAttribute("href")
      ).toBe("/collected_inks/archive/1/edit");
    });

    it("includes an unarchive button that submits to the unarchive URL", () => {
      const button = screen.getByTitle("Unarchive 'Pilot Iroshizuku Kon-peki (archived)'");
      expect(button.getAttribute("href")).toBe("/collected_inks/archive/1/unarchive");
      expect(button.getAttribute("data-method")).toBe("post");
    });

    it("includes a delete button that submits as delete", () => {
      const button = screen.getByTitle("Delete 'Pilot Iroshizuku Kon-peki (archived)'");
      expect(button.getAttribute("href")).toBe("/collected_inks/1");
      expect(button.getAttribute("data-method")).toBe("delete");
    });

    it("does not show an archive action", () => {
      expect(screen.queryByTitle("Archive 'Pilot Iroshizuku Kon-peki'")).not.toBeInTheDocument();
    });
  });
});
