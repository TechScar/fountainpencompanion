import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import convert from "color-convert";
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

function toroidalDist(r1, c1, r2, c2, rows, cols) {
  let dr = Math.abs(r1 - r2);
  let dc = Math.abs(c1 - c2);
  if (dr > rows / 2) dr = rows - dr;
  if (dc > cols / 2) dc = cols - dc;
  return Math.sqrt(dr * dr + dc * dc);
}

function countSameNeighbors(grid, idx, cols, rows) {
  const color = grid[idx];
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (row + dr + rows) % rows;
      const nc = (col + dc + cols) % cols;
      if (grid[nr * cols + nc] === color) count++;
    }
  }
  return count;
}

function colorDistance(hexA, hexB) {
  const [h1, s1, v1] = convert.hex.hsv(hexA);
  const [h2, s2, v2] = convert.hex.hsv(hexB);
  // Circular hue distance (0-180)
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  const ds = Math.abs(s1 - s2);
  const dv = Math.abs(v1 - v2);
  return Math.sqrt(dh * dh + ds * ds + dv * dv);
}

const SIMILARITY_BLEND = 0.9; // How much similar colors pull toward each other

function circularMean(angles, period) {
  let sinSum = 0;
  let cosSum = 0;
  for (const a of angles) {
    const theta = (a / period) * 2 * Math.PI;
    sinSum += Math.sin(theta);
    cosSum += Math.cos(theta);
  }
  const theta = Math.atan2(sinSum, cosSum);
  return ((theta / (2 * Math.PI)) * period + period) % period;
}

function computeCenters(grid, cols, colorDistances) {
  const rows = grid.length / cols;
  const byColor = {};
  for (let i = 0; i < grid.length; i++) {
    const color = grid[i];
    if (!byColor[color]) byColor[color] = { rs: [], cs: [] };
    byColor[color].rs.push(Math.floor(i / cols));
    byColor[color].cs.push(i % cols);
  }

  // Raw centers of mass using circular mean (torus-aware)
  const rawCenters = {};
  const colors = Object.keys(byColor);
  for (const color of colors) {
    rawCenters[color] = {
      r: circularMean(byColor[color].rs, rows),
      c: circularMean(byColor[color].cs, cols)
    };
  }

  // Blended centers: pulled toward similar colors
  const blendedCenters = {};
  for (const color of colors) {
    let pullR = 0;
    let pullC = 0;
    let totalWeight = 0;

    for (const other of colors) {
      if (other === color) continue;
      const dist = colorDistances[color][other];
      const weight = 1 / (1 + dist / 15);
      let dr = rawCenters[other].r - rawCenters[color].r;
      let dc = rawCenters[other].c - rawCenters[color].c;
      if (dr > rows / 2) dr -= rows;
      else if (dr < -rows / 2) dr += rows;
      if (dc > cols / 2) dc -= cols;
      else if (dc < -cols / 2) dc += cols;
      pullR += dr * weight;
      pullC += dc * weight;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      blendedCenters[color] = {
        r:
          (((rawCenters[color].r + (pullR / totalWeight) * SIMILARITY_BLEND) % rows) + rows) % rows,
        c: (((rawCenters[color].c + (pullC / totalWeight) * SIMILARITY_BLEND) % cols) + cols) % cols
      };
    } else {
      blendedCenters[color] = rawCenters[color];
    }
  }

  return { rawCenters, blendedCenters };
}

function precomputeColorDistances(entries) {
  const distances = {};
  for (const a of entries) {
    distances[a.color] = {};
    for (const b of entries) {
      if (a.color === b.color) continue;
      distances[a.color][b.color] = colorDistance(a.color, b.color);
    }
  }
  return distances;
}

const SPEED_OPTIONS = [
  { value: "slow", label: "Slow", fps: 15, multiplier: 1 },
  { value: "medium", label: "Medium", fps: 30, multiplier: 3 },
  { value: "fast", label: "Fast", fps: 60, multiplier: 6 }
];

function simulationTick(grid, inkNames, cols, rows, rawCenters, blendedCenters, multiplier) {
  const totalPixels = grid.length;
  const targetSwaps = Math.floor(totalPixels * 0.005 * multiplier);
  const maxAttempts = totalPixels * multiplier * 3;
  const dirty = new Set();
  let attempts = 0;
  let successes = 0;

  while (successes < targetSwaps && attempts < maxAttempts) {
    attempts++;
    const a = Math.floor(Math.random() * totalPixels);

    const colorA = grid[a];
    const blendedA = blendedCenters[colorA];
    const rawA = rawCenters[colorA];
    const rowA = Math.floor(a / cols);
    const colA = a % cols;

    // Swap partner: biased toward blended center (drift toward similar colors)
    let dirR = blendedA.r - rowA;
    let dirC = blendedA.c - colA;
    if (dirR > rows / 2) dirR -= rows;
    else if (dirR < -rows / 2) dirR += rows;
    if (dirC > cols / 2) dirC -= cols;
    else if (dirC < -cols / 2) dirC += cols;
    const dist = Math.sqrt(dirR * dirR + dirC * dirC) || 1;
    const stepSize = dist * (0.3 + Math.random() * 0.7);
    const nr =
      ((Math.round(rowA + (dirR / dist) * stepSize + (Math.random() - 0.5) * 2) % rows) + rows) %
      rows;
    const nc =
      ((Math.round(colA + (dirC / dist) * stepSize + (Math.random() - 0.5) * 2) % cols) + cols) %
      cols;
    const b = nr * cols + nc;

    if (a === b || grid[a] === grid[b]) continue;

    const colorB = grid[b];
    const rawB = rawCenters[colorB];
    const blendedB = blendedCenters[colorB];
    const rowB = Math.floor(b / cols);
    const colB = b % cols;

    const happyA = countSameNeighbors(grid, a, cols, rows);
    const happyB = countSameNeighbors(grid, b, cols, rows);

    // Compactness: does swap move pixels closer to their own raw center?
    const compactA =
      toroidalDist(rowA, colA, rawA.r, rawA.c, rows, cols) -
      toroidalDist(nr, nc, rawA.r, rawA.c, rows, cols);
    const compactB =
      toroidalDist(rowB, colB, rawB.r, rawB.c, rows, cols) -
      toroidalDist(rowA, colA, rawB.r, rawB.c, rows, cols);

    // Drift: does swap move pixels closer to their blended center?
    const driftA =
      toroidalDist(rowA, colA, blendedA.r, blendedA.c, rows, cols) -
      toroidalDist(nr, nc, blendedA.r, blendedA.c, rows, cols);
    const driftB =
      toroidalDist(rowB, colB, blendedB.r, blendedB.c, rows, cols) -
      toroidalDist(rowA, colA, blendedB.r, blendedB.c, rows, cols);

    const centerPull = (compactA + compactB) * 1.0 + (driftA + driftB) * 1.0;

    [grid[a], grid[b]] = [grid[b], grid[a]];
    [inkNames[a], inkNames[b]] = [inkNames[b], inkNames[a]];

    const newHappyA = countSameNeighbors(grid, a, cols, rows);
    const newHappyB = countSameNeighbors(grid, b, cols, rows);

    const localImprovement = newHappyA + newHappyB - happyA - happyB;
    // Combined score: local happiness + center pull
    const score = localImprovement + centerPull;

    let doSwap;
    if (score > 0) {
      doSwap = true;
    } else if (score > -0.5) {
      doSwap = Math.random() < 0.03;
    } else {
      doSwap = Math.random() < 0.001;
    }

    if (doSwap) {
      dirty.add(a);
      dirty.add(b);
      successes++;
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
    const colorDistances = precomputeColorDistances(entries);
    let { rawCenters, blendedCenters } = computeCenters(grid, cols, colorDistances);

    function animate(now) {
      const currentSpeed = SPEED_OPTIONS.find((o) => o.value === speedRef.current);
      const frameInterval = 1000 / (currentSpeed ? currentSpeed.fps : 30);

      if (runningRef.current && visibleRef.current && now - lastFrame >= frameInterval) {
        lastFrame = now;
        ({ rawCenters, blendedCenters } = computeCenters(grid, cols, colorDistances));
        const dirty = simulationTick(
          grid,
          inkNames,
          cols,
          rows,
          rawCenters,
          blendedCenters,
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
