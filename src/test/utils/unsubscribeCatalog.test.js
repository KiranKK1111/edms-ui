import isUnsubscribeDisabled from "../../utils/unsubscribeCatalog";

describe("isUnsubscribeDisabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true when user is dataset owner", () => {
    localStorage.setItem("entitlementType", "Dataset Owner");
    expect(isUnsubscribeDisabled()).toBe(true);
  });

  it("should return true when user is read only", () => {
    localStorage.setItem("entitlementType", "Read Only");
    expect(isUnsubscribeDisabled()).toBe(true);
  });

  it("should return false when user is admin", () => {
    localStorage.setItem("entitlementType", "Admin");
    expect(isUnsubscribeDisabled()).toBe(false);
  });

  it("should return false when user is consumer", () => {
    localStorage.setItem("entitlementType", "Consumer");
    expect(isUnsubscribeDisabled()).toBe(false);
  });

  it("should return false when entitlementType is not set", () => {
    expect(isUnsubscribeDisabled()).toBe(false);
  });

  it("should return true for case variations of dataset owner", () => {
    localStorage.setItem("entitlementType", "DATASET OWNER");
    expect(isUnsubscribeDisabled()).toBe(true);
  });

  it("should return true for case variations of read only", () => {
    localStorage.setItem("entitlementType", "READ ONLY");
    expect(isUnsubscribeDisabled()).toBe(true);
  });

  it("should return false for Dataset Delegate", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    expect(isUnsubscribeDisabled()).toBe(false);
  });

  it("should return false for IAM Admin", () => {
    localStorage.setItem("entitlementType", "IAM Admin");
    expect(isUnsubscribeDisabled()).toBe(false);
  });

  it("should return false for empty string entitlementType", () => {
    localStorage.setItem("entitlementType", "");
    expect(isUnsubscribeDisabled()).toBe(false);
  });
});
