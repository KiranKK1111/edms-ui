import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  ThemeProvider,
  Stack,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import { buildMuiTheme } from "./muiTheme";
import { ThemeModeProvider, useThemeMode } from "./ThemeModeContext";
import { setToastApi } from "./toast";

/*
  AppProviders — wraps the app with everything MUI-side that it needs:

    - ThemeProvider with the shared MUI theme
    - CssBaseline for consistent baseline styles
    - SnackbarProvider exposing useSnackbar() with success/info/warning/error/close
    - ConfirmDialogProvider exposing useConfirm() — promise-based replacement for
      antd's Modal.confirm / Modal.info static API

  Usage:

    const snackbar = useSnackbar();
    snackbar.success("Saved!");

    const confirm = useConfirm();
    const ok = await confirm({ title: "Delete?", content: "This cannot be undone." });
    if (ok) { ... }
*/

// ---------- Snackbar ----------

const SnackbarContext = createContext(null);

const SnackbarProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const idRef = useRef(0);

  const close = useCallback((id) => {
    setQueue((items) => items.filter((it) => it.id !== id));
  }, []);

  const enqueue = useCallback((message, options = {}) => {
    const id = ++idRef.current;
    const item = {
      id,
      message,
      severity: options.severity || "info",
      duration: options.duration ?? 4000,
      action: options.action,
    };
    setQueue((items) => [...items, item]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      open: (message, options) => enqueue(message, options),
      success: (message, options) =>
        enqueue(message, { ...options, severity: "success" }),
      info: (message, options) =>
        enqueue(message, { ...options, severity: "info" }),
      warning: (message, options) =>
        enqueue(message, { ...options, severity: "warning" }),
      error: (message, options) =>
        enqueue(message, { ...options, severity: "error", duration: options?.duration ?? 6000 }),
      close,
    }),
    [enqueue, close]
  );

  const current = queue[0];

  // Expose the live snackbar API to the imperative `toast` bridge so non-React
  // callers (redux thunks, utilities) can raise notifications.
  useEffect(() => {
    setToastApi(api);
    return () => setToastApi(null);
  }, [api]);

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Snackbar
        key={current ? current.id : "empty"}
        open={Boolean(current)}
        autoHideDuration={current ? current.duration : null}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          if (current) close(current.id);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {current ? (
          <Alert
            elevation={6}
            variant="filled"
            severity={current.severity}
            onClose={() => close(current.id)}
            action={current.action}
            sx={{ alignItems: "center" }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used inside <AppProviders>");
  }
  return ctx;
};

// ---------- Confirm Dialog ----------

const ConfirmContext = createContext(null);

const ConfirmDialogProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback(
    (result) => {
      if (resolverRef.current) {
        resolverRef.current(result);
        resolverRef.current = null;
      }
      setState(null);
    },
    []
  );

  const api = useMemo(
    () => ({
      confirm: (options = {}) =>
        new Promise((resolve) => {
          resolverRef.current = resolve;
          setState({
            title: options.title || "Are you sure?",
            content: options.content,
            okText: options.okText || "Confirm",
            cancelText: options.cancelText || "Cancel",
            okColor: options.okColor || "primary",
            tone: options.tone || "info",
            hideCancel: !!options.hideCancel,
            loading: false,
          });
        }),
      info: (options = {}) =>
        new Promise((resolve) => {
          resolverRef.current = resolve;
          setState({
            title: options.title || "Information",
            content: options.content,
            okText: options.okText || "OK",
            cancelText: undefined,
            okColor: options.okColor || "primary",
            tone: "info",
            hideCancel: true,
            loading: false,
          });
        }),
    }),
    []
  );

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      <Dialog
        open={Boolean(state)}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
      >
        {state && (
          <>
            <DialogTitle>{state.title}</DialogTitle>
            <DialogContent>
              {typeof state.content === "string" ? (
                <DialogContentText>{state.content}</DialogContentText>
              ) : (
                state.content
              )}
            </DialogContent>
            <DialogActions>
              <Stack direction="row" spacing={1}>
                {!state.hideCancel && (
                  <Button onClick={() => close(false)} color="inherit">
                    {state.cancelText}
                  </Button>
                )}
                <Button
                  onClick={() => close(true)}
                  variant="contained"
                  color={state.okColor}
                  autoFocus
                >
                  {state.okText}
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <AppProviders>");
  }
  return ctx;
};

// ---------- Root provider ----------

const MuiThemeBridge = ({ children }) => {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildMuiTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const AppProviders = ({ children }) => (
  <ThemeModeProvider>
    <MuiThemeBridge>
      <SnackbarProvider>
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </SnackbarProvider>
    </MuiThemeBridge>
  </ThemeModeProvider>
);

export default AppProviders;
