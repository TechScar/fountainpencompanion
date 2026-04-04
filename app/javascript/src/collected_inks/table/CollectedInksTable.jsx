import _ from "lodash";
import React, { useMemo } from "react";
import { ColorSwatchCell } from "../../components/ColorSwatchCell";
import { RelativeDate } from "../../components/RelativeDate";
import { renderCountFooter, SharedGridTable } from "../../components/SharedGridTable";
import { WithLink } from "../../components/WithLink";
import { ActionsCell } from "./ActionsCell";
import { Counter } from "./Counter";
import { booleanSort, colorSort, dateSort } from "./sort";

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

export const CollectedInksTable = ({ inks, hiddenFields, onHiddenFieldsChange }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "private",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value) {
            return <i title="Private, hidden from your profile" className="fa fa-lock" />;
          } else {
            return <i title="Publicly visible on your profile" className="fa fa-unlock" />;
          }
        }
      },
      {
        header: "Brand",
        accessorKey: "brand_name",
        footer: ({ table }) => {
          const rows = table.getFilteredRowModel().rows;
          const count = _.uniqBy(rows, (row) => row.original.brand_name).length;
          return renderCountFooter(count, "brand");
        }
      },
      {
        header: "Line",
        accessorKey: "line_name"
      },
      {
        header: "Name",
        accessorKey: "ink_name",
        cell: ({ getValue, row }) => {
          const ink_id = row.original.ink_id;
          return <WithLink href={ink_id ? `/inks/${ink_id}` : null}>{getValue()}</WithLink>;
        },
        footer: ({ table }) => {
          return renderCountFooter(table.getFilteredRowModel().rows.length, "ink");
        }
      },
      {
        header: "Maker",
        accessorKey: "maker"
      },
      {
        header: "Type",
        accessorKey: "kind",
        footer: ({ table }) => {
          const rows = table.getFilteredRowModel().rows;
          const counters = _.countBy(rows, (row) => row.original.kind);
          return (
            <span>
              <Counter data={counters} field="bottle" />
              <Counter data={counters} field="sample" />
              <Counter data={counters} field="cartridge" />
              <Counter data={counters} field="swab" />
            </span>
          );
        }
      },
      {
        header: "Color",
        accessorKey: "color",
        cell: ({ getValue }) => <ColorSwatchCell value={getValue()} />,
        sortingFn: colorSort
      },
      {
        header: "Swabbed",
        accessorKey: "swabbed",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value) {
            return <i className="fa fa-check" />;
          } else {
            return <i className="fa fa-times" />;
          }
        },
        sortingFn: booleanSort
      },
      {
        header: "Used",
        accessorKey: "used",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value) {
            return <i className="fa fa-check" />;
          } else {
            return <i className="fa fa-times" />;
          }
        },
        sortingFn: booleanSort
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
        header: "Comment",
        accessorKey: "comment"
      },
      {
        header: "Private Comment",
        accessorKey: "private_comment"
      },
      {
        header: "Tags",
        accessorKey: "tags",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!Array.isArray(value) || value.length === 0) return null;
          return (
            <ul className="tags">
              {value.map((tag) => (
                <li key={tag.id} className="tag badge text-bg-secondary">
                  <a href={`/inks?tag=${fixedEncodeURIComponent(tag.name)}`}>{tag.name}</a>
                </li>
              ))}
            </ul>
          );
        }
      },
      {
        header: "Cluster Tags",
        accessorKey: "cluster_tags",
        cell: ({ getValue, row }) => {
          const value = getValue();
          const tags = row.original.tags || [];
          if (!Array.isArray(value) || value.length === 0) return null;
          const clusterOnlyTags = _.difference(
            value,
            tags.map((t) => t.name)
          );
          return (
            <ul className="tags">
              {clusterOnlyTags.map((tag) => (
                <li key={tag} className="tag badge text-bg-secondary cluster-tag">
                  <a href={`/inks?tag=${fixedEncodeURIComponent(tag)}`}>{tag}</a>
                </li>
              ))}
            </ul>
          );
        }
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
      data={inks}
      hiddenFields={hiddenFields}
      onHiddenFieldsChange={onHiddenFieldsChange}
    />
  );
};
