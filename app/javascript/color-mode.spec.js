// @ts-check
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("color-mode", () => {
  /** @type {Array<(event: { matches: boolean }) => void>} */
  let mediaQueryListeners;

  beforeEach(() => {
    mediaQueryListeners = [];

    document.cookie.split(";").forEach((part) => {
      const name = part.split("=")[0]?.trim();

      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });

    document.documentElement.removeAttribute("data-bs-theme");
    document.body.innerHTML = "";
    setSystemTheme(false);
  });

  afterEach(() => {
    jest.resetModules();
  });

  /**
   * @param {string} name
   * @returns {string | null}
   */
  const getCookie = (name) => {
    const prefix = `${name}=`;
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));

    return cookie ? cookie.slice(prefix.length) : null;
  };

  /**
   * @param {string} name
   * @param {string} value
   */
  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`;
  };

  /**
   * @param {boolean} matches
   */
  const setSystemTheme = (matches) => {
    const mediaQueryList = /** @type {MediaQueryList} */ (
      /** @type {unknown} */ ({
        matches,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addEventListener: (
          /** @type {string} */ eventName,
          /** @type {(event: { matches: boolean }) => void} */ listener
        ) => {
          if (eventName === "change") {
            mediaQueryListeners.push(listener);
          }
        },
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true
      })
    );

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: /** @type {typeof window.matchMedia} */ (jest.fn(() => mediaQueryList))
    });
  };

  const loadModule = () => {
    jest.isolateModules(() => {
      // @ts-expect-error color-mode is a side-effect-only script.
      require("./color-mode");
    });
  };

  /**
   * @param {boolean} matches
   */
  const emitSystemThemeChange = (matches) => {
    mediaQueryListeners.forEach((listener) => listener({ matches }));
  };

  const addThemeModeButtons = () => {
    document.body.innerHTML = `
      <a href="#" data-theme-mode="auto">Auto</a>
      <a href="#" data-theme-mode="dark">Dark</a>
      <a href="#" data-theme-mode="light">Light</a>
      <a href="#" data-theme-mode="sepia">Sepia</a>
    `;
  };

  /**
   * @param {string} selector
   * @returns {HTMLAnchorElement}
   */
  const findThemeLink = (selector) => {
    const element = document.querySelector(selector);

    if (!(element instanceof HTMLAnchorElement)) {
      throw new Error(`Missing anchor for selector: ${selector}`);
    }

    return element;
  };

  it("uses an explicit dark mode cookie regardless of system preference", () => {
    setCookie("fpc-theme-mode", "dark");

    loadModule();

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
    expect(getCookie("fpc-theme-mode")).toBe("dark");
    expect(getCookie("fpc-theme")).toBe("dark");
  });

  it("defaults invalid mode cookies to auto and uses the system theme", () => {
    setSystemTheme(true);
    setCookie("fpc-theme-mode", "invalid");

    loadModule();

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
    expect(getCookie("fpc-theme-mode")).toBe("auto");
    expect(getCookie("fpc-theme")).toBe("dark");
  });

  it("uses the current system theme when auto mode is selected", () => {
    setCookie("fpc-theme-mode", "auto");

    loadModule();

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
    expect(getCookie("fpc-theme")).toBe("light");
  });

  it("updates the theme when the system preference changes in auto mode", () => {
    setCookie("fpc-theme-mode", "auto");

    loadModule();
    emitSystemThemeChange(true);

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
    expect(getCookie("fpc-theme-mode")).toBe("auto");
    expect(getCookie("fpc-theme")).toBe("dark");
  });

  it("ignores system theme changes when a manual mode is selected", () => {
    setCookie("fpc-theme-mode", "light");

    loadModule();
    emitSystemThemeChange(true);

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
    expect(getCookie("fpc-theme-mode")).toBe("light");
    expect(getCookie("fpc-theme")).toBe("light");
  });

  it("updates theme selection state and cookies when a mode button is clicked", () => {
    addThemeModeButtons();

    loadModule();
    const darkLink = findThemeLink('[data-theme-mode="dark"]');
    const autoLink = findThemeLink('[data-theme-mode="auto"]');

    darkLink.click();

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
    expect(getCookie("fpc-theme-mode")).toBe("dark");
    expect(getCookie("fpc-theme")).toBe("dark");
    expect(darkLink.classList.contains("active")).toBe(true);
    expect(darkLink.getAttribute("aria-current")).toBe("true");
    expect(autoLink.classList.contains("active")).toBe(false);
    expect(autoLink.getAttribute("aria-current")).toBe("false");
  });

  it("ignores invalid mode buttons", () => {
    addThemeModeButtons();

    loadModule();
    findThemeLink('[data-theme-mode="sepia"]').click();

    expect(document.documentElement.getAttribute("data-bs-theme")).toBe("light");
    expect(getCookie("fpc-theme-mode")).toBe("auto");
    expect(getCookie("fpc-theme")).toBe("light");
  });
});
