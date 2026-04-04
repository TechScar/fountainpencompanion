import _ from "lodash";
import React from "react";
import {
  CollectionLoadingPlaceholder,
  shouldUseCardLayout
} from "../components/CollectionLoadingPlaceholder";
import { CollectionListPageShell } from "../components/CollectionListPageShell";
import { useLayout } from "../useLayout";
import { useScreen } from "../useScreen";
import { CurrentlyInkedContent } from "./CurrentlyInkedContent";

export const storageKeyLayout = "fpc-currently-inked-layout";

export const CurrentlyInked = ({ archive }) => {
  const screen = useScreen();
  const { layout, onLayoutChange } = useLayout(storageKeyLayout);
  const showCards = shouldUseCardLayout(layout, screen.isSmall);

  const endpoint = archive
    ? "/api/v1/currently_inked.json?filter[archived]=true"
    : "/api/v1/currently_inked.json?filter[archived]=false";

  const loadingComponent = <CollectionLoadingPlaceholder showCards={showCards} />;

  return (
    <CollectionListPageShell
      endpoint={endpoint}
      loadingComponent={loadingComponent}
      paginated
      // Hack to keep the default sort order of the table and the card view the same.
      // Will eventually (ha!) be replaced by a sorting capability for the card view.
      postProcess={(items) => _.sortBy(items, "pen_name")}
    >
      {(currentlyInked, setCurrentlyInked) => {
        const updateEntry = (updatedEntry) => {
          setCurrentlyInked((prev) =>
            prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
          );
        };

        return (
          <CurrentlyInkedContent
            currentlyInked={currentlyInked}
            archive={archive}
            showCards={showCards}
            onLayoutChange={onLayoutChange}
            onUsageRecorded={updateEntry}
          />
        );
      }}
    </CollectionListPageShell>
  );
};
