import React from "react";
import { CollectionEntryActions } from "../../components";

/**
 * @typedef {"bottle" | "sample" | "cartridge" | "swab"} InkType
 * @param {{ id: string; archived: boolean; brand_name: string; line_name?: string; ink_name: string; kind?: InkType; }} props
 */
export const ActionsCell = ({ id, archived, brand_name, line_name, ink_name, kind }) => {
  let name = [brand_name, line_name, ink_name].filter((c) => c).join(" ");
  if (kind) name += ` - ${kind}`;
  if (archived) name += " (archived)";

  const editHref = archived ? `/collected_inks/archive/${id}/edit` : `/collected_inks/${id}/edit`;

  return (
    <CollectionEntryActions
      archived={archived}
      name={name}
      editHref={editHref}
      archiveHref={`/collected_inks/${id}/archive`}
      unarchiveHref={`/collected_inks/archive/${id}/unarchive`}
      deleteHref={`/collected_inks/${id}`}
    />
  );
};
