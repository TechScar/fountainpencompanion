/* istanbul ignore file */
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { CollectedPens } from "./CollectedPens";

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
