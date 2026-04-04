import React from "react";
import { CollectionListPageShell } from "../components/CollectionListPageShell";
import {
  CollectionLoadingPlaceholder,
  shouldUseCardLayout
} from "../components/CollectionLoadingPlaceholder";
import { useLayout } from "../useLayout";
import { useScreen } from "../useScreen";
import { CollectedPensContent } from "./CollectedPensContent";

export const storageKeyLayout = "fpc-collected-pens-layout";

export const CollectedPens = ({ archive }) => {
  const screen = useScreen();
  const { layout, onLayoutChange } = useLayout(storageKeyLayout);
  const showCards = shouldUseCardLayout(layout, screen.isSmall);

  const endpoint = archive
    ? "/api/v1/collected_pens.json?filter[archived]=true"
    : "/api/v1/collected_pens.json?filter[archived]=false";

  const loadingComponent = <CollectionLoadingPlaceholder showCards={showCards} />;

  return (
    <CollectionListPageShell endpoint={endpoint} loadingComponent={loadingComponent} paginated>
      {(pens) => (
        <CollectedPensContent
          pens={pens}
          archive={archive}
          showCards={showCards}
          onLayoutChange={onLayoutChange}
        />
      )}
    </CollectionListPageShell>
  );
};
