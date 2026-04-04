import React from "react";

export const ToolbarPlaceholder = () => (
  <div
    className="d-flex flex-wrap justify-content-end align-items-center mb-3"
    data-testid="toolbar-placeholder"
  >
    <div className="placeholder bg-primary col-1 me-1" />
    <div className="placeholder bg-primary col-1 me-1" />
    <div className="placeholder bg-primary col-1" />
    <div className="placeholder placeholder-lg col-3 m-2" />
    <div className="placeholder placeholder-lg bg-success col-1" />
  </div>
);
