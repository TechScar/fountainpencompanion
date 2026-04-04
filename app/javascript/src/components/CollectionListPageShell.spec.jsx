import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render } from "@testing-library/react";
import { CollectionListPageShell } from "./CollectionListPageShell";

describe("<CollectionListPageShell />", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it("catches fetch errors and renders with empty items", async () => {
    server.use(rest.get("/api/v1/collected_pens.json", (req, res, ctx) => res(ctx.status(500))));

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { findByText } = render(
      <CollectionListPageShell
        endpoint="/api/v1/collected_pens.json?filter[archived]=false"
        loadingComponent={<div>Loading</div>}
        paginated
      >
        {(items) => <div>Items: {items.length}</div>}
      </CollectionListPageShell>
    );

    expect(await findByText("Items: 0")).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
  });
});
