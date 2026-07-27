/*
  toast — imperative notification bridge.

  antd's `message` API is a global singleton callable from anywhere (including
  redux thunks, plain utilities, etc.). MUI's Snackbar is component/hook based.
  This module bridges the two: <AppProviders> registers the live snackbar API
  via setToastApi(), and everything else imports `toast` and calls it
  imperatively, exactly like the old `message.success(...)`.

    import { toast } from "../design-system/toast";
    toast.success("Saved!");
    toast.error("Something went wrong");
*/

let api = null;

// Buffer calls made before the provider mounts so nothing is silently lost.
const pending = [];

export const setToastApi = (next) => {
  api = next;
  if (api && pending.length) {
    pending.splice(0).forEach(({ method, args }) => {
      if (typeof api[method] === "function") api[method](...args);
    });
  }
};

const invoke = (method, args) => {
  if (api && typeof api[method] === "function") {
    return api[method](...args);
  }
  // Provider not mounted yet — queue it.
  pending.push({ method, args });
  return undefined;
};

export const toast = {
  open: (...args) => invoke("open", args),
  success: (...args) => invoke("success", args),
  info: (...args) => invoke("info", args),
  warning: (...args) => invoke("warning", args),
  error: (...args) => invoke("error", args),
  // antd parity aliases
  warn: (...args) => invoke("warning", args),
};

export default toast;
