import _ from "lodash";
import React, { useMemo } from "react";
import { ColorSwatchCell } from "../../components/ColorSwatchCell";
import { RelativeDate } from "../../components/RelativeDate";
import { renderCountFooter, SharedGridTable } from "../../components/SharedGridTable";
import { WithLink } from "../../components/WithLink";
import { ActionsCell } from "./ActionsCell";
import { colorSort } from "./sort";

export const CurrentlyInkedTable = ({
  currentlyInked,
  hiddenFields,
  onHiddenFieldsChange,
  onUsageRecorded
}) => {
  const columns = useMemo(
    () => [
      {
        header: "Pen",
        accessorKey: "pen_name",
        cell: ({ getValue, row }) => {
          const model_variant_id = row.original.collected_pen.model_variant_id;
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
        header: "Color",
        accessorKey: "collected_ink.color",
        sortingFn: colorSort,
        cell: ({ getValue }) => <ColorSwatchCell value={getValue()} />
      },
      {
        header: "Ink",
        accessorKey: "ink_name",
        cell: ({ getValue, row }) => {
          const value = getValue();
          const micro_cluster = row.original.collected_ink.micro_cluster;
          if (!micro_cluster) return value;

          const macro_cluster = micro_cluster.macro_cluster;
          if (!macro_cluster) return value;

          const public_id = macro_cluster.id;
          const link = `/inks/${public_id}`;
          return <WithLink href={link}>{value}</WithLink>;
        },
        footer: ({ table }) => {
          const rows = table.getFilteredRowModel().rows;
          const ink_names = rows.map((row) => {
            const { brand_name, line_name, ink_name } = row.original.collected_ink;
            return [brand_name, line_name, ink_name].join();
          });
          const uniqueInkNames = _.uniq(ink_names);
          const count = uniqueInkNames.length;
          return renderCountFooter(count, "ink");
        }
      },
      {
        header: "Date Inked",
        accessorKey: "inked_on",
        cell: ({ getValue }) => <RelativeDate date={getValue()} relativeAsDefault={false} />
      },
      {
        header: "Last Used",
        accessorKey: "last_used_on",
        sortDescFirst: true,
        cell: ({ getValue }) => <RelativeDate date={getValue()} />
      },
      {
        header: "Usage",
        accessorKey: "daily_usage"
      },
      {
        header: "Comment",
        accessorKey: "comment"
      },
      {
        header: "Actions",
        meta: { className: "fpc-actions-column" },
        cell: ({ row }) => {
          return (
            <ActionsCell {...row.original} id={row.original.id} onUsageRecorded={onUsageRecorded} />
          );
        }
      }
    ],
    [onUsageRecorded]
  );

  return (
    <SharedGridTable
      columns={columns}
      data={currentlyInked}
      hiddenFields={hiddenFields}
      onHiddenFieldsChange={onHiddenFieldsChange}
      getRowId={(row) => String(row.id)}
    />
  );
};
