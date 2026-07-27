import { createTheme } from "@mui/material/styles";
import { getPalette } from "./palette";

const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/*
  MUI theme derived from the single palette source (design-system/palette.js)
  so MUI components, antd, and raw CSS share the same colours in both modes.

  buildMuiTheme(mode) returns a theme for "light" or "dark". The default export
  is the light theme so existing imports keep working unchanged.
*/

// Adapt the flat palette map into the structured shape this theme expects.
const toMuiPalette = (mode) => {
  const c = getPalette(mode);
  return {
    text: {
      primary: c["color-text"],
      secondary: c["color-text-secondary"],
      disabled: c["color-text-tertiary"],
    },
    divider: c["color-border-secondary"],
    border: c["color-border"],
    borderHover: c["color-text-tertiary"],
    background: { default: c["color-bg-layout"], paper: c["color-bg"] },
    appBar: c["color-bg"],
    inputBg: c["color-bg-elevated"],
    menuShadow: c["shadow-lg"],
    cardShadow: c["shadow-sm"],
    elevation1: c["shadow-sm"],
    scrollThumb: c["color-border"],
    scrollThumbHover: c["color-text-tertiary"],
    primaryMain: c["color-primary"],
    primaryHover: c["color-primary-hover"],
    primaryLight: c["color-primary-soft"],
    primaryBg: c["color-primary-bg"],
    primaryBgHover: c["color-primary-bg-hover"],
    success: c["color-success"],
    successBg: c["color-success-bg"],
    successText: c["color-success-text"],
    warning: c["color-warning"],
    warningBg: c["color-warning-bg"],
    warningText: c["color-warning-text"],
    error: c["color-error"],
    errorBg: c["color-error-bg"],
    errorText: c["color-error-text"],
    tooltipBg: mode === "dark" ? "rgba(8,8,10,0.94)" : "rgba(15,23,42,0.92)",
  };
};

export const buildMuiTheme = (mode = "light") => {
  const p = toMuiPalette(mode);
  const primarySoft = p.primaryBg;
  const primarySoftHover = p.primaryBgHover;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: p.primaryMain,
        dark: p.primaryHover,
        light: p.primaryLight,
        contrastText: "#ffffff",
      },
      secondary: { main: p.text.secondary, contrastText: "#ffffff" },
      success: { main: p.success, light: p.successBg, dark: p.successText },
      warning: { main: p.warning, light: p.warningBg, dark: p.warningText },
      error: { main: p.error, light: p.errorBg, dark: p.errorText },
      info: { main: p.primaryMain, light: p.primaryLight, dark: p.primaryHover },
      text: p.text,
      divider: p.divider,
      background: p.background,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily,
      fontSize: 13,
      htmlFontSize: 16,
      h1: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" },
      h2: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontSize: 17, fontWeight: 600 },
      h4: { fontSize: 15, fontWeight: 600 },
      h5: { fontSize: 13, fontWeight: 600 },
      h6: { fontSize: 13, fontWeight: 600 },
      body1: { fontSize: 14, lineHeight: 1.5 },
      body2: { fontSize: 13, lineHeight: 1.5 },
      button: { textTransform: "none", fontWeight: 500 },
      caption: { fontSize: 12, color: p.text.disabled },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.background.default,
            color: p.text.primary,
            fontFamily,
          },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            background: p.scrollThumb,
            borderRadius: 6,
          },
          "*::-webkit-scrollbar-thumb:hover": { background: p.scrollThumbHover },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
            minHeight: 34,
            paddingInline: 14,
          },
          sizeSmall: { minHeight: 28, fontSize: 12, paddingInline: 10 },
          sizeLarge: { minHeight: 40, paddingInline: 18 },
          containedPrimary: {
            boxShadow: "0 1px 2px rgba(37,99,235,0.12)",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiTextField: {
        defaultProps: { size: "small", variant: "outlined" },
      },
      MuiInputBase: {
        styleOverrides: { root: { borderRadius: 8, fontSize: 14 } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: p.inputBg,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: p.border },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: p.borderHover,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: p.primaryMain,
              borderWidth: 1.5,
            },
          },
          input: { paddingTop: 8, paddingBottom: 8 },
        },
      },
      MuiSelect: { defaultProps: { size: "small" } },
      MuiInputLabel: {
        styleOverrides: { root: { fontSize: 13, color: p.text.secondary } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginLeft: 0, fontSize: 12 } },
      },
      MuiCheckbox: { styleOverrides: { root: { padding: 6 } } },
      MuiRadio: { styleOverrides: { root: { padding: 6 } } },
      MuiSwitch: { styleOverrides: { root: { padding: 8 } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${p.divider}`,
            boxShadow: p.cardShadow,
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 12 },
          elevation1: { boxShadow: p.elevation1 },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: p.appBar,
            color: p.text.primary,
            borderBottom: `1px solid ${p.divider}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 12,
            backgroundColor: p.tooltipBg,
            borderRadius: 6,
            padding: "6px 10px",
          },
          arrow: { color: p.tooltipBg },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: p.primaryMain,
            height: 3,
            borderRadius: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: 14,
            minHeight: 44,
            color: p.text.secondary,
            "&.Mui-selected": { color: p.primaryMain },
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 12, backgroundImage: "none" } },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontSize: 18, fontWeight: 600, padding: "20px 24px 8px" },
        },
      },
      MuiDialogContent: {
        styleOverrides: { root: { padding: "8px 24px" } },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: "16px 24px" } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { height: 6, borderRadius: 4 } },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            boxShadow: p.menuShadow,
            border: `1px solid ${p.divider}`,
            backgroundImage: "none",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 14,
            minHeight: 36,
            "&.Mui-selected": { backgroundColor: primarySoft },
            "&.Mui-selected:hover": { backgroundColor: primarySoftHover },
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { fontSize: 13, color: p.text.disabled },
          separator: { color: p.text.disabled },
        },
      },
      MuiPagination: {
        styleOverrides: { ul: { gap: 4 } },
      },
      MuiPaginationItem: {
        styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
      },
      MuiStepLabel: {
        styleOverrides: { label: { fontSize: 13, fontWeight: 500 } },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
    },
  });
};

const muiTheme = buildMuiTheme("light");

export default muiTheme;
