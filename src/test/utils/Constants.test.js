import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ROLE_ADMIN,
  ROLE_CONSUMER,
  ROLE_OWNER,
  OWNER_ROLES,
  CONSUMER_ROLES,
  ADMIN_ROLES,
  LOCAL_STORAGE_ACCESS_TOKEN,
  LOCAL_STORAGE_REFRESH_TOKEN,
  LOCAL_STORAGE_PSID,
  MAIN_PAGE,
  MY_TASK_PAGE,
} from "../../utils/Constants";

describe("Constants", () => {
  it("should export HTTP methods", () => {
    expect(METHOD_GET).toBe("GET");
    expect(METHOD_POST).toBe("POST");
  });

  it("should export content type", () => {
    expect(CONTENT_TYPE_APPLICATION_JSON).toBe("application/json");
  });

  it("should export role constants", () => {
    expect(ROLE_ADMIN).toBe("Admin");
    expect(ROLE_CONSUMER).toBe("Consumer");
    expect(ROLE_OWNER).toBe("Owner");
  });

  it("should export OWNER_ROLES as an array", () => {
    expect(Array.isArray(OWNER_ROLES)).toBe(true);
    expect(OWNER_ROLES.length).toBeGreaterThan(0);
  });

  it("should export CONSUMER_ROLES as an array", () => {
    expect(Array.isArray(CONSUMER_ROLES)).toBe(true);
    expect(CONSUMER_ROLES.length).toBeGreaterThan(0);
  });

  it("should export ADMIN_ROLES as an array", () => {
    expect(Array.isArray(ADMIN_ROLES)).toBe(true);
    expect(ADMIN_ROLES.length).toBeGreaterThan(0);
  });

  it("should export local storage key constants", () => {
    expect(LOCAL_STORAGE_ACCESS_TOKEN).toBe("access_token");
    expect(LOCAL_STORAGE_REFRESH_TOKEN).toBe("refresh_token");
    expect(LOCAL_STORAGE_PSID).toBe("psid");
  });

  it("should export page constants", () => {
    expect(MAIN_PAGE).toBe("Main Page");
    expect(MY_TASK_PAGE).toBe("My Tasks");
  });
});
