import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen } from "@testing-library/react";

import { UsageVisualizationWidget } from "dashboard/usage_visualization_widget";

const widgetData = (entries = [], source = "usage_records", totalCount = 0) => ({
  data: {
    type: "widget",
    id: "usage_visualization",
    attributes: { entries, source, total_count: totalCount }
  }
});

const accountData = {
  data: { attributes: { preferences: {} } }
};

describe("UsageVisualizationWidget", () => {
  const server = setupServer(
    rest.get("/dashboard/widgets/usage_visualization.json", (req, res, ctx) => {
      return res(
        ctx.json(
          widgetData(
            [
              { ink_name: "Pilot Blue", color: "#0000ff", count: 5 },
              { ink_name: "Diamine Red", color: "#ff0000", count: 3 }
            ],
            "usage_records",
            15
          )
        )
      );
    }),
    rest.get("/account", (req, res, ctx) => {
      return res(ctx.json(accountData));
    }),
    rest.put("/account", (req, res, ctx) => {
      return res(ctx.json({}));
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  it("renders colored cells", async () => {
    render(<UsageVisualizationWidget renderWhenInvisible />);
    const cells = await screen.findAllByTitle(/Pilot Blue|Diamine Red/);
    expect(cells.length).toBe(8);
  });

  it("renders range picker select", async () => {
    render(<UsageVisualizationWidget renderWhenInvisible />);
    const select = await screen.findByDisplayValue("1 month");
    expect(select.tagName).toBe("SELECT");
    expect(select.options.length).toBe(5);
  });

  it("shows empty message when no data", async () => {
    server.use(
      rest.get("/dashboard/widgets/usage_visualization.json", (req, res, ctx) => {
        return res(ctx.json(widgetData([], "insufficient", 0)));
      })
    );

    render(<UsageVisualizationWidget renderWhenInvisible />);
    await screen.findByText(/Not enough usage data yet/);
  });

  it("shows fallback message when using currently inked data", async () => {
    server.use(
      rest.get("/dashboard/widgets/usage_visualization.json", (req, res, ctx) => {
        return res(
          ctx.json(
            widgetData(
              [{ ink_name: "Pilot Blue", color: "#0000ff", count: 6 }],
              "currently_inked",
              5
            )
          )
        );
      })
    );

    render(<UsageVisualizationWidget renderWhenInvisible />);
    await screen.findByText(/Based on currently inked pens/);
  });
});
