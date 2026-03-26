import { renderHook, act } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { useDashboardPreferences } from "dashboard/useDashboardPreferences";
import * as storage from "localStorage";

const server = setupServer(
  rest.get("/account", (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          attributes: {
            preferences: {}
          }
        }
      })
    );
  }),
  rest.put("/account", (req, res, ctx) => {
    return res(ctx.json({ data: { attributes: { preferences: {} } } }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  storage.removeItem("fpc-dashboard-widgets");
});
afterAll(() => server.close());

describe("useDashboardPreferences", () => {
  it("returns all widget IDs by default", () => {
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.visibleWidgetIds).toHaveLength(8);
    expect(result.current.visibleWidgetIds[0]).toBe("currently_inked_summary");
  });

  it("reads from localStorage on mount", () => {
    const saved = ["pens_summary", "inks_summary"];
    storage.setItem("fpc-dashboard-widgets", JSON.stringify(saved));

    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.visibleWidgetIds).toEqual(["pens_summary", "inks_summary"]);
  });

  it("strips invalid IDs from saved preference", () => {
    const saved = ["nonexistent_widget", "inks_summary"];
    storage.setItem("fpc-dashboard-widgets", JSON.stringify(saved));

    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.visibleWidgetIds).toEqual(["inks_summary"]);
  });

  it("falls back to defaults if saved value is empty after sanitizing", () => {
    storage.setItem("fpc-dashboard-widgets", JSON.stringify(["nonexistent"]));

    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.visibleWidgetIds).toHaveLength(8);
  });

  it("updates localStorage and state on save", () => {
    const { result } = renderHook(() => useDashboardPreferences());
    const newIds = ["pens_summary", "inks_summary"];

    act(() => {
      result.current.setVisibleWidgetIds(newIds);
    });

    expect(result.current.visibleWidgetIds).toEqual(newIds);
    expect(JSON.parse(storage.getItem("fpc-dashboard-widgets"))).toEqual(newIds);
  });

  it("resets to defaults and clears storage when saving null", () => {
    storage.setItem("fpc-dashboard-widgets", JSON.stringify(["pens_summary"]));

    const { result } = renderHook(() => useDashboardPreferences());

    act(() => {
      result.current.setVisibleWidgetIds(null);
    });

    expect(storage.getItem("fpc-dashboard-widgets")).toBeNull();
    expect(result.current.visibleWidgetIds).toHaveLength(8);
    expect(result.current.visibleWidgetIds[0]).toBe("currently_inked_summary");
  });

  it("syncs from server when server has a value", async () => {
    const serverIds = ["leaderboard_ranking", "inks_summary"];
    server.use(
      rest.get("/account", (req, res, ctx) => {
        return res(
          ctx.json({
            data: {
              attributes: {
                preferences: { dashboard_widgets: serverIds }
              }
            }
          })
        );
      })
    );

    const { result, rerender } = renderHook(() => useDashboardPreferences());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
      rerender();
    });

    expect(result.current.visibleWidgetIds).toEqual(serverIds);
  });
});
