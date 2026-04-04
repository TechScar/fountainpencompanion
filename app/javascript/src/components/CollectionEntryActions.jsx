import React from "react";
import "./collection-entry-actions.scss";

/**
 * Renders edit/archive/unarchive/delete action buttons for a collection entry.
 * Callers supply pre-computed hrefs since URL patterns differ per collection.
 *
 * @param {{
 *   archived: boolean;
 *   name: string;
 *   editHref: string;
 *   archiveHref: string;
 *   unarchiveHref: string;
 *   deleteHref: string;
 *   showUnarchive?: boolean;
 *   className?: string;
 * }} props
 */
export const CollectionEntryActions = ({
  archived,
  name,
  editHref,
  archiveHref,
  unarchiveHref,
  deleteHref,
  showUnarchive = true,
  className = "entry-actions"
}) => {
  if (archived) {
    return (
      <div className={className}>
        {/* Edit button */}
        <a className="btn btn-secondary" title={`Edit '${name}'`} href={editHref}>
          <i className="fa fa-pencil" />
        </a>

        {/* Unarchive button */}
        {showUnarchive && (
          <a
            className="btn btn-secondary"
            title={`Unarchive '${name}'`}
            href={unarchiveHref}
            data-method="post"
          >
            <i className="fa fa-folder-open" />
          </a>
        )}

        {/* Delete button */}
        <a
          className="btn btn-danger"
          title={`Delete '${name}'`}
          href={deleteHref}
          data-method="delete"
          data-confirm={`Really delete '${name}'?`}
        >
          <i className="fa fa-trash" />
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Edit button */}
      <a className="btn btn-secondary" title={`Edit '${name}'`} href={editHref}>
        <i className="fa fa-pencil" />
      </a>

      {/* Archive button */}
      <a
        className="btn btn-secondary"
        title={`Archive '${name}'`}
        href={archiveHref}
        data-method="post"
      >
        <i className="fa fa-archive" />
      </a>
    </div>
  );
};
