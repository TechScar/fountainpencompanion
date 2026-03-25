/* istanbul ignore file */
import React from "react";
import { createRoot } from "react-dom/client";
import { CollectedPens } from "./CollectedPens";
import { ErrorBoundary } from "../ErrorBoundary";

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("#collected-pens .app");
  Array.from(elements).forEach((el) => {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CollectedPens archive={el.getAttribute("data-archive") == "true"} />
      </ErrorBoundary>
    );
  });
});
