import React from "react";

export const currentlyInkedCollectionEmptyStateMessage = (archive) => {
  if (archive) {
    return <>Your currently inked archive is empty.</>;
  }

  return <>You currently have no inked pens.</>;
};

export const inkCollectionEmptyStateMessage = (archive) => {
  if (archive) {
    return <>Your ink archive is empty.</>;
  }

  return (
    <>
      {"Your ink collection is empty. Check out the "}
      <a href="/pages/guide">documentation</a>
      {" on how to add some."}
    </>
  );
};

export const penCollectionEmptyStateMessage = (archive) => {
  if (archive) {
    return <>Your pen archive is empty.</>;
  }
  return <>Your pen collection is empty.</>;
};
