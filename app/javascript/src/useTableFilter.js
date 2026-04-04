import React from "react";

export const useTableFilter = (data, hiddenFields, fuzzyMatch) => {
  const [filterText, setFilterText] = React.useState("");

  const filteredData = React.useMemo(
    () => fuzzyMatch(data, filterText, hiddenFields),
    [data, filterText, hiddenFields, fuzzyMatch]
  );

  const setGlobalFilter = (value) => setFilterText(value || "");

  return { filteredData, setGlobalFilter };
};
