import isSubscribersTabVisible from "../../utils/accessSubscribersTab";

describe("isSubscribersTabVisible", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true when user is IAM Admin", () => {
    localStorage.setItem("entitlementType", "IAM Admin");
    expect(isSubscribersTabVisible()).toBe(true);
  });

  it("should return false when user is Admin", () => {
    localStorage.setItem("entitlementType", "Admin");
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should return false when user is Consumer", () => {
    localStorage.setItem("entitlementType", "Consumer");
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should return false when entitlementType is not set", () => {
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should match case-insensitively for IAM Admin", () => {
    localStorage.setItem("entitlementType", "iam admin");
    expect(isSubscribersTabVisible()).toBe(true);
  });

  it("should return false for Dataset Delegate", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should return false for Dataset Owner", () => {
    localStorage.setItem("entitlementType", "Dataset Owner");
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should return false for Read Only", () => {
    localStorage.setItem("entitlementType", "Read Only");
    expect(isSubscribersTabVisible()).toBe(false);
  });

  it("should return true for uppercase IAM ADMIN", () => {
    localStorage.setItem("entitlementType", "IAM ADMIN");
    expect(isSubscribersTabVisible()).toBe(true);
  });

  it("should return false for empty string entitlementType", () => {
    localStorage.setItem("entitlementType", "");
    expect(isSubscribersTabVisible()).toBe(false);
  });
});
