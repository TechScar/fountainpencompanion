/* istanbul ignore file */
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { UsageRecordForm } from "./UsageRecordForm";

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
