/*
  palette.js — THE single source of truth for every theme colour in the app.

  Change a colour here and it updates everywhere:
    - All CSS (`var(--color-*)`, `var(--shadow-*)`) — injected at runtime onto
      <html> by ThemeModeContext, so component stylesheets read from this file.
    - The antd ConfigProvider theme (design-system/theme.js).
    - The MUI ThemeProvider theme (design-system/muiTheme.js).

  Each mode (light / dark) is a flat map of CSS-variable name -> value. The
  variable name is the key WITHOUT the leading "--". Keep both modes in sync:
  every key present in light must exist in dark.
*/

export const PALETTE = {
  light: {
    "color-primary": "#2563eb",
    "color-primary-hover": "#1d4ed8",
    "color-primary-active": "#1e40af",
    "color-primary-soft": "#eff6ff",
    "color-primary-bg": "rgba(37, 99, 235, 0.08)",
    "color-primary-bg-hover": "rgba(37, 99, 235, 0.12)",

    "color-text": "#0f172a",
    "color-text-secondary": "#475569",
    "color-text-tertiary": "#94a3b8",
    "color-text-quaternary": "#cbd5e1",
    "color-text-description": "#64748b",

    "color-border": "#e2e8f0",
    "color-border-secondary": "#eef1f6",
    "color-split": "#eef1f6",

    "color-bg": "#ffffff",
    "color-bg-layout": "#f4f6fb",
    "color-bg-elevated": "#ffffff",
    "color-bg-container": "#ffffff",
    "color-bg-subtle": "#f8fafc",
    "color-bg-hover": "#f1f5f9",

    "color-success": "#10b981",
    "color-success-bg": "#ecfdf5",
    "color-success-border": "#a7f3d0",
    "color-success-text": "#047857",
    "color-warning": "#f59e0b",
    "color-warning-bg": "#fffbeb",
    "color-warning-border": "#fde68a",
    "color-warning-text": "#b45309",
    "color-error": "#ef4444",
    "color-error-bg": "#fef2f2",
    "color-error-border": "#fecaca",
    "color-error-text": "#b91c1c",
    "color-info": "#2563eb",
    "color-info-bg": "#eff6ff",
    "color-info-border": "#bfdbfe",

    "shadow-xs": "0 1px 2px rgba(15, 23, 42, 0.04)",
    "shadow-sm":
      "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.03)",
    "shadow-md":
      "0 4px 14px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)",
    "shadow-lg":
      "0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.03)",
    "shadow-xl":
      "0 24px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.05)",
    "shadow-focus": "0 0 0 4px rgba(37, 99, 235, 0.15)",
    "shadow-primary": "0 8px 20px rgba(37, 99, 235, 0.22)",
  },

  dark: {
    "color-primary": "#3b82f6",
    "color-primary-hover": "#60a5fa",
    "color-primary-active": "#93c5fd",
    "color-primary-soft": "#1e2a3f",
    "color-primary-bg": "rgba(59, 130, 246, 0.16)",
    "color-primary-bg-hover": "rgba(59, 130, 246, 0.24)",

    "color-text": "#e7e8ea",
    "color-text-secondary": "#b2b4b8",
    "color-text-tertiary": "#76787d",
    "color-text-quaternary": "#54565b",
    "color-text-description": "#9a9ca1",

    "color-border": "#34353a",
    "color-border-secondary": "#27282c",
    "color-split": "#27282c",

    "color-bg": "#1d1e21",
    "color-bg-layout": "#161719",
    "color-bg-elevated": "#25262a",
    "color-bg-container": "#1d1e21",
    "color-bg-subtle": "#212226",
    "color-bg-hover": "#2a2b2f",

    "color-success": "#34d399",
    "color-success-bg": "#16241d",
    "color-success-border": "#14532d",
    "color-success-text": "#34d399",
    "color-warning": "#fbbf24",
    "color-warning-bg": "#241f12",
    "color-warning-border": "#78350f",
    "color-warning-text": "#fbbf24",
    "color-error": "#f87171",
    "color-error-bg": "#271717",
    "color-error-border": "#7f1d1d",
    "color-error-text": "#f87171",
    "color-info": "#3b82f6",
    "color-info-bg": "#1e2a3f",
    "color-info-border": "#1e3a8a",

    "shadow-xs": "0 1px 2px rgba(0, 0, 0, 0.4)",
    "shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.4)",
    "shadow-md": "0 4px 14px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.4)",
    "shadow-lg": "0 12px 32px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)",
    "shadow-xl":
      "0 24px 48px rgba(0, 0, 0, 0.55), 0 8px 16px rgba(0, 0, 0, 0.45)",
    "shadow-focus": "0 0 0 4px rgba(59, 130, 246, 0.25)",
    "shadow-primary": "0 8px 20px rgba(59, 130, 246, 0.3)",
  },
};

const LIGHT = "light";
const DARK = "dark";

// Resolve a palette for a mode, defaulting to light for anything unexpected.
export const getPalette = (mode) => (mode === DARK ? PALETTE.dark : PALETTE.light);

/*
  Apply a mode's palette as CSS custom properties on <html>. This is what makes
  every `var(--color-*)` / `var(--shadow-*)` in the app's stylesheets resolve
  from this single file. Called by ThemeModeContext at load and on mode change.
*/
export const applyPaletteVars = (mode) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = getPalette(mode);
  Object.keys(vars).forEach((name) => {
    root.style.setProperty(`--${name}`, vars[name]);
  });
};

export default PALETTE;
