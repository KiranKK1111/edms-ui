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

  it("should return false for case variations of dataset delegate", () => {
    localStorage.setItem("entitlementType", "DATASET DELEGATE");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return false for case variations of read only", () => {
    localStorage.setItem("entitlementType", "READ ONLY");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return false for case variations of dataset owner", () => {
    localStorage.setItem("entitlementType", "DATASET OWNER");
    expect(isAcessMasterDataDisabled()).toBe(false);
  });

  it("should return true for IAM Admin", () => {
    localStorage.setItem("entitlementType", "IAM Admin");
    expect(isAcessMasterDataDisabled()).toBe(true);
  });

  it("should return true for empty string entitlementType", () => {
    localStorage.setItem("entitlementType", "");
    expect(isAcessMasterDataDisabled()).toBe(true);
  });
});
