import { useState } from "react";
import { useHiddenFields } from "../../useHiddenFields";
import { Actions } from "../components/Actions";
import { fuzzyMatch } from "../match";
import { Cards } from "./Cards";

export const storageKeyHiddenFields = "fpc-currently-inked-cards-hidden-fields";

export const CurrentlyInkedCards = ({ currentlyInked, onLayoutChange, onUsageRecorded }) => {
  const { hiddenFields, onHiddenFieldsChange } = useHiddenFields(storageKeyHiddenFields);
  const [matchOn, setMatchOn] = useState("");
  const visible = fuzzyMatch(currentlyInked, matchOn, hiddenFields);

  return (
    <div data-testid="card-layout">
      <Actions
        activeLayout="card"
        numberOfEntries={currentlyInked.length}
        onFilterChange={setMatchOn}
        onLayoutChange={onLayoutChange}
        hiddenFields={hiddenFields}
        onHiddenFieldsChange={onHiddenFieldsChange}
      />
      <Cards data={visible} hiddenFields={hiddenFields} onUsageRecorded={onUsageRecorded} />
    </div>
  );
};
