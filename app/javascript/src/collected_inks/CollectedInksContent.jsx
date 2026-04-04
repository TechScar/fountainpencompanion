import React, { useMemo, useState } from "react";
import { inkCollectionEmptyStateMessage } from "../collectionEmptyStateMessages";
import { CollectionEmptyStateAlert } from "../components/CollectionEmptyStateAlert";
import { useHiddenFields } from "../useHiddenFields";
import { CollectedInksCards } from "./cards";
import { Actions } from "./components";
import { fuzzyMatch } from "./match";
import { CollectedInksTable } from "./table";

const storageKeyHiddenFieldsCards = "fpc-collected-inks-cards-hidden-fields";
const storageKeyHiddenFieldsTable = "fpc-collected-inks-table-hidden-fields";

const defaultHiddenFieldsList = [
  "private",
  "private_comment",
  "comment",
  "maker",
  "line_name",
  "kind",
  "daily_usage",
  "last_used_on"
];

export const CollectedInksContent = ({ inks, archive, showCards, onLayoutChange }) => {
  const isEmpty = inks.length === 0;

  const defaultHiddenFields = useMemo(
    () => defaultHiddenFieldsList.filter((n) => !inks.some((e) => e[n])),
    [inks]
  );

  const defaultHiddenFieldsTable = useMemo(() => {
    const fields = [...defaultHiddenFieldsList];
    if (inks.every((e) => !Array.isArray(e.tags) || e.tags.length === 0)) {
      fields.push("tags");
    }
    if (inks.every((e) => !Array.isArray(e.cluster_tags) || e.cluster_tags.length === 0)) {
      fields.push("cluster_tags");
    }
    return fields;
  }, [inks]);

  const { hiddenFields: cardsHiddenFields, onHiddenFieldsChange: onCardsHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsCards, defaultHiddenFields);
  const { hiddenFields: tableHiddenFields, onHiddenFieldsChange: onTableHiddenFieldsChange } =
    useHiddenFields(storageKeyHiddenFieldsTable, defaultHiddenFieldsTable);

  const hiddenFields = showCards ? cardsHiddenFields : tableHiddenFields;
  const onHiddenFieldsChange = showCards ? onCardsHiddenFieldsChange : onTableHiddenFieldsChange;

  const [filterText, setFilterText] = useState("");

  const filteredInks = useMemo(
    () => fuzzyMatch(inks, filterText, hiddenFields),
    [inks, filterText, hiddenFields]
  );

  return (
    <>
      <Actions
        archive={archive}
        activeLayout={showCards ? "card" : "table"}
        numberOfInks={inks.length}
        hiddenFields={hiddenFields}
        onHiddenFieldsChange={onHiddenFieldsChange}
        onFilterChange={(value) => setFilterText(value || "")}
        onLayoutChange={onLayoutChange}
      />

      {isEmpty && (
        <CollectionEmptyStateAlert>
          {inkCollectionEmptyStateMessage(archive)}
        </CollectionEmptyStateAlert>
      )}

      {!isEmpty &&
        (showCards ? (
          <CollectedInksCards inks={filteredInks} hiddenFields={hiddenFields} />
        ) : (
          <CollectedInksTable
            inks={filteredInks}
            hiddenFields={hiddenFields}
            onHiddenFieldsChange={onHiddenFieldsChange}
          />
        ))}
    </>
  );
};
