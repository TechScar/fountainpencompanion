import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "../components/clustering/App";
import { assignCluster } from "./assignCluster";
import { createMacroClusterAndAssign } from "./createMacroClusterAndAssign";
import { extraColumn } from "./extraColumn";
import { ignoreCluster } from "./ignoreCluster";
import { getMacroClusters, updateMacroCluster } from "./macroClusters";
import { getMicroClusters } from "./microClusters";
import { withDistance } from "./withDistance";
import { ErrorBoundary } from "../../ErrorBoundary";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("micro-clusters-app");
  if (el) {
    const root = createRoot(el);
    root.render(
      <ErrorBoundary>
        <App
          brandSelectorField="simplified_brand_name"
          fields={["brand_name", "line_name", "ink_name"]}
          microClusterLoader={getMicroClusters}
          macroClusterLoader={getMacroClusters}
          macroClusterUpdater={updateMacroCluster}
          assignCluster={assignCluster}
          withDistance={withDistance}
          ignoreCluster={ignoreCluster}
          extraColumn={extraColumn}
          createMacroClusterAndAssign={createMacroClusterAndAssign}
        />
      </ErrorBoundary>
    );
  }
});
