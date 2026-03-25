/* istanbul ignore file */
import React from "react";
import { createRoot } from "react-dom/client";
import { UsageRecordForm } from "./UsageRecordForm";
import { ErrorBoundary } from "../ErrorBoundary";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("usage-record-form-app");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <UsageRecordForm />
      </ErrorBoundary>
    );
  }
});
