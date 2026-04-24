/* istanbul ignore file */
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { CollectedInks } from "./CollectedInks";

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("#collected-inks .app");
  Array.from(elements).forEach((el) => {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CollectedInks archive={el.getAttribute("data-archive") == "true"} />
      </ErrorBoundary>
    );
  });
});
