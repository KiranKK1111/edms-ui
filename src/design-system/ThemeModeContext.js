import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { applyPaletteVars } from "./palette";

/*
  ThemeModeContext — single source of truth for light/dark MODE.

  Responsibilities:
    - Resolve the initial mode: a previously persisted user choice if present,
      otherwise light (the app default).
    - Persist the chosen mode to localStorage so it is remembered across
      sessions and page reloads.
    - Reflect the mode on <html data-theme="..."> and inject the active
      colour palette (from palette.js) as CSS variables on <html>, so every
      `var(--color-*)` across the codebase resolves from the single palette
      source. Also sets color-scheme so native UI (scrollbars, form controls)
      follows.

  The COLOURS themselves live in design-system/palette.js (one file). This
  module only decides which set to apply.

  Consumers:
    - ThemedConfigProvider (antd theme)
    - AppProviders (MUI theme)
    - Header theme toggle
*/

export const THEME_STORAGE_KEY = "edms-theme-mode";
const STORAGE_KEY = THEME_STORAGE_KEY;
const LIGHT = "light";
const DARK = "dark";

const ThemeModeContext = createContext({
  mode: LIGHT,
  isDark: false,
  toggleMode: () => {},
  setMode: () => {},
});

const isValidMode = (value) => value === LIGHT || value === DARK;

const readStoredMode = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getInitialMode = () => {
  if (typeof window === "undefined") return LIGHT;
  const stored = readStoredMode();
  // Honour a remembered user choice; otherwise default to light. The OS
  // preference is intentionally ignored so the app always starts light until
  // the user explicitly opts into dark.
  return isValidMode(stored) ? stored : LIGHT;
};

const applyMode = (mode) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;
  // Inject the active palette's CSS variables from the single source (palette.js).
  applyPaletteVars(mode);
};

// Apply as early as the module loads to minimise first-paint flash.
applyMode(getInitialMode());

export const ThemeModeProvider = ({ children }) => {
  const [mode, setModeState] = useState(getInitialMode);

  useEffect(() => {
    applyMode(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState((prev) => (isValidMode(next) ? next : prev));
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === DARK ? LIGHT : DARK));
  }, []);

  const value = useMemo(
    () => ({ mode, isDark: mode === DARK, toggleMode, setMode }),
    [mode, toggleMode, setMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);

export default ThemeModeContext;
