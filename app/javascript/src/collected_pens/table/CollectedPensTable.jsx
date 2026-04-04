import _ from "lodash";
import React, { useMemo } from "react";
import { RelativeDate } from "../../components/RelativeDate";
import { renderCountFooter, SharedGridTable } from "../../components/SharedGridTable";
import { WithLink } from "../../components/WithLink";
import { ActionsCell } from "./ActionsCell";
import { dateSort } from "./sort";

export const CollectedPensTable = ({ pens, hiddenFields, onHiddenFieldsChange }) => {
  const columns = useMemo(
    () => [
      {
        header: "Brand",
        accessorKey: "brand",
        footer: ({ table }) => {
          const rows = table.getFilteredRowModel().rows;
          const uniqueBrands = _.uniqBy(rows, (row) => row.original.brand).length;
          return renderCountFooter(uniqueBrands, "brand");
        }
      },
      {
        header: "Model",
        accessorKey: "model",
        cell: ({ getValue, row }) => {
          const model_variant_id = row.original.model_variant_id;
          return (
            <WithLink href={model_variant_id ? `/pen_variants/${model_variant_id}` : null}>
              {getValue()}
            </WithLink>
          );
        },
        footer: ({ table }) => {
          return renderCountFooter(table.getFilteredRowModel().rows.length, "pen");
        }
      },
      {
        header: "Nib",
        accessorKey: "nib"
      },
      {
        header: "Color",
        accessorKey: "color"
      },
      {
        header: "Material",
        accessorKey: "material"
      },
      {
        header: "Trim Color",
        accessorKey: "trim_color"
      },
      {
        header: "Filling System",
        accessorKey: "filling_system"
      },
      {
        header: "Price",
        accessorKey: "price"
      },
      {
        header: "Comment",
        accessorKey: "comment"
      },
      {
        header: "Usage",
        accessorKey: "usage",
        sortDescFirst: true
      },
      {
        header: "Daily Usage",
        accessorKey: "daily_usage",
        sortDescFirst: true
      },
      {
        header: "Last Usage",
        accessorKey: "last_used_on",
        sortDescFirst: true,
        sortingFn: dateSort,
        cell: ({ getValue }) => <RelativeDate date={getValue()} />
      },
      {
        header: "Added On",
        accessorKey: "created_at",
        cell: ({ getValue }) => <RelativeDate date={getValue()} relativeAsDefault={false} />
      },
      {
        header: "Actions",
        meta: { className: "fpc-actions-column" },
        cell: ({ row }) => {
          return <ActionsCell {...row.original} id={row.original.id} />;
        }
      }
    ],
    []
  );

  return (
    <SharedGridTable
      columns={columns}
      data={pens}
      hiddenFields={hiddenFields}
      onHiddenFieldsChange={onHiddenFieldsChange}
    />
  );
};
