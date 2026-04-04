import React, { useMemo, useState } from "react";
import { penCollectionEmptyStateMessage } from "../collectionEmptyStateMessages";
import { CollectionEmptyStateAlert } from "../components/CollectionEmptyStateAlert";
import { useHiddenFields } from "../useHiddenFields";
import { CollectedPensCards } from "./cards/CollectedPensCards";
import { Actions } from "./components/Actions";
import { fuzzyMatch } from "./match";
import { CollectedPensTable } from "./table/CollectedPensTable";

const storageKeyHiddenFieldsCards = "fpc-collected-pens-cards-hidden-fields";
const storageKeyHiddenFieldsTable = "fpc-collected-pens-table-hidden-fields";

const defaultHiddenFieldsList = [
  "nib",
  "color",
  "comment",
  "usage",
  "daily_usage",
  "last_used_on",
  "material",
  "price",
  "trim_color",
  "filling_system"
];

export const CollectedPensContent = ({ pens, archive, showCards, onLayoutChange }) => {
  const isEmpty = pens.length === 0;

  const defaultHiddenFields = useMemo(
    () => defaultHiddenFieldsList.filter((n) => !pens.some((e) => e[n])),
    [pens]
  );

  const { hiddenFields: cardsHiddenFields, onHiddenFieldsChange: onCardsHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsCards, defaultHiddenFields);
  const { hiddenFields: tableHiddenFields, onHiddenFieldsChange: onTableHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsTable, defaultHiddenFields);

  const hiddenFields = showCards ? cardsHiddenFields : tableHiddenFields;
  const onHiddenFieldsChange = showCards ? onCardsHiddenFieldsChange : onTableHiddenFieldsChange;

  const [filterText, setFilterText] = useState("");

  const filteredPens = useMemo(
    () => fuzzyMatch(pens, filterText, hiddenFields),
    [pens, filterText, hiddenFields]
  );

  return (
    <>
      <Actions
        archive={archive}
        activeLayout={showCards ? "card" : "table"}
        numberOfPens={pens.length}
        hiddenFields={hiddenFields}
        onHiddenFieldsChange={onHiddenFieldsChange}
        onFilterChange={(value) => setFilterText(value || "")}
        onLayoutChange={onLayoutChange}
      />

      {isEmpty && (
        <CollectionEmptyStateAlert>
          {penCollectionEmptyStateMessage(archive)}
        </CollectionEmptyStateAlert>
      )}

      {!isEmpty &&
        (showCards ? (
          <CollectedPensCards pens={filteredPens} hiddenFields={hiddenFields} />
        ) : (
          <CollectedPensTable
            pens={filteredPens}
            hiddenFields={hiddenFields}
            onHiddenFieldsChange={onHiddenFieldsChange}
          />
        ))}
    </>
  );
};
