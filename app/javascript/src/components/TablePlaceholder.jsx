import React from "react";
import { useDelayedRender } from "../useDelayedRender";
import { ToolbarPlaceholder } from "./ToolbarPlaceholder";

export const TablePlaceholder = () => {
  const shouldRender = useDelayedRender(250);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="placeholder-glow" data-testid="table-placeholder">
      <ToolbarPlaceholder />
      <div className="placeholder placeholder-lg col-12" />
      <div className="placeholder placeholder-lg bg-secondary col-12" />
      <div className="placeholder placeholder-lg col-12" />
      <div className="placeholder placeholder-lg bg-secondary col-12" />
      <div className="placeholder placeholder-lg col-12" />
      <div className="placeholder placeholder-lg bg-secondary col-12" />
    </div>
  );
};
