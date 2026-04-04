import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { CollectedPens, storageKeyLayout } from "./CollectedPens";

const setup = (jsx, options) => {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
};

describe("<CollectedPens />", () => {
  const pageData = {
    1: {
      data: [
        {
          id: 1,
          type: "collected_pen",
          attributes: {
            brand: "Faber-Castell",
            model: "Loom",
            nib: "B",
            color: "green",
            usage: 2,
            daily_usage: 1
          }
        }
      ],
      next_page: 2
    },
    2: {
      data: [
        {
          id: 2,
          type: "collected_pen",
          attributes: {
            brand: "Pilot",
            model: "Metropolitan",
            nib: "F",
            color: "black",
            usage: 5,
            daily_usage: 2
          }
        }
      ],
      next_page: null
    }
  };

  const server = setupServer(
    rest.get("/api/v1/collected_pens.json", (req, res, ctx) => {
      const page = parseInt(req.url.searchParams.get("page[number]")) || 1;
      const { data, next_page } = pageData[page] || { data: [], next_page: null };
      return res(ctx.json({ data, meta: { pagination: { current_page: page, next_page } } }));
    })
  );

  beforeAll(() => {
    localStorage.clear();
    server.listen();
  });
  afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it("renders all active pens", async () => {
    const { findByText, queryAllByRole } = setup(<CollectedPens />);
    await findByText("Brand");
    // Header + Footer + 2 entries (one per page)
    expect(queryAllByRole("row")).toHaveLength(4);
    expect(await findByText("Faber-Castell")).toBeInTheDocument();
    expect(await findByText("Pilot")).toBeInTheDocument();
  });

  it("swaps to card layout when clicked", async () => {
    const { findByText, getByTitle, getAllByTestId, user } = setup(<CollectedPens />);

    await findByText("Brand");
    const cardLayoutButton = getByTitle("Card layout");
    await user.click(cardLayoutButton);

    // Both pens have usage data, so each card renders a usage element
    expect(getAllByTestId("usage")).toHaveLength(2);
  });

  it("remembers layout from localStorage", async () => {
    localStorage.setItem(storageKeyLayout, "card");

    const { findByText, getAllByTestId } = setup(<CollectedPens />);

    await findByText("Pilot Metropolitan");

    expect(getAllByTestId("usage")).toHaveLength(2);
  });

  it("shows empty alert and keeps table actions when there are no pens", async () => {
    localStorage.removeItem(storageKeyLayout);

    server.use(
      rest.get("/api/v1/collected_pens.json", (req, res, ctx) => {
        const page = req.url.searchParams.get("page[number]");
        const meta = {
          pagination: { current_page: page, next_page: null }
        };
        return res(ctx.json({ data: [], meta }));
      })
    );

    const { queryByText, findByText, getByTitle } = setup(<CollectedPens />);

    expect(queryByText("Your pen collection is empty.")).not.toBeInTheDocument();
    await findByText("Your pen collection is empty.");
    expect(queryByText("Brand")).not.toBeInTheDocument();
    expect(getByTitle("Card layout")).toBeInTheDocument();
  });

  describe("archive mode", () => {
    it("renders archived pens with the toolbar", async () => {
      const { findByText, getByTitle } = setup(<CollectedPens archive={true} />);
      await findByText("Brand");
      expect(getByTitle("Card layout")).toBeInTheDocument();
    });

    it("does not show import/export/add links in archive mode", async () => {
      const { findByText, queryByText } = setup(<CollectedPens archive={true} />);
      await findByText("Brand");
      expect(queryByText("Import")).not.toBeInTheDocument();
      expect(queryByText("Export")).not.toBeInTheDocument();
    });

    it("shows empty alert and keeps toolbar when archive is empty", async () => {
      server.use(
        rest.get("/api/v1/collected_pens.json", (req, res, ctx) => {
          const page = req.url.searchParams.get("page[number]");
          const meta = {
            pagination: { current_page: page, next_page: null }
          };
          return res(ctx.json({ data: [], meta }));
        })
      );

      const { queryByText, findByText, getByTitle } = setup(<CollectedPens archive={true} />);

      expect(queryByText("Your pen archive is empty.")).not.toBeInTheDocument();
      await findByText("Your pen archive is empty.");
      expect(queryByText("Brand")).not.toBeInTheDocument();
      expect(getByTitle("Card layout")).toBeInTheDocument();
    });
  });
});
