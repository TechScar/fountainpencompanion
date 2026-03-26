import { useCallback, useEffect, useState } from "react";
import { getRequest, putRequest } from "../fetch";
import * as storage from "../localStorage";
import { WIDGET_REGISTRY } from "./widget_registry";

const STORAGE_KEY = "fpc-dashboard-widgets";
const API_KEY = "dashboard_widgets";
const ALL_IDS = WIDGET_REGISTRY.map((w) => w.id);

function sanitize(saved) {
  if (!Array.isArray(saved)) return null;
  const validIds = new Set(ALL_IDS);
  const seen = new Set();
  const result = [];
  for (const id of saved) {
    if (typeof id === "string" && validIds.has(id) && !seen.has(id)) {
      result.push(id);
      seen.add(id);
    }
  }
  return result.length > 0 ? result : null;
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
  const [visibleWidgetIds, setVisibleWidgetIdsState] = useState(() => readFromStorage() || ALL_IDS);

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
          if (!cancelled) setVisibleWidgetIdsState(serverValue);
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
    setVisibleWidgetIdsState((prev) => {
      const next = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      if (next === null) {
        storage.removeItem(STORAGE_KEY);
        savePreference(null);
        return ALL_IDS;
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!skipServer) savePreference(next);
      return next;
    });
  }, []);

  const saveToServer = useCallback(() => {
    setVisibleWidgetIdsState((current) => {
      savePreference(current);
      return current;
    });
  }, []);

  return { visibleWidgetIds, setVisibleWidgetIds, saveToServer };
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
