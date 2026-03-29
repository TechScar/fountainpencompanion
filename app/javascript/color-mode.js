/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */
(() => {
  "use strict";

  const cookieKey = "fpc-theme";

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const getPreferredTheme = () => {
    return getSystemTheme();
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    document.cookie = `${cookieKey}=${theme};path=/;max-age=31536000;samesite=lax`;
  };

  setTheme(getPreferredTheme());

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    setTheme(event.matches ? "dark" : "light");
  });
})();
