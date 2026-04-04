import _ from "lodash";
import React, { useMemo, useState } from "react";
import { CollectionToolbar } from "../../components/CollectionToolbar";
import { pluralizedCountLabel } from "../../components/CollectionUtils";

/**
 * @param {{ archive: boolean; activeLayout: "card" | "table"; numberOfInks: number; hiddenFields: string[]; onHiddenFieldsChange: (newValues: string[]) => void; onFilterChange: (val: string | undefined) => void; onLayoutChange: (e: import('react').ChangeEvent) => void; }} props
 */
export const Actions = ({
  archive,
  activeLayout,
  numberOfInks,
  hiddenFields,
  onHiddenFieldsChange,
  onFilterChange,
  onLayoutChange
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  // We debounce to not melt mountainofinks' phone when filtering :D
  const debouncedOnFilterChange = useMemo(
    () =>
      _.debounce(
        (value) => {
          onFilterChange(value);
        },
        Math.min(numberOfInks / 10, 500)
      ),
    [onFilterChange, numberOfInks]
  );

  const links = archive
    ? []
    : [
        { href: "/collected_inks/import", label: "Import" },
        { href: "/collected_inks.csv", label: "Export" },
        { href: "/collected_inks/archive", label: "Archive" }
      ];

  const switchFields = [
    { name: "private", label: <>Show&nbsp;private</> },
    { name: "maker", label: <>Show&nbsp;maker</> },
    { name: "kind", label: <>Show&nbsp;type</> },
    { name: "swabbed", label: <>Show&nbsp;swabbed</> },
    { name: "used", label: <>Show&nbsp;used</> },
    { name: "usage", label: <>Show&nbsp;usage</> },
    { name: "daily_usage", label: <>Show&nbsp;daily&nbsp;usage</> },
    { name: "last_used_on", label: <>Show&nbsp;last&nbsp;usage</> },
    { name: "created_at", label: <>Show&nbsp;Added&nbsp;On</> },
    { name: "comment", label: <>Show&nbsp;comment</> },
    { name: "private_comment", label: <>Show&nbsp;private&nbsp;comment</> },
    { name: "tags", label: <>Show&nbsp;tags</> },
    { name: "cluster_tags", label: <>Show&nbsp;cluster&nbsp;tags</> }
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
      searchPlaceholder={`Type to search in ${pluralizedCountLabel(numberOfInks, "ink")}`}
      addHref={archive ? undefined : "/collected_inks/new"}
      addLabel="Add ink"
      searchMinWidth="205px"
    />
  );
};
