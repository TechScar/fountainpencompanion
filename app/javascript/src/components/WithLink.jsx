import React from "react";

export const WithLink = ({ children, href }) => {
  if (!href) {
    return <span>{children}</span>;
  }

  return <a href={href}>{children}</a>;
};
