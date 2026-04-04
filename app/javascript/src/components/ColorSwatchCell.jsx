import React from "react";
import "./color-swatch-cell.scss";

export const ColorSwatchCell = ({ value }) => (
  <div className="color-swatch-cell" style={{ backgroundColor: value }}></div>
);
