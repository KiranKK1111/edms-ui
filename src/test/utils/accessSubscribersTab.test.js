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
});
