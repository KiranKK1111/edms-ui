import { confirm } from "../../../components/dataset/UnsubscribeModal";
import imperativeConfirm from "../../../design-system/imperativeConfirm";

jest.mock("../../../design-system/imperativeConfirm", () => jest.fn());

describe("UnsubscribeModal confirm", () => {
  beforeEach(() => {
    imperativeConfirm.mockResolvedValue(true);
  });

  it("should call imperativeConfirm when invoked", async () => {
    await confirm(jest.fn());
    expect(imperativeConfirm).toHaveBeenCalledTimes(1);
  });

  it("should pass the correct title", async () => {
    await confirm(jest.fn());
    const config = imperativeConfirm.mock.calls[0][0];
    expect(config.title).toBe("Unsubscribe from Data Feed?");
  });

  it("should pass the correct okText", async () => {
    await confirm(jest.fn());
    const config = imperativeConfirm.mock.calls[0][0];
    expect(config.okText).toBe("Unsubscribe");
  });

  it("should pass the correct cancelText", async () => {
    await confirm(jest.fn());
    const config = imperativeConfirm.mock.calls[0][0];
    expect(config.cancelText).toBe("Cancel");
  });

  it("should use the error ok color", async () => {
    await confirm(jest.fn());
    const config = imperativeConfirm.mock.calls[0][0];
    expect(config.okColor).toBe("error");
  });

  it("should call the unsubscribe handler when confirmed", async () => {
    const handler = jest.fn();
    await confirm(handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should NOT call the handler when not confirmed", async () => {
    imperativeConfirm.mockResolvedValue(false);
    const handler = jest.fn();
    await confirm(handler);
    expect(handler).not.toHaveBeenCalled();
  });
});
