import React, { useMemo, useState } from "react";
import { currentlyInkedCollectionEmptyStateMessage } from "../collectionEmptyStateMessages";
import { CollectionEmptyStateAlert } from "../components/CollectionEmptyStateAlert";
import { useHiddenFields } from "../useHiddenFields";
import { CurrentlyInkedCards } from "./cards/CurrentlyInkedCards";
import { Actions } from "./components/Actions";
import { fuzzyMatch } from "./match";
import { CurrentlyInkedTable } from "./table/CurrentlyInkedTable";

const storageKeyHiddenFieldsCards = "fpc-currently-inked-cards-hidden-fields";
const storageKeyHiddenFieldsTable = "fpc-currently-inked-table-hidden-fields";

export const CurrentlyInkedContent = ({
  currentlyInked,
  archive,
  showCards,
  onLayoutChange,
  onUsageRecorded
}) => {
  const isEmpty = currentlyInked.length === 0;

  const defaultTableHiddenFields = useMemo(
    () => ["comment"].filter((n) => !currentlyInked.some((e) => e[n])),
    [currentlyInked]
  );

  const { hiddenFields: cardsHiddenFields, onHiddenFieldsChange: onCardsHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsCards);
  const { hiddenFields: tableHiddenFields, onHiddenFieldsChange: onTableHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsTable, defaultTableHiddenFields);

  const hiddenFields = showCards ? cardsHiddenFields : tableHiddenFields;
  const onHiddenFieldsChange = showCards ? onCardsHiddenFieldsChange : onTableHiddenFieldsChange;

  const [filterText, setFilterText] = useState("");

  const filteredEntries = useMemo(
    () => fuzzyMatch(currentlyInked, filterText, hiddenFields),
    [currentlyInked, filterText, hiddenFields]
  );

  return (
    <>
      <Actions
        archive={archive}
        activeLayout={showCards ? "card" : "table"}
        numberOfEntries={currentlyInked.length}
        hiddenFields={hiddenFields}
        onHiddenFieldsChange={onHiddenFieldsChange}
        onFilterChange={(value) => setFilterText(value || "")}
        onLayoutChange={onLayoutChange}
      />

      {isEmpty && (
        <CollectionEmptyStateAlert>
          {currentlyInkedCollectionEmptyStateMessage(archive)}
        </CollectionEmptyStateAlert>
      )}

      {!isEmpty &&
        (showCards ? (
          <CurrentlyInkedCards
            currentlyInked={filteredEntries}
            hiddenFields={hiddenFields}
            onUsageRecorded={onUsageRecorded}
          />
        ) : (
          <CurrentlyInkedTable
            currentlyInked={filteredEntries}
            hiddenFields={hiddenFields}
            onHiddenFieldsChange={onHiddenFieldsChange}
            onUsageRecorded={onUsageRecorded}
          />
        ))}
    </>
  );
};
