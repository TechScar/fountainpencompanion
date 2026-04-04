import React from "react";
import { useDelayedRender } from "../useDelayedRender";
import { CardPlaceholder } from "./CardPlaceholder";
import "./cards.scss";
import { ToolbarPlaceholder } from "./ToolbarPlaceholder";

export const CardsPlaceholder = () => {
  const shouldRender = useDelayedRender(250);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="placeholder-glow" data-testid="cards-placeholder">
      <ToolbarPlaceholder />
      <div className="fpc-placeholder-cards">
        <CardPlaceholder />
        <CardPlaceholder />
        <CardPlaceholder />
        <CardPlaceholder />
      </div>
    </div>
  );
};
