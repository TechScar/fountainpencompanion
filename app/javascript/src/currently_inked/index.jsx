/* istanbul ignore file */
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "../ErrorBoundary";
import { CurrentlyInked } from "./CurrentlyInked";

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("#currently-inked-app");
  Array.from(elements).forEach((el) => {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CurrentlyInked />
      </ErrorBoundary>
    );
  });
});
