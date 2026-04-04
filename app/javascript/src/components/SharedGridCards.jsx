import React from "react";

export const SharedGridCards = ({ data, hiddenFields, renderCard }) => {
  return (
    <div className="fpc-cards-grid">{data.map((row, i) => renderCard(row, i, hiddenFields))}</div>
  );
};
