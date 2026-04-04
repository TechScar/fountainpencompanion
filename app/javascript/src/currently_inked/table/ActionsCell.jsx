import React from "react";
import { CollectionEntryActions } from "../../components";
import { UsageButton } from "../components/UsageButton";

export const ActionsCell = ({
  id,
  archived,
  pen_name,
  refillable,
  ink_name,
  used_today,
  unarchivable,
  onUsageRecorded
}) => {
  const entryName = `${pen_name} - ${ink_name}`;

  if (archived) {
    return (
      <CollectionEntryActions
        archived={true}
        name={entryName}
        editHref={`/currently_inked/archive/${id}/edit`}
        unarchiveHref={`/currently_inked/archive/${id}/unarchive`}
        deleteHref={`/currently_inked/archive/${id}`}
        showUnarchive={unarchivable}
      />
    );
  }

  return (
    <div className="entry-actions">
      {/* Usage button */}
      <UsageButton id={id} used={used_today} onUsageRecorded={onUsageRecorded} />

      {/* Refill button */}
      {refillable && (
        <a
          className="btn btn-secondary"
          title={`Refill '${entryName}'`}
          href={`/currently_inked/${id}/refill`}
          data-method="post"
          data-confirm={`Really refill '${pen_name}' with '${ink_name}'?`}
        >
          <i className="fa fa-rotate-right"></i>
        </a>
      )}

      {/* Edit button */}
      <a
        className="btn btn-secondary"
        title={`Edit '${entryName}'`}
        href={`/currently_inked/${id}/edit`}
      >
        <i className="fa fa-pencil" />
      </a>

      {/* Archive button */}
      <a
        className="btn btn-secondary"
        title={`Archive '${entryName}'`}
        href={`/currently_inked/${id}/archive`}
        data-method="post"
      >
        <i className="fa fa-archive" />
      </a>
    </div>
  );
};
