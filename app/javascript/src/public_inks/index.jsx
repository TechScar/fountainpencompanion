import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { ErrorBoundary } from "../ErrorBoundary";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("new-public-inks");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }
});
