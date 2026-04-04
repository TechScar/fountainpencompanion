import React from "react";
import { SharedGridCards } from "../../components/SharedGridCards";
import { InkCard } from "./InkCard";

export const CollectedInksCards = ({ inks, hiddenFields }) => {
  return (
    <SharedGridCards
      data={inks}
      hiddenFields={hiddenFields}
      renderCard={(row, i) => (
        <InkCard key={row.id + "i" + i} hiddenFields={hiddenFields} {...row} />
      )}
    />
  );
};
