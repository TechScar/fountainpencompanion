import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Widget, WidgetDataContext, WidgetWidthContext } from "./widgets";
import { getRequest, putRequest } from "../fetch";
import { colorSort } from "../color-sorting";
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
          if (local) savePreference(API_KEY, local);
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
    savePreference(API_KEY, value);
  }, []);

  return { range, setRange };
}

const SPEED_STORAGE_KEY = "fpc-usage-viz-speed";
const SPEED_API_KEY = "usage_visualization_speed";
const DEFAULT_SPEED = "medium";
const VALID_SPEEDS = ["slow", "medium", "fast"];

function useSpeedPreference() {
  const [speed, setSpeedState] = useState(() => {
    const stored = storage.getItem(SPEED_STORAGE_KEY);
    return stored && VALID_SPEEDS.includes(stored) ? stored : DEFAULT_SPEED;
  });

  useEffect(() => {
    let cancelled = false;

    async function syncWithServer() {
      try {
        const response = await getRequest("/account");
        if (!response.ok || cancelled) return;

        const json = await response.json();
        const preferences = json.data.attributes.preferences || {};
        const serverValue = preferences[SPEED_API_KEY];

        if (serverValue && VALID_SPEEDS.includes(serverValue)) {
          storage.setItem(SPEED_STORAGE_KEY, serverValue);
          if (!cancelled) setSpeedState(serverValue);
        } else {
          const local = storage.getItem(SPEED_STORAGE_KEY);
          if (local && VALID_SPEEDS.includes(local)) savePreference(SPEED_API_KEY, local);
        }
      } catch {
        // Network error
      }
    }

    syncWithServer();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSpeed = useCallback((value) => {
    setSpeedState(value);
    storage.setItem(SPEED_STORAGE_KEY, value);
    savePreference(SPEED_API_KEY, value);
  }, []);

  return { speed, setSpeed };
}

async function savePreference(key, value) {
  try {
    await putRequest("/account", {
      user: { preferences: { [key]: value } }
    });
  } catch {
    // Silently fail — local state is already correct
  }
}

export const UsageVisualizationWidget = ({ renderWhenInvisible }) => {
  const { range, setRange } = useRangePreference();
  const { speed, setSpeed } = useSpeedPreference();
  const path = `/dashboard/widgets/usage_visualization.json?range=${range}`;

  return (
    <Widget header="Usage visualization" path={path} renderWhenInvisible={renderWhenInvisible}>
      <UsageVisualizationWidgetContent
        range={range}
        setRange={setRange}
        speed={speed}
        setSpeed={setSpeed}
      />
    </Widget>
  );
};

// No time limit — animation runs until component unmounts
const GRID_SIZE = 140;

function buildGrid(entries, cols, rows) {
  const totalPixels = cols * rows;
  const totalCount = entries.reduce((sum, e) => sum + e.count, 0);
  if (totalCount === 0) return { grid: [], inkNames: [] };

  const pixels = [];
  const inkNames = [];
  let assigned = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const count = isLast
      ? totalPixels - assigned
      : Math.round((entry.count / totalCount) * totalPixels);
    for (let j = 0; j < count; j++) {
      pixels.push(entry.color);
      inkNames.push(entry.ink_name);
    }
    assigned += count;
  }

  // Fisher-Yates shuffle
  for (let i = pixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
    [inkNames[i], inkNames[j]] = [inkNames[j], inkNames[i]];
  }

  return { grid: pixels, inkNames };
}

const NEIGHBOR_RADIUS = 1;

function countSameNeighbors(grid, idx, cols, rows) {
  const color = grid[idx];
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  let count = 0;

  for (let dr = -NEIGHBOR_RADIUS; dr <= NEIGHBOR_RADIUS; dr++) {
    for (let dc = -NEIGHBOR_RADIUS; dc <= NEIGHBOR_RADIUS; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (grid[nr * cols + nc] === color) count++;
      }
    }
  }
  return count;
}

// Different snake traversal patterns for variety
const SNAKE_PATTERNS = [
  // Left-to-right, top-to-bottom
  (idx, cols) => {
    const row = Math.floor(idx / cols);
    const col = row % 2 === 0 ? idx % cols : cols - 1 - (idx % cols);
    return { r: row, c: col };
  },
  // Top-to-bottom, left-to-right (vertical snake)
  (idx, cols, rows) => {
    const col = Math.floor(idx / rows);
    const row = col % 2 === 0 ? idx % rows : rows - 1 - (idx % rows);
    return { r: row, c: col };
  },
  // Right-to-left, bottom-to-top (reversed horizontal)
  (idx, cols, rows) => {
    const totalPixels = cols * rows;
    const rev = totalPixels - 1 - idx;
    const row = Math.floor(rev / cols);
    const col = row % 2 === 0 ? rev % cols : cols - 1 - (rev % cols);
    return { r: row, c: col };
  },
  // Bottom-to-top, right-to-left (reversed vertical)
  (idx, cols, rows) => {
    const totalPixels = cols * rows;
    const rev = totalPixels - 1 - idx;
    const col = Math.floor(rev / rows);
    const row = col % 2 === 0 ? rev % rows : rows - 1 - (rev % rows);
    return { r: row, c: col };
  }
];

function computeTargets(entries, cols, rows) {
  const sorted = [...entries].sort((a, b) => colorSort(a.color, b.color));
  const totalCount = sorted.reduce((sum, e) => sum + e.count, 0);
  const totalPixels = cols * rows;

  // Pick a random snake pattern
  const pattern = SNAKE_PATTERNS[Math.floor(Math.random() * SNAKE_PATTERNS.length)];
  // Random starting offset within the color sort order
  const colorOffset = Math.floor(Math.random() * sorted.length);
  const shifted = [...sorted.slice(colorOffset), ...sorted.slice(0, colorOffset)];

  const targets = {};
  let pixelIndex = 0;

  for (const entry of shifted) {
    const count = Math.round((entry.count / totalCount) * totalPixels);
    const midIdx = Math.min(Math.floor(pixelIndex + count / 2), totalPixels - 1);
    const pos = pattern(midIdx, cols, rows);
    targets[entry.color] = pos;
    pixelIndex += count;
  }

  return targets;
}

const SPEED_OPTIONS = [
  { value: "slow", label: "Slow", fps: 15, multiplier: 1 },
  { value: "medium", label: "Medium", fps: 30, multiplier: 3 },
  { value: "fast", label: "Fast", fps: 60, multiplier: 6 }
];

function simulationTick(grid, inkNames, cols, rows, targets, multiplier) {
  const totalPixels = grid.length;
  const swapCount = totalPixels * multiplier;
  const dirty = new Set();

  for (let s = 0; s < swapCount; s++) {
    const a = Math.floor(Math.random() * totalPixels);

    // Pick swap partner: biased toward color's target position
    const colorA = grid[a];
    const center = targets[colorA];
    const rowA = Math.floor(a / cols);
    const colA = a % cols;
    const dirR = center.r - rowA;
    const dirC = center.c - colA;
    const dist = Math.sqrt(dirR * dirR + dirC * dirC) || 1;
    const stepSize = dist * (0.3 + Math.random() * 0.7);
    const nr = Math.max(
      0,
      Math.min(rows - 1, Math.round(rowA + (dirR / dist) * stepSize + (Math.random() - 0.5) * 2))
    );
    const nc = Math.max(
      0,
      Math.min(cols - 1, Math.round(colA + (dirC / dist) * stepSize + (Math.random() - 0.5) * 2))
    );
    const b = nr * cols + nc;

    if (a === b || grid[a] === grid[b]) continue;

    // Use neighbor happiness to decide swap
    const happyA = countSameNeighbors(grid, a, cols, rows);
    const happyB = countSameNeighbors(grid, b, cols, rows);

    [grid[a], grid[b]] = [grid[b], grid[a]];
    [inkNames[a], inkNames[b]] = [inkNames[b], inkNames[a]];

    const newHappyA = countSameNeighbors(grid, a, cols, rows);
    const newHappyB = countSameNeighbors(grid, b, cols, rows);

    const improvement = newHappyA + newHappyB - happyA - happyB;

    let doSwap;
    if (improvement > 0) {
      doSwap = true;
    } else if (improvement === 0) {
      doSwap = Math.random() < 0.05;
    } else {
      doSwap = Math.random() < 0.001;
    }

    if (doSwap) {
      dirty.add(a);
      dirty.add(b);
    } else {
      [grid[a], grid[b]] = [grid[b], grid[a]];
      [inkNames[a], inkNames[b]] = [inkNames[b], inkNames[a]];
    }
  }

  return dirty;
}

function drawGrid(ctx, grid, cols, pixelSize) {
  for (let i = 0; i < grid.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    ctx.fillStyle = grid[i];
    ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
  }
}

function drawDirty(ctx, grid, dirty, cols, pixelSize) {
  for (const i of dirty) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    ctx.fillStyle = grid[i];
    ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
  }
}

const UsageVisualizationWidgetContent = ({ range, setRange, speed, setSpeed }) => {
  const { data } = useContext(WidgetDataContext);
  const width = useContext(WidgetWidthContext);
  const entries = data.attributes.entries;
  const source = data.attributes.source;
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const inkNamesRef = useRef(null);
  const runningRef = useRef(true);
  const visibleRef = useRef(false);
  const speedRef = useRef(speed);
  const animIdRef = useRef(null);
  const hasEntries = entries.length > 0;
  const [running, setRunning] = useState(true);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [hasEntries, width]);

  useEffect(() => {
    if (!hasEntries || !width) return;

    const cols = GRID_SIZE;
    const rows = GRID_SIZE;
    const totalPixels = cols * rows;
    const pixelSize = width / cols;
    const canvasSize = Math.floor(width);
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");

    const { grid, inkNames } = buildGrid(entries, cols, rows);
    gridRef.current = grid;
    inkNamesRef.current = inkNames;

    drawGrid(ctx, grid, cols, pixelSize);

    let lastFrame = performance.now();
    let autoStopped = false;
    const targets = computeTargets(entries, cols, rows);

    function animate(now) {
      const currentSpeed = SPEED_OPTIONS.find((o) => o.value === speedRef.current);
      const frameInterval = 1000 / (currentSpeed ? currentSpeed.fps : 30);

      if (runningRef.current && visibleRef.current && now - lastFrame >= frameInterval) {
        lastFrame = now;
        const dirty = simulationTick(
          grid,
          inkNames,
          cols,
          rows,
          targets,
          currentSpeed ? currentSpeed.multiplier : 3
        );
        if (dirty.size > 0) {
          drawDirty(ctx, grid, dirty, cols, pixelSize);
        }
        // Auto-stop once when converged
        if (!autoStopped && dirty.size < totalPixels * 0.005) {
          autoStopped = true;
          runningRef.current = false;
          setRunning(false);
        }
      }

      animIdRef.current = requestAnimationFrame(animate);
    }

    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [entries, width, hasEntries, restartKey]);

  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const inkNames = inkNamesRef.current;
      if (!canvas || !inkNames) return;

      const rect = canvas.getBoundingClientRect();
      const pixelSize = (width || 300) / GRID_SIZE;
      const col = Math.floor((e.clientX - rect.left) / pixelSize);
      const row = Math.floor((e.clientY - rect.top) / pixelSize);

      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        const idx = row * GRID_SIZE + col;
        canvas.title = inkNames[idx] || "";
      }
    },
    [width]
  );

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-2">
        <RangePicker range={range} setRange={setRange} />
        {hasEntries && (
          <>
            <SpeedPicker speed={speed} setSpeed={setSpeed} />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-auto"
              onClick={() => setRunning((r) => !r)}
            >
              <i className={`fa fa-${running ? "stop" : "play"}`} />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setRunning(true);
                runningRef.current = true;
                setRestartKey((k) => k + 1);
              }}
            >
              <i className="fa fa-refresh" />
            </button>
          </>
        )}
      </div>
      {source === "currently_inked" && (
        <p className="text-muted small mb-2">
          Based on currently inked pens (not enough usage records).
        </p>
      )}
      {hasEntries ? (
        <canvas
          ref={canvasRef}
          className="fpc-usage-visualization__canvas"
          onMouseMove={handleMouseMove}
        />
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

const SpeedPicker = ({ speed, setSpeed }) => (
  <select
    className="form-select form-select-sm"
    style={{ width: "auto" }}
    value={speed}
    onChange={(e) => setSpeed(e.target.value)}
  >
    {SPEED_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
