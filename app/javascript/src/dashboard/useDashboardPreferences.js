import { useCallback, useEffect, useState } from "react";
import { getRequest, putRequest } from "../fetch";
import * as storage from "../localStorage";
import { WIDGET_REGISTRY } from "./widget_registry";

const STORAGE_KEY = "fpc-dashboard-widgets";
const API_KEY = "dashboard_widgets";
const ALL_IDS = WIDGET_REGISTRY.map((w) => w.id);

function sanitize(saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;

  const validIds = new Set(ALL_IDS);
  const seen = new Set();
  const visible = [];
  for (const id of saved.visible || []) {
    if (typeof id === "string" && validIds.has(id) && !seen.has(id)) {
      visible.push(id);
      seen.add(id);
    }
  }

  const removedSet = new Set();
  for (const id of saved.removed || []) {
    if (typeof id === "string" && validIds.has(id) && !seen.has(id)) {
      removedSet.add(id);
    }
  }

  // Append new widgets (in registry but not in visible or removed)
  for (const id of ALL_IDS) {
    if (!seen.has(id) && !removedSet.has(id)) {
      visible.push(id);
    }
  }

  return visible.length > 0 || removedSet.size > 0 ? { visible, removed: [...removedSet] } : null;
}

function toStorageFormat(visibleIds) {
  const visibleSet = new Set(visibleIds);
  const removed = ALL_IDS.filter((id) => !visibleSet.has(id));
  return { visible: visibleIds, removed };
}

function readFromStorage() {
  const stored = storage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return sanitize(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function useDashboardPreferences() {
  const [state, setState] = useState(() => {
    const saved = readFromStorage();
    return saved || { visible: ALL_IDS, removed: [] };
  });

  useEffect(() => {
    let cancelled = false;

    async function syncWithServer() {
      try {
        const response = await getRequest("/account");
        if (!response.ok || cancelled) return;

        const json = await response.json();
        const preferences = json.data.attributes.preferences || {};
        const serverValue = sanitize(preferences[API_KEY]);

        if (serverValue) {
          storage.setItem(STORAGE_KEY, JSON.stringify(serverValue));
          if (!cancelled) setState(serverValue);
        } else {
          const local = readFromStorage();
          if (local) {
            savePreference(local);
          }
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

  const setVisibleWidgetIds = useCallback((nextOrUpdater, { skipServer = false } = {}) => {
    setState((prev) => {
      const next =
        typeof nextOrUpdater === "function" ? nextOrUpdater(prev.visible) : nextOrUpdater;
      if (next === null) {
        storage.removeItem(STORAGE_KEY);
        savePreference(null);
        return { visible: ALL_IDS, removed: [] };
      }
      const value = toStorageFormat(next);
      storage.setItem(STORAGE_KEY, JSON.stringify(value));
      if (!skipServer) savePreference(value);
      return value;
    });
  }, []);

  const saveToServer = useCallback(() => {
    setState((current) => {
      savePreference(current);
      return current;
    });
  }, []);

  return { visibleWidgetIds: state.visible, setVisibleWidgetIds, saveToServer };
}

async function savePreference(value) {
  try {
    await putRequest("/account", {
      user: { preferences: { [API_KEY]: value } }
    });
  } catch {
    // Silently fail — local state is already correct
  }
}
