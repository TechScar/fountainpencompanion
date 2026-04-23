import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { App } from "./app";

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fpc-review-submission");
  Array.from(elements).forEach((el) => {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <App url={el.dataset.url} />
      </ErrorBoundary>
    );
  });
});
