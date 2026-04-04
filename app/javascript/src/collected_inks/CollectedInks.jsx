import React from "react";
import { CollectionListPageShell } from "../components/CollectionListPageShell";
import {
  CollectionLoadingPlaceholder,
  shouldUseCardLayout
} from "../components/CollectionLoadingPlaceholder";
import { useLayout } from "../useLayout";
import { useScreen } from "../useScreen";
import { CollectedInksContent } from "./CollectedInksContent";

export const storageKeyLayout = "fpc-collected-inks-layout";

/**
 * @param {{ archive: boolean }} props
 */
export const CollectedInks = ({ archive }) => {
  const screen = useScreen();
  const { layout, onLayoutChange } = useLayout(storageKeyLayout);
  const showCards = shouldUseCardLayout(layout, screen.isSmall);

  const endpoint = archive
    ? "/api/v1/collected_inks.json?filter[archived]=true"
    : "/api/v1/collected_inks.json?filter[archived]=false";

  const loadingComponent = <CollectionLoadingPlaceholder showCards={showCards} />;

  return (
    <CollectionListPageShell endpoint={endpoint} loadingComponent={loadingComponent} paginated>
      {(inks) => (
        <CollectedInksContent
          inks={inks}
          archive={archive}
          showCards={showCards}
          onLayoutChange={onLayoutChange}
        />
      )}
    </CollectionListPageShell>
  );
};
