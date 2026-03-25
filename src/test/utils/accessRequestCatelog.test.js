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

  it("should return true for case variations of dataset delegate", () => {
    localStorage.setItem("entitlementType", "DATASET DELEGATE");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return true for case variations of dataset owner", () => {
    localStorage.setItem("entitlementType", "DATASET OWNER");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return true for case variations of read only", () => {
    localStorage.setItem("entitlementType", "READ ONLY");
    expect(isCatelogueAccessDisabled()).toBe(true);
  });

  it("should return false for IAM Admin", () => {
    localStorage.setItem("entitlementType", "IAM Admin");
    expect(isCatelogueAccessDisabled()).toBe(false);
  });

  it("should return false for empty string entitlementType", () => {
    localStorage.setItem("entitlementType", "");
    expect(isCatelogueAccessDisabled()).toBe(false);
  });
});
