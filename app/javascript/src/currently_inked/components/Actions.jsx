import _ from "lodash";
import React, { useMemo, useState } from "react";
import { CollectionToolbar } from "../../components/CollectionToolbar";
import { pluralizedCountLabel } from "../../components/CollectionUtils";

/**
 * @param {{ archive: boolean; activeLayout: "card" | "table"; numberOfEntries: number; hiddenFields: string[]; onHiddenFieldsChange: (newValues: string[]) => void; onFilterChange: (val: string | undefined) => void; onLayoutChange: (e: import('react').ChangeEvent) => void; }} props
 */
export const Actions = ({
  archive,
  activeLayout,
  numberOfEntries,
  hiddenFields,
  onHiddenFieldsChange,
  onFilterChange,
  onLayoutChange
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const debouncedOnFilterChange = useMemo(
    () =>
      _.debounce(
        (value) => {
          onFilterChange(value);
        },
        Math.min(numberOfEntries / 10, 500)
      ),
    [onFilterChange, numberOfEntries]
  );

  const links = archive
    ? []
    : [
        { href: "/currently_inked.csv", label: "Export" },
        { href: "/usage_records", label: "Usage" },
        { href: "/currently_inked/archive", label: "Archive" }
      ];

  const switchFields = [
    { name: "comment", label: <>Show&nbsp;comment</> },
    { name: "pen_name", label: <>Show&nbsp;pen</> },
    { name: "inked_on", label: <>Show&nbsp;date&nbsp;inked</> },
    { name: "last_used_on", label: <>Show&nbsp;last&nbsp;used</> },
    { name: "daily_usage", label: <>Show&nbsp;usage</> }
  ];

  return (
    <CollectionToolbar
      activeLayout={activeLayout}
      onLayoutChange={onLayoutChange}
      hiddenFields={hiddenFields}
      onHiddenFieldsChange={onHiddenFieldsChange}
      switchFields={switchFields}
      links={links}
      searchValue={globalFilter}
      onSearchChange={(nextValue) => {
        setGlobalFilter(nextValue);
        debouncedOnFilterChange(nextValue);
      }}
      searchPlaceholder={`Type to search in ${pluralizedCountLabel(numberOfEntries, "entry", "entries")}`}
      addHref={archive ? undefined : "/currently_inked/new"}
      addLabel="Add entry"
      searchMinWidth="205px"
    />
  );
};
