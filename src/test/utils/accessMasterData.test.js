import isAcessMasterDataDisabled from "../../utils/accessMasterData";

describe("isAcessMasterDataDisabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return false when user is dataset delegate", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return false when user is read only", () => {
    localStorage.setItem("entitlementType", "Read Only");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return false when user is dataset owner", () => {
    localStorage.setItem("entitlementType", "Dataset Owner");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return true when user is admin", () => {
    localStorage.setItem("entitlementType", "Admin");
    expect(isAcessMasterDataDisabled()).toBe(true);
  });

  it("should return true when user is consumer", () => {
    localStorage.setItem("entitlementType", "Consumer");
    expect(isAcessMasterDataDisabled()).toBe(true);
  });

  it("should return true when entitlementType is not set", () => {
    expect(isAcessMasterDataDisabled()).toBe(true);
  });
});
