import React from "react";
import { useFieldSwitcher } from "../useFieldSwitcher";
import "./collection-toolbar.scss";
import { LayoutToggle } from "./LayoutToggle";
import { Switch } from "./Switch";

export const CollectionToolbar = ({
  activeLayout,
  onLayoutChange,
  hiddenFields,
  onHiddenFieldsChange,
  switchFields,
  links = [],
  searchValue,
  onSearchChange,
  searchPlaceholder,
  addHref,
  addLabel,
  searchMinWidth = "190px",
  topControlsClassName = "fpc-collection-actions"
}) => {
  const { isSwitchedOn, onSwitchChange } = useFieldSwitcher(hiddenFields, onHiddenFieldsChange);

  return (
    <>
      <div className={topControlsClassName}>
        {activeLayout ? (
          <LayoutToggle activeLayout={activeLayout} onChange={onLayoutChange} />
        ) : null}
        <div className="dropdown">
          <button
            type="button"
            title="Configure visible fields"
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-bs-auto-close="outside"
          >
            <i className="fa fa-cog"></i>
          </button>
          <form className="dropdown-menu p-4">
            <div className="mb-2">
              {switchFields.map((field) => (
                <Switch
                  key={field.name}
                  checked={isSwitchedOn(field.name)}
                  onChange={(e) => onSwitchChange(e.target.checked, field.name)}
                >
                  {field.label}
                </Switch>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 mt-2"
              onClick={() => onHiddenFieldsChange(null)}
            >
              Restore defaults
            </button>
          </form>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-end align-items-center mb-3">
        {links.map((link) => (
          <a key={link.href} className="btn btn-sm btn-link" href={link.href}>
            {link.label}
          </a>
        ))}
        <div className="m-2 d-flex">
          <div className="search" style={{ minWidth: searchMinWidth }}>
            <input
              className="form-control"
              type="text"
              value={searchValue || ""}
              onChange={(e) => {
                const nextValue = e.target.value || undefined;
                onSearchChange(nextValue);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search"
            />
          </div>
          {addHref ? (
            <a className="ms-2 btn btn-success" href={addHref}>
              {addLabel}
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
};
