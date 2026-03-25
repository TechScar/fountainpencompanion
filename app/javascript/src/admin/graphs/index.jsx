import React from "react";
import { createRoot } from "react-dom/client";

import { SignUps } from "./SignUps";
import { CollectedInks } from "./CollectedInks";
import { CollectedPens } from "./CollectedPens";
import { CurrentlyInked } from "./CurrentlyInked";
import { UsageRecords } from "./UsageRecords";
// // import { BotSignUps } from "./BotSignUps";
// import { Spam } from "./Spam";
import { Agents } from "./Agents";
import { AgentUsage } from "./AgentUsage";
import { ErrorBoundary } from "../../ErrorBoundary";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("signups-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <SignUps />
      </ErrorBoundary>
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("agents-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <Agents />
      </ErrorBoundary>
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("agent-usage-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <AgentUsage />
      </ErrorBoundary>
    );
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   const el = document.getElementById("bot-signups-graph");
//   if (el) {
//     const root = createRoot(el);
//     root.render(<BotSignUps />);
//   }
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const el = document.getElementById("spam-graph");
//   if (el) {
//     const root = createRoot(el);
//     root.render(<Spam />);
//   }
// });

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("collected-inks-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CollectedInks />
      </ErrorBoundary>
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("collected-pens-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CollectedPens />
      </ErrorBoundary>
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("currently-inked-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <CurrentlyInked />
      </ErrorBoundary>
    );
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("usage-records-graph");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <UsageRecords />
      </ErrorBoundary>
    );
  }
});
