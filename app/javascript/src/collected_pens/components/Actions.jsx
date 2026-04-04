import _ from "lodash";
import React, { useMemo, useState } from "react";
import { CollectionToolbar } from "../../components/CollectionToolbar";
import { pluralizedCountLabel } from "../../components/CollectionUtils";

/**
 * @param {{ archive: boolean; activeLayout: "card" | "table"; numberOfPens: number; hiddenFields: string[]; onHiddenFieldsChange: (newValues: string[]) => void; onFilterChange: (val: string | undefined) => void; onLayoutChange: (e: import('react').ChangeEvent) => void; }} props
 */
export const Actions = ({
  archive,
  activeLayout,
  numberOfPens,
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
        Math.min(numberOfPens / 10, 500)
      ),
    [onFilterChange, numberOfPens]
  );

  const links = archive
    ? []
    : [
        { href: "/collected_pens/import", label: "Import" },
        { href: "/collected_pens.csv", label: "Export" },
        { href: "/collected_pens/archive", label: "Archive" }
      ];

  const switchFields = [
    { name: "nib", label: <>Show&nbsp;nib</> },
    { name: "color", label: <>Show&nbsp;color</> },
    { name: "material", label: <>Show&nbsp;material</> },
    { name: "trim_color", label: <>Show&nbsp;trim&nbsp;color</> },
    { name: "filling_system", label: <>Show&nbsp;filling&nbsp;system</> },
    { name: "price", label: <>Show&nbsp;price</> },
    { name: "comment", label: <>Show&nbsp;comment</> },
    { name: "usage", label: <>Show&nbsp;usage</> },
    { name: "daily_usage", label: <>Show&nbsp;daily&nbsp;usage</> },
    { name: "last_used_on", label: <>Show&nbsp;last&nbsp;usage</> },
    { name: "created_at", label: <>Show&nbsp;Added&nbsp;On</> }
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
      searchPlaceholder={`Type to search in ${pluralizedCountLabel(numberOfPens, "pen")}`}
      addHref={archive ? undefined : "/collected_pens/new"}
      addLabel="Add pen"
      searchMinWidth="205px"
    />
  );
};
