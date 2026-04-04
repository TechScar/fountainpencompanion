import React from "react";
import { CardsPlaceholder } from "./CardsPlaceholder";
import { TablePlaceholder } from "./TablePlaceholder";

export const shouldUseCardLayout = (layout, isSmall) => {
  return layout === "card" || (!layout && isSmall);
};

export const CollectionLoadingPlaceholder = ({ showCards }) => {
  return showCards ? <CardsPlaceholder /> : <TablePlaceholder />;
};
