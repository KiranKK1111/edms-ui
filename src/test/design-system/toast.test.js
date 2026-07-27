/*
  toast.js keeps module-level state (the registered api + a pending queue), so
  every test re-requires the module through jest.isolateModules to start clean.
*/

const METHODS = ["open", "success", "info", "warning", "error"];

const freshToast = () => {
  let mod;
  jest.isolateModules(() => {
    mod = require("../../design-system/toast");
  });
  return mod;
};

const makeApi = () => ({
  open: jest.fn(() => "open-id"),
  success: jest.fn(() => "success-id"),
  info: jest.fn(() => "info-id"),
  warning: jest.fn(() => "warning-id"),
  error: jest.fn(() => "error-id"),
  close: jest.fn(),
});

describe("toast — with a registered api", () => {
  it("forwards every method to the registered api and returns its result", () => {
    const { toast, setToastApi } = freshToast();
    const api = makeApi();
    setToastApi(api);

    METHODS.forEach((method) => {
      const result = toast[method](`${method} message`, { duration: 1 });
      expect(api[method]).toHaveBeenCalledWith(`${method} message`, {
        duration: 1,
      });
      expect(result).toBe(`${method}-id`);
    });
  });

  it("maps the antd `warn` alias onto warning", () => {
    const { toast, setToastApi } = freshToast();
    const api = makeApi();
    setToastApi(api);

    expect(toast.warn("heads up")).toBe("warning-id");
    expect(api.warning).toHaveBeenCalledWith("heads up");
    expect(api.open).not.toHaveBeenCalled();
  });

  it("exposes the same object as the default export", () => {
    const mod = freshToast();
    expect(mod.default).toBe(mod.toast);
  });

  it("stops forwarding once the api is unregistered", () => {
    const { toast, setToastApi } = freshToast();
    const api = makeApi();
    setToastApi(api);
    toast.success("first");
    expect(api.success).toHaveBeenCalledTimes(1);

    setToastApi(null);
    expect(toast.success("second")).toBeUndefined();
    expect(api.success).toHaveBeenCalledTimes(1);
  });

  it("queues instead of throwing when the api lacks the method", () => {
    const { toast, setToastApi } = freshToast();
    const partial = { success: jest.fn() };
    setToastApi(partial);

    expect(toast.error("not supported")).toBeUndefined();
    expect(toast.success("supported")).toBeUndefined();
    expect(partial.success).toHaveBeenCalledWith("supported");

    // the unsupported call was buffered and replays on the next full api
    const api = makeApi();
    setToastApi(api);
    expect(api.error).toHaveBeenCalledWith("not supported");
  });
});

describe("toast — before the provider mounts", () => {
  it("buffers calls and flushes them in order once the api registers", () => {
    const { toast, setToastApi } = freshToast();

    expect(toast.success("queued success")).toBeUndefined();
    expect(toast.error("queued error")).toBeUndefined();
    expect(toast.warn("queued warn")).toBeUndefined();

    const api = makeApi();
    setToastApi(api);

    expect(api.success).toHaveBeenCalledWith("queued success");
    expect(api.error).toHaveBeenCalledWith("queued error");
    expect(api.warning).toHaveBeenCalledWith("queued warn");
  });

  it("drains the queue so a second registration replays nothing", () => {
    const { toast, setToastApi } = freshToast();
    toast.info("only once");

    const first = makeApi();
    setToastApi(first);
    expect(first.info).toHaveBeenCalledTimes(1);

    const second = makeApi();
    setToastApi(second);
    expect(second.info).not.toHaveBeenCalled();
  });

  it("keeps the queue intact when the api is set to null", () => {
    const { toast, setToastApi } = freshToast();
    toast.open("still waiting");
    setToastApi(null);

    const api = makeApi();
    setToastApi(api);
    expect(api.open).toHaveBeenCalledWith("still waiting");
  });

  it("skips queued entries the eventual api cannot handle", () => {
    const { toast, setToastApi } = freshToast();
    toast.success("ok");
    toast.error("dropped");

    const partial = { success: jest.fn() };
    expect(() => setToastApi(partial)).not.toThrow();
    expect(partial.success).toHaveBeenCalledWith("ok");
  });
});
