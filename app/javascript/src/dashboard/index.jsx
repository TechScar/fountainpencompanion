import React, { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { DraggableWidget, HiddenWidget, useDragReorder } from "./dashboard_config";
import { useDashboardPreferences } from "./useDashboardPreferences";
import { WIDGET_REGISTRY, WIDGET_REGISTRY_MAP } from "./widget_registry";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("dashboard");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    );
  }
});

const Dashboard = () => {
  const { visibleWidgetIds, setVisibleWidgetIds, saveToServer } = useDashboardPreferences();
  const [configuring, setConfiguring] = useState(false);
  const { dragging, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(
    visibleWidgetIds,
    setVisibleWidgetIds,
    saveToServer
  );

  const hiddenWidgetIds = useMemo(() => {
    const visibleSet = new Set(visibleWidgetIds);
    return WIDGET_REGISTRY.filter((w) => !visibleSet.has(w.id)).map((w) => w.id);
  }, [visibleWidgetIds]);

  const handleRemove = useCallback(
    (id) => {
      setVisibleWidgetIds(visibleWidgetIds.filter((wid) => wid !== id));
    },
    [visibleWidgetIds, setVisibleWidgetIds]
  );

  const handleAdd = useCallback(
    (id) => {
      setVisibleWidgetIds([...visibleWidgetIds, id]);
    },
    [visibleWidgetIds, setVisibleWidgetIds]
  );

  const handleReset = useCallback(() => {
    setVisibleWidgetIds(null);
  }, [setVisibleWidgetIds]);

  return (
    <>
      <div className="fpc-dashboard-header">
        {configuring && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={handleReset}
          >
            Reset to defaults
          </button>
        )}
        <button
          type="button"
          className={`btn btn-sm ${configuring ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setConfiguring(!configuring)}
          aria-label="Configure dashboard"
        >
          {configuring ? "Done" : "\u2699 Configure"}
        </button>
      </div>
      <div className="fpc-dashboard">
        {visibleWidgetIds.map((id, index) => {
          const entry = WIDGET_REGISTRY_MAP[id];
          if (!entry) return null;
          const Component = entry.component;
          return (
            <DraggableWidget
              key={id}
              id={id}
              index={index}
              configuring={configuring}
              dragging={dragging}
              onRemove={handleRemove}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            >
              <Component />
            </DraggableWidget>
          );
        })}
        {configuring &&
          hiddenWidgetIds.map((id) => <HiddenWidget key={id} id={id} onAdd={handleAdd} />)}
      </div>
    </>
  );
};
