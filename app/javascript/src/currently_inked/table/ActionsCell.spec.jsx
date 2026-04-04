import React from "react";
import { render, screen } from "@testing-library/react";
import { ActionsCell } from "./ActionsCell";

describe("<ActionsCell />", () => {
  describe("refill button", () => {
    it("shows the refill button if refilling is possible", async () => {
      render(<ActionsCell id={1} refillable={true} pen_name="Pilot Kakuno" ink_name="Black" />);
      const button = await screen.findByTitle("Refill 'Pilot Kakuno - Black'");
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("href")).toEqual("/currently_inked/1/refill");
    });

    it("does not show the refill button if refilling is not possible", () => {
      render(<ActionsCell id={1} refillable={false} pen_name="Pilot Kakuno" ink_name="Black" />);
      const button = screen.queryByTitle("Refill 'Pilot Kakuno - Black'");
      expect(button).not.toBeInTheDocument();
    });
  });

  describe("edit button", () => {
    it("shows the edit button", async () => {
      render(<ActionsCell id={1} pen_name="Pilot Kakuno" ink_name="Black" />);
      const button = await screen.findByTitle("Edit 'Pilot Kakuno - Black'");
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("href")).toEqual("/currently_inked/1/edit");
    });
  });

  describe("archive button", () => {
    it("shows the archive button", async () => {
      render(<ActionsCell id={1} pen_name="Pilot Kakuno" ink_name="Black" />);
      const button = await screen.findByTitle("Archive 'Pilot Kakuno - Black'");
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("href")).toEqual("/currently_inked/1/archive");
    });
  });

  describe("archived entry", () => {
    it("shows canonical archive edit, unarchive and delete actions", async () => {
      render(
        <ActionsCell
          id={1}
          archived={true}
          pen_name="Pilot Kakuno"
          ink_name="Black"
          unarchivable={true}
        />
      );

      expect(screen.getByTitle("Edit 'Pilot Kakuno - Black'").getAttribute("href")).toEqual(
        "/currently_inked/archive/1/edit"
      );
      expect(screen.getByTitle("Unarchive 'Pilot Kakuno - Black'").getAttribute("href")).toEqual(
        "/currently_inked/archive/1/unarchive"
      );
      expect(screen.getByTitle("Delete 'Pilot Kakuno - Black'").getAttribute("href")).toEqual(
        "/currently_inked/archive/1"
      );
    });

    it("can hide unarchive when the entry is not unarchivable", () => {
      render(
        <ActionsCell
          id={1}
          archived={true}
          pen_name="Pilot Kakuno"
          ink_name="Black"
          unarchivable={false}
        />
      );

      expect(screen.queryByTitle("Unarchive 'Pilot Kakuno - Black'")).not.toBeInTheDocument();
    });
  });
});
