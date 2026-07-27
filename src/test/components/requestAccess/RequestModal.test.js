import {
  confirm,
  confirm1,
} from "../../../components/requestAccess/RequestModal";

const mockImperativeConfirm = jest.fn();
jest.mock("../../../design-system/imperativeConfirm", () => ({
  __esModule: true,
  default: (...args) => mockImperativeConfirm(...args),
}));

describe("requestAccess RequestModal confirmations", () => {
  beforeEach(() => {
    mockImperativeConfirm.mockResolvedValue(true);
  });

  it("should open a reject confirmation with the reject copy", async () => {
    await confirm(jest.fn());
    expect(mockImperativeConfirm).toHaveBeenCalledWith({
      title: "Reject Request?",
      content:
        "This will prevent the requestor from using this licence. Are you sure you want to proceed?",
      okText: "Reject",
      cancelText: "Cancel",
      okColor: "error",
    });
  });

  it("should run the reject handler once the reject is confirmed", async () => {
    const rejectHandler = jest.fn();
    await confirm(rejectHandler);
    expect(rejectHandler).toHaveBeenCalledTimes(1);
  });

  it("should not run the reject handler when the dialog is cancelled", async () => {
    mockImperativeConfirm.mockResolvedValue(false);
    const rejectHandler = jest.fn();
    await confirm(rejectHandler);
    expect(rejectHandler).not.toHaveBeenCalled();
  });

  it("should tolerate a missing reject handler", async () => {
    await expect(confirm(undefined)).resolves.toBeUndefined();
  });

  it("should open an approve confirmation with the approve copy", async () => {
    await confirm1(jest.fn());
    expect(mockImperativeConfirm).toHaveBeenCalledWith({
      title: "Approve Request?",
      content:
        "This will grant requestor access to the licence and its details. Are you sure you want to proceed?",
      okText: "Approve",
      cancelText: "Cancel",
      okColor: "primary",
    });
  });

  it("should run the approve handler once the approve is confirmed", async () => {
    const approveHandler = jest.fn();
    await confirm1(approveHandler);
    expect(approveHandler).toHaveBeenCalledTimes(1);
  });

  it("should not run the approve handler when the dialog is cancelled", async () => {
    mockImperativeConfirm.mockResolvedValue(false);
    const approveHandler = jest.fn();
    await confirm1(approveHandler);
    expect(approveHandler).not.toHaveBeenCalled();
  });

  it("should tolerate a missing approve handler", async () => {
    await expect(confirm1(null)).resolves.toBeUndefined();
  });
});
