import isCatelogueAccessDisabled from "../../utils/accessRequestCatelog";

describe("isCatelogueAccessDisabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true when user is dataset delegate", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return true when user is dataset owner", () => {
    localStorage.setItem("entitlementType", "Dataset Owner");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return true when user is read only", () => {
    localStorage.setItem("entitlementType", "Read Only");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return false when user is admin", () => {
    localStorage.setItem("entitlementType", "Admin");
    expect(isCatelogueAccessDisabled()).toBe(false);
  });

  it("should return false when user is consumer", () => {
    localStorage.setItem("entitlementType", "Consumer");
    expect(isCatelogueAccessDisabled()).toBe(false);
  });

  it("should return false when entitlementType is not set", () => {
    expect(isCatelogueAccessDisabled()).toBe(false);
  });
});
