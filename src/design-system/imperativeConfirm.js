import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

import { buildMuiTheme } from "./muiTheme";

const resolveMode = () => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
};

/*
  imperativeConfirm — promise-based confirm dialog usable outside React (from
  a plain function). Use sparingly; prefer the useConfirm() hook inside
  components. This exists for legacy antd Modal.confirm callsites that aren't
  inside React render.

    const ok = await imperativeConfirm({
      title: "Unsubscribe?",
      content: "This will revoke access.",
      okText: "Unsubscribe",
      okColor: "error",
    });
    if (ok) doIt();
*/

const ConfirmShell = ({
  title,
  content,
  okText,
  cancelText,
  okColor,
  hideCancel,
  resolve,
  cleanup,
}) => {
  const [open, setOpen] = useState(true);
  const theme = buildMuiTheme(resolveMode());

  const close = (result) => {
    setOpen(false);
    resolve(result);
    setTimeout(cleanup, 200);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={() => close(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {typeof content === "string" ? (
            <DialogContentText>{content}</DialogContentText>
          ) : (
            content
          )}
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1}>
            {!hideCancel && (
              <Button onClick={() => close(false)} color="inherit">
                {cancelText}
              </Button>
            )}
            <Button
              onClick={() => close(true)}
              variant="contained"
              color={okColor || "primary"}
              autoFocus
            >
              {okText}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

const imperativeConfirm = (options = {}) =>
  new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const cleanup = () => {
      try {
        root.unmount();
        host.remove();
      } catch {
        /* ignore */
      }
    };
    root.render(
      <ConfirmShell
        title={options.title || "Are you sure?"}
        content={options.content}
        okText={options.okText || "Confirm"}
        cancelText={options.cancelText || "Cancel"}
        okColor={options.okColor || "primary"}
        hideCancel={!!options.hideCancel}
        resolve={resolve}
        cleanup={cleanup}
      />
    );
  });

export default imperativeConfirm;
