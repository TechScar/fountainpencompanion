import { useCallback, useRef, useState } from "react";
import { WIDGET_REGISTRY_MAP } from "./widget_registry";

export const HiddenWidget = ({ id, onAdd }) => {
  const widget = WIDGET_REGISTRY_MAP[id];
  if (!widget) return null;
  const Component = widget.component;

  return (
    <div className="fpc-dashboard-hidden">
      <div className="fpc-dashboard-widget-overlay">
        <button
          type="button"
          className="btn btn-sm btn-primary fpc-dashboard-widget-overlay__btn"
          onClick={() => onAdd(id)}
          aria-label={`Add ${widget.label}`}
        >
          + Add
        </button>
      </div>
      <Component renderWhenInvisible />
    </div>
  );
};

export const DraggableWidget = ({
  id,
  index,
  isFirst,
  isLast,
  configuring,
  dragging,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children
}) => {
  const widget = WIDGET_REGISTRY_MAP[id];

  const classNames =
    [
      configuring && "fpc-dashboard-configurable",
      configuring && dragging && "fpc-dashboard-configurable--reordering"
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={classNames}
      draggable={configuring || undefined}
      onDragStart={configuring ? (e) => onDragStart(e, index) : undefined}
      onDragOver={configuring ? (e) => onDragOver(e, index) : undefined}
      onDrop={configuring ? (e) => onDrop(e) : undefined}
      onDragEnd={configuring ? onDragEnd : undefined}
    >
      {children}
      {configuring && (
        <div className="fpc-dashboard-widget-overlay">
          <div className="fpc-dashboard-widget-overlay__reorder">
            <button
              type="button"
              className="btn btn-sm btn-secondary fpc-dashboard-widget-overlay__btn"
              disabled={isFirst}
              onClick={() => onMoveUp(index)}
              aria-label={`Move ${widget ? widget.label : id} up`}
            >
              &uarr;
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary fpc-dashboard-widget-overlay__btn"
              disabled={isLast}
              onClick={() => onMoveDown(index)}
              aria-label={`Move ${widget ? widget.label : id} down`}
            >
              &darr;
            </button>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger fpc-dashboard-widget-overlay__btn"
            onClick={() => onRemove(id)}
            aria-label={`Remove ${widget ? widget.label : id}`}
          >
            &times; Remove
          </button>
        </div>
      )}
    </div>
  );
};

export const useDragReorder = (widgetIds, setWidgetIds, saveToServer) => {
  const dragIndex = useRef(null);
  const preDragIds = useRef(null);
  const [dragging, setDragging] = useState(false);

  const onDragStart = useCallback(
    (e, index) => {
      dragIndex.current = index;
      preDragIds.current = widgetIds;
      e.dataTransfer.effectAllowed = "move";
      setDragging(true);
    },
    [widgetIds]
  );

  const onDragOver = useCallback(
    (e, overIndex) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const fromIndex = dragIndex.current;
      if (fromIndex === null || fromIndex === overIndex) return;

      setWidgetIds(
        (prev) => {
          const next = [...prev];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(overIndex, 0, moved);
          return next;
        },
        { skipServer: true }
      );
      dragIndex.current = overIndex;
    },
    [setWidgetIds]
  );

  // drop fires before dragend per the HTML5 spec; commit the reorder
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragIndex.current = null;
      preDragIds.current = null;
      setDragging(false);
      saveToServer();
    },
    [saveToServer]
  );

  const onDragEnd = useCallback(() => {
    if (preDragIds.current) {
      setWidgetIds(preDragIds.current);
    }
    dragIndex.current = null;
    preDragIds.current = null;
    setDragging(false);
  }, [setWidgetIds]);

  return { dragging, onDragStart, onDragOver, onDrop, onDragEnd };
};
