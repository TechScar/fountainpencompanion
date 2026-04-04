import React from "react";
import { SharedGridCards } from "../../components/SharedGridCards";
import { CurrentlyInkedCard } from "./CurrentlyInkedCard";

export const CurrentlyInkedCards = ({ currentlyInked, hiddenFields, onUsageRecorded }) => {
  return (
    <div data-testid="card-layout">
      <SharedGridCards
        data={currentlyInked}
        hiddenFields={hiddenFields}
        renderCard={(row, i) => (
          <CurrentlyInkedCard
            key={row.id + "i" + i}
            hiddenFields={hiddenFields}
            onUsageRecorded={onUsageRecorded}
            {...row}
          />
        )}
      />
    </div>
  );
};
