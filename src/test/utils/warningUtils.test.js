import { checkForString, warning } from "../../utils/warningUtils";
import imperativeConfirm from "../../design-system/imperativeConfirm";

jest.mock("../../design-system/imperativeConfirm", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("warning", () => {
  beforeEach(() => {
    imperativeConfirm.mockClear();
  });

  it("should call imperativeConfirm without throwing", () => {
    expect(() => warning()).not.toThrow();
    expect(imperativeConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call imperativeConfirm with the pending-approval title", () => {
    warning();
    expect(imperativeConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "A change request is already pending approval.",
        content:
          "The current details remain unchanged until the request is approved.",
      })
    );
  });

  it("should call imperativeConfirm each time it is invoked", () => {
    warning();
    warning();
    expect(imperativeConfirm).toHaveBeenCalledTimes(2);
  });
});

describe("checkForString", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true when localStorage item contains the value", () => {
    localStorage.setItem("role", "Admin");
    expect(checkForString("role", "admin")).toBeTruthy();
  });

  it("should return true for case-insensitive match", () => {
    localStorage.setItem("role", "ADMIN");
    expect(checkForString("role", "admin")).toBeTruthy();
  });

  it("should return false when localStorage item does not contain value", () => {
    localStorage.setItem("role", "Consumer");
    expect(checkForString("role", "admin")).toBeFalsy();
  });

  it("should return falsy when localStorage item does not exist", () => {
    expect(checkForString("nonexistent", "value")).toBeFalsy();
  });

  it("should return true for partial match", () => {
    localStorage.setItem("role", "Dataset Owner");
    expect(checkForString("role", "owner")).toBeTruthy();
  });

  it("should return true for exact match", () => {
    localStorage.setItem("role", "Admin");
    expect(checkForString("role", "Admin")).toBeTruthy();
  });

  it("should handle value with mixed case", () => {
    localStorage.setItem("role", "dataset delegate");
    expect(checkForString("role", "Dataset Delegate")).toBeTruthy();
  });

  it("should return falsy when localStorage key exists but value is empty string", () => {
    localStorage.setItem("role", "");
    expect(checkForString("role", "admin")).toBeFalsy();
  });
});
