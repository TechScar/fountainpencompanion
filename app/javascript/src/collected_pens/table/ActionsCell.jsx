import React from "react";
import { CollectionEntryActions } from "../../components";

export const ActionsCell = ({ id, archived, brand, model }) => {
  let name = [brand, model].filter(Boolean).join(" ");
  if (archived) name += " (archived)";

  const editHref = archived ? `/collected_pens/archive/${id}/edit` : `/collected_pens/${id}/edit`;

  return (
    <CollectionEntryActions
      archived={archived}
      name={name}
      editHref={editHref}
      archiveHref={`/collected_pens/${id}/archive`}
      unarchiveHref={`/collected_pens/archive/${id}/unarchive`}
      deleteHref={`/collected_pens/archive/${id}`}
    />
  );
};
