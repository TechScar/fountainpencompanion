import { useState } from "react";
import { useHiddenFields } from "../../useHiddenFields";
import { Actions } from "../components";
import { fuzzyMatch } from "../match";
import { Cards } from "./Cards";

export const storageKeyHiddenFields = "fpc-collected-inks-cards-hidden-fields";

export const CollectedInksCards = ({ data, archive, onLayoutChange }) => {
  const { hiddenFields, onHiddenFieldsChange } = useHiddenFields(storageKeyHiddenFields);
  const [matchOn, setMatchOn] = useState("");
  const visible = fuzzyMatch(data, matchOn, hiddenFields);

  return (
    <div>
      <Actions
        archive={archive}
        activeLayout="card"
        numberOfInks={data.length}
        onFilterChange={setMatchOn}
        onLayoutChange={onLayoutChange}
        hiddenFields={hiddenFields}
        onHiddenFieldsChange={onHiddenFieldsChange}
      />
      <Cards data={visible} hiddenFields={hiddenFields} />
    </div>
  );
};
