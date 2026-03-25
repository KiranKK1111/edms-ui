beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  jest.resetModules();
});

describe("isAcessDisabled", () => {
  it("should return true (disabled) by default", () => {
    jest.doMock("../../utils/accessButtonCheck", () => ({
      __esModule: true,
      default: jest.fn().mockReturnValue(true),
    }));

    const isAcessDisabled = require("../../utils/accessMyTask").default;
    const record = { taskListObject: "Other" };
    expect(isAcessDisabled(record)).toBe(true);
  });

  it("should return false for subscription when correct button permissions", () => {
    const mockFn = jest.fn()
      .mockReturnValueOnce(false)  // isPageAcces (module level)
      .mockReturnValueOnce(true)   // isApproveReject
      .mockReturnValueOnce(false)  // isSubcriptionBtn
      .mockReturnValueOnce(true);  // isRemainingObj

    jest.doMock("../../utils/accessButtonCheck", () => ({
      __esModule: true,
      default: mockFn,
    }));

    const isAcessDisabled = require("../../utils/accessMyTask").default;
    const record = { taskListObject: "Subscription" };
    expect(isAcessDisabled(record)).toBe(false);
  });

  it("should return false when second condition met", () => {
    const mockFn = jest.fn()
      .mockReturnValueOnce(true)   // isPageAcces (module level)
      .mockReturnValueOnce(false)  // isApproveReject
      .mockReturnValueOnce(true)   // isSubcriptionBtn
      .mockReturnValueOnce(true);  // isRemainingObj

    jest.doMock("../../utils/accessButtonCheck", () => ({
      __esModule: true,
      default: mockFn,
    }));

    const isAcessDisabled = require("../../utils/accessMyTask").default;
    const record = { taskListObject: "Other" };
    expect(isAcessDisabled(record)).toBe(false);
  });
});
