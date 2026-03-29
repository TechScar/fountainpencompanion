/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */
(() => {
  "use strict";

  const cookieKey = "fpc-theme";
  const modeCookieKey = "fpc-theme-mode";

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const getCookieValue = (key) => {
    const prefix = `${key}=`;
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));

    if (!cookie) {
      return null;
    }

    return cookie.slice(prefix.length);
  };

  const getMode = () => {
    const mode = getCookieValue(modeCookieKey);
    return mode === "auto" || mode === "dark" || mode === "light" ? mode : "auto";
  };

  const getThemeForMode = (mode) => {
    if (mode === "dark" || mode === "light") {
      return mode;
    }

    return getSystemTheme();
  };

  const persistThemeState = (mode, theme) => {
    document.cookie = `${modeCookieKey}=${mode};path=/;max-age=31536000;samesite=lax`;
    document.cookie = `${cookieKey}=${theme};path=/;max-age=31536000;samesite=lax`;
  };

  const setTheme = (mode) => {
    const theme = getThemeForMode(mode);
    document.documentElement.setAttribute("data-bs-theme", theme);
    persistThemeState(mode, theme);
  };

  const updateThemeModeSelection = (mode) => {
    document.querySelectorAll("[data-theme-mode]").forEach((element) => {
      const isSelected = element.dataset.themeMode === mode;
      element.classList.toggle("active", isSelected);
      element.setAttribute("aria-current", isSelected ? "true" : "false");
    });
  };

  setTheme(getMode());
  updateThemeModeSelection(getMode());

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (getMode() === "auto") {
      const nextTheme = event.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-bs-theme", nextTheme);
      persistThemeState("auto", nextTheme);
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-theme-mode]");

    if (!trigger) {
      return;
    }

    event.preventDefault();
    const mode = trigger.dataset.themeMode;

    if (mode !== "auto" && mode !== "dark" && mode !== "light") {
      return;
    }

    setTheme(mode);
    updateThemeModeSelection(mode);
  });
})();
