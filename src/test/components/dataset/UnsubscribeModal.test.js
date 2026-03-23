import { confirm } from "../../../components/dataset/UnsubscribeModal";
import { Modal } from "antd";

jest.mock("antd", () => ({
  Modal: {
    confirm: jest.fn(),
  },
}));

describe("UnsubscribeModal confirm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call Modal.confirm when invoked", () => {
    const handler = jest.fn();
    confirm(handler);
    expect(Modal.confirm).toHaveBeenCalledTimes(1);
  });

  it("should pass correct title", () => {
    confirm(jest.fn());
    const config = Modal.confirm.mock.calls[0][0];
    expect(config.title).toBe("Unsubscribe from Data Feed?");
  });

  it("should pass correct okText", () => {
    confirm(jest.fn());
    const config = Modal.confirm.mock.calls[0][0];
    expect(config.okText).toBe("Unsubscribe");
  });

  it("should pass correct cancelText", () => {
    confirm(jest.fn());
    const config = Modal.confirm.mock.calls[0][0];
    expect(config.cancelText).toBe("Cancel");
  });

  it("should set ok button as primary danger", () => {
    confirm(jest.fn());
    const config = Modal.confirm.mock.calls[0][0];
    expect(config.okButtonProps.type).toBe("primary");
    expect(config.okButtonProps.danger).toBe(true);
  });

  it("should call unsubscribeHandler on OK", () => {
    const handler = jest.fn();
    confirm(handler);
    const config = Modal.confirm.mock.calls[0][0];
    config.onOk();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should not throw on cancel", () => {
    confirm(jest.fn());
    const config = Modal.confirm.mock.calls[0][0];
    expect(() => config.onCancel()).not.toThrow();
  });
});
