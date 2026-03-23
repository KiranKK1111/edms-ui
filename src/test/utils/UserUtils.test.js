import { getHardCodedRole, setLocalStorage, createNewUserProfile } from "../../utils/UserUtils";
import { ROLE_OWNER, ROLE_CONSUMER, ROLE_ADMIN } from "../../utils/Constants";

describe("getHardCodedRole", () => {
  it("should return Owner role for owner PSIDs", () => {
    expect(getHardCodedRole("1293220")).toBe(ROLE_OWNER);
    expect(getHardCodedRole("1135744")).toBe(ROLE_OWNER);
    expect(getHardCodedRole("1503617")).toBe(ROLE_OWNER);
  });

  it("should return Consumer role for consumer PSIDs", () => {
    expect(getHardCodedRole("1380562")).toBe(ROLE_CONSUMER);
  });

  it("should return Admin role for admin PSIDs", () => {
    expect(getHardCodedRole("1117602")).toBe(ROLE_ADMIN);
    expect(getHardCodedRole("1588229")).toBe(ROLE_ADMIN);
    expect(getHardCodedRole("1264899")).toBe(ROLE_ADMIN);
  });

  it("should return null for unknown PSIDs", () => {
    expect(getHardCodedRole("9999999")).toBeNull();
    expect(getHardCodedRole("0000000")).toBeNull();
  });

  it("should handle numeric PSID input by converting to string", () => {
    expect(getHardCodedRole(1293220)).toBe(ROLE_OWNER);
    expect(getHardCodedRole(1380562)).toBe(ROLE_CONSUMER);
  });
});

describe("setLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should set all local storage items", () => {
    setLocalStorage("token123", "refresh456", true, "1293220");
    expect(localStorage.getItem("access_token")).toBe("token123");
    expect(localStorage.getItem("refresh_token")).toBe("refresh456");
    expect(localStorage.getItem("token_refreshed")).toBe("true");
    expect(localStorage.getItem("psid")).toBe("1293220");
  });

  it("should overwrite existing local storage items", () => {
    setLocalStorage("token1", "refresh1", false, "111");
    setLocalStorage("token2", "refresh2", true, "222");
    expect(localStorage.getItem("access_token")).toBe("token2");
    expect(localStorage.getItem("refresh_token")).toBe("refresh2");
    expect(localStorage.getItem("psid")).toBe("222");
  });
});

describe("createNewUserProfile", () => {
  it("should create a user profile object with correct fields", () => {
    const profile = createNewUserProfile("1293220", "Owner");
    expect(profile.psId).toBe("1293220");
    expect(profile.entitlementType).toBe("Owner");
    expect(profile.newSubscriptions).toBe("Y");
    expect(profile.systemMessages).toBe("Y");
    expect(profile.lastLogin).toBeDefined();
    expect(profile.firstLogin).toBeDefined();
  });

  it("should set lastLogin and firstLogin to current date/time", () => {
    const profile = createNewUserProfile("123", "Admin");
    expect(profile.lastLogin).toBeTruthy();
    expect(profile.firstLogin).toBeTruthy();
  });
});
