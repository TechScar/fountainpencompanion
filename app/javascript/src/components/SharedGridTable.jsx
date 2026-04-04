import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import { pluralizedCountLabel } from "./CollectionUtils";
import { Table } from "./Table";

const toColumnVisibility = (hiddenFields) =>
  hiddenFields.reduce((acc, field) => ({ ...acc, [field]: false }), {});

const sameHiddenFields = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((field) => rightSet.has(field));
};

const uniqueFields = (fields) => Array.from(new Set(fields));

const toResponsiveHiddenFields = (responsiveHiddenFields, width) => {
  if (!responsiveHiddenFields || typeof responsiveHiddenFields !== "function") {
    return [];
  }

  return responsiveHiddenFields(width) || [];
};

export const renderCountFooter = (count, singular, plural) => (
  <strong>{pluralizedCountLabel(count, singular, plural)}</strong>
);

export const SharedGridTable = ({
  columns,
  data = [],
  hiddenFields = [],
  onHiddenFieldsChange = () => {},
  getRowId,
  initialSorting = [],
  responsiveHiddenFields
}) => {
  const [sorting, setSorting] = useState(initialSorting);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : undefined
  );

  useEffect(() => {
    if (!responsiveHiddenFields || typeof window === "undefined") {
      return;
    }

    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [responsiveHiddenFields]);

  const hiddenByViewport = useMemo(
    () => toResponsiveHiddenFields(responsiveHiddenFields, windowWidth),
    [responsiveHiddenFields, windowWidth]
  );

  const effectiveHiddenFields = useMemo(
    () => uniqueFields([...hiddenFields, ...hiddenByViewport]),
    [hiddenFields, hiddenByViewport]
  );

  const columnVisibility = useMemo(
    () => toColumnVisibility(effectiveHiddenFields),
    [effectiveHiddenFields]
  );

  // TanStack Table is not React Compiler-compatible; this component opts out above.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
      sorting
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      const nextVisibility =
        typeof updater === "function" ? updater(columnVisibility) : updater || columnVisibility;
      const nextHiddenFields = Object.keys(nextVisibility).filter((key) => !nextVisibility[key]);
      const persistedHiddenFields = nextHiddenFields.filter(
        (field) => !hiddenByViewport.includes(field)
      );

      if (!sameHiddenFields(persistedHiddenFields, hiddenFields)) {
        onHiddenFieldsChange(persistedHiddenFields);
      }
    }
  });

  const getTableProps = () => ({});
  const getTableBodyProps = () => ({});

  const headerGroups = table.getHeaderGroups().map((headerGroup) => ({
    ...headerGroup,
    getHeaderGroupProps: () => ({}),
    headers: headerGroup.headers.map((header) => ({
      ...header,
      getHeaderProps: (userProps = {}) => {
        const metaClass = header.column.columnDef?.meta?.className;
        const mergedClassName = [
          userProps.className,
          metaClass,
          header.column.getCanSort() ? "fpc-sortable-column" : null
        ]
          .filter(Boolean)
          .join(" ");
        const title = header.column.getCanSort() ? "Toggle SortBy" : undefined;
        return {
          ...userProps,
          className: mergedClassName,
          colSpan: 1,
          title
        };
      },
      getSortByToggleProps: () => ({
        onClick: header.column.getToggleSortingHandler?.()
      }),
      getIsSorted: () => header.column.getIsSorted?.(),
      isSorted: header.column.getIsSorted?.() ? true : false,
      isSortedDesc: header.column.getIsSorted?.() === "desc",
      render: (type) => {
        if (type === "Header") {
          return flexRender(header.column.columnDef.header, header.getContext());
        }
        return null;
      }
    }))
  }));

  const footerGroups = table.getFooterGroups().map((footerGroup) => ({
    ...footerGroup,
    getFooterGroupProps: () => ({}),
    headers: footerGroup.headers.map((header) => ({
      ...header,
      getFooterProps: () => {
        const metaClass = header.column.columnDef?.meta?.className;
        return metaClass ? { className: metaClass, colSpan: 1 } : { colSpan: 1 };
      },
      render: (type) => {
        if (type === "Footer") {
          return flexRender(header.column.columnDef.footer, header.getContext());
        }
        return null;
      }
    }))
  }));

  const rows = table.getRowModel().rows.map((row) => ({
    ...row,
    getRowProps: () => ({}),
    cells: row.getVisibleCells().map((cell) => ({
      ...cell,
      getCellProps: () => {
        const metaClass = cell.column.columnDef?.meta?.className;
        return metaClass ? { className: metaClass, colSpan: 1 } : { colSpan: 1 };
      }
    }))
  }));

  const prepareRow = () => {};

  return (
    <div className="fpc-table-grid">
      <Table
        hiddenFields={effectiveHiddenFields}
        getTableProps={getTableProps}
        headerGroups={headerGroups}
        getTableBodyProps={getTableBodyProps}
        rows={rows}
        prepareRow={prepareRow}
        footerGroups={footerGroups}
      />
    </div>
  );
};
