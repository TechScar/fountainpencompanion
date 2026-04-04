import React from "react";
import { SharedGridCards } from "../../components/SharedGridCards";
import { PenCard } from "./PenCard";

export const CollectedPensCards = ({ pens, hiddenFields }) => {
  return (
    <SharedGridCards
      data={pens}
      hiddenFields={hiddenFields}
      renderCard={(row, i) => (
        <PenCard key={row.id + "i" + i} hiddenFields={hiddenFields} {...row} />
      )}
    />
  );
};
