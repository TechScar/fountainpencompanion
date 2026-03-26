import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Widget, WidgetDataContext, WidgetWidthContext } from "./widgets";
import { getRequest, putRequest } from "../fetch";
import * as storage from "../localStorage";

const STORAGE_KEY = "fpc-usage-viz-range";
const API_KEY = "usage_visualization_range";
const DEFAULT_RANGE = "1m";
const RANGE_OPTIONS = [
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" }
];

function readRangeFromStorage() {
  const stored = storage.getItem(STORAGE_KEY);
  if (stored && RANGE_OPTIONS.some((o) => o.value === stored)) return stored;
  return null;
}

function useRangePreference() {
  const [range, setRangeState] = useState(() => readRangeFromStorage() || DEFAULT_RANGE);

  useEffect(() => {
    let cancelled = false;

    async function syncWithServer() {
      try {
        const response = await getRequest("/account");
        if (!response.ok || cancelled) return;

        const json = await response.json();
        const preferences = json.data.attributes.preferences || {};
        const serverValue = preferences[API_KEY];

        if (serverValue && RANGE_OPTIONS.some((o) => o.value === serverValue)) {
          storage.setItem(STORAGE_KEY, serverValue);
          if (!cancelled) setRangeState(serverValue);
        } else {
          const local = readRangeFromStorage();
          if (local) saveToServer(local);
        }
      } catch {
        // Network error: localStorage value is already in use
      }
    }

    syncWithServer();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRange = useCallback((value) => {
    setRangeState(value);
    storage.setItem(STORAGE_KEY, value);
    saveToServer(value);
  }, []);

  return { range, setRange };
}

async function saveToServer(value) {
  try {
    await putRequest("/account", {
      user: { preferences: { [API_KEY]: value } }
    });
  } catch {
    // Silently fail — local state is already correct
  }
}

export const UsageVisualizationWidget = ({ renderWhenInvisible }) => {
  const { range, setRange } = useRangePreference();
  const path = `/dashboard/widgets/usage_visualization.json?range=${range}`;

  return (
    <Widget header="Usage visualization" path={path} renderWhenInvisible={renderWhenInvisible}>
      <UsageVisualizationWidgetContent range={range} setRange={setRange} />
    </Widget>
  );
};

const UsageVisualizationWidgetContent = ({ range, setRange }) => {
  const { data } = useContext(WidgetDataContext);
  const width = useContext(WidgetWidthContext);
  const entries = data.attributes.entries;
  const source = data.attributes.source;

  const cells = useMemo(() => {
    const result = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.count; i++) {
        result.push({ color: entry.color, inkName: entry.ink_name });
      }
    }
    return result;
  }, [entries]);

  const totalCells = cells.length;
  const containerWidth = width || 300;
  const cols = totalCells > 0 ? Math.ceil(Math.sqrt(totalCells)) : 1;
  const cellSize = totalCells > 0 ? containerWidth / cols : 0;

  return (
    <>
      <div className="fpc-usage-visualization__range-picker">
        <RangePicker range={range} setRange={setRange} />
      </div>
      {source === "currently_inked" && (
        <p className="text-muted small mb-2">
          Based on currently inked pens (not enough usage records).
        </p>
      )}
      {totalCells > 0 ? (
        <div
          className="fpc-usage-visualization"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className="fpc-usage-visualization__cell"
              style={{ backgroundColor: cell.color, height: cellSize }}
              title={cell.inkName}
            />
          ))}
        </div>
      ) : (
        <div className="fpc-usage-visualization__empty">
          Not enough usage data yet. Start logging daily usage on your currently inked pens to see
          this visualization.
        </div>
      )}
    </>
  );
};

const RangePicker = ({ range, setRange }) => (
  <select
    className="form-select form-select-sm"
    style={{ width: "auto" }}
    value={range}
    onChange={(e) => setRange(e.target.value)}
  >
    {RANGE_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
