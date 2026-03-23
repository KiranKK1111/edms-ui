import useAccessRights from "../../components/useAccessRights";

describe("useAccessRights", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return read permission for Read only role on myTasks page", () => {
    localStorage.setItem("entitlementType", "Read only");
    const result = useAccessRights("myTasks");
    expect(result.r).toBe(true);
  });

  it("should return read permission for Read only role on userManagement page", () => {
    localStorage.setItem("entitlementType", "Read only");
    const result = useAccessRights("userManagement");
    expect(result.r).toBe(true);
  });

  it("should return no read permission for Read only role on catalogue page", () => {
    localStorage.setItem("entitlementType", "Read only");
    const result = useAccessRights("catalogue");
    expect(result.r).toBeFalsy();
  });

  it("should return read permission for dataset delegate on userManagement", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    const result = useAccessRights("userManagement");
    expect(result.r).toBe(true);
  });

  it("should return none permission for subscriber on myTasks page", () => {
    localStorage.setItem("entitlementType", "Subscriber");
    const result = useAccessRights("myTasks");
    expect(result.none).toBe(true);
  });

  it("should return none permission for subscriber on userManagement page", () => {
    localStorage.setItem("entitlementType", "Subscriber");
    const result = useAccessRights("userManagement");
    expect(result.none).toBe(true);
  });

  it("should return read permission for guest on catalogue page", () => {
    localStorage.setItem("guestRole", "Guest");
    const result = useAccessRights("catalogue");
    expect(result.r).toBe(true);
  });

  it("should return none permission for guest on requestAccess page", () => {
    localStorage.setItem("guestRole", "Guest");
    const result = useAccessRights("requestAccess");
    expect(result.none).toBe(true);
  });

  it("should return none permission for guest on myTasks page", () => {
    localStorage.setItem("guestRole", "Guest");
    const result = useAccessRights("myTasks");
    expect(result.none).toBe(true);
  });

  it("should return empty object for unrecognized role", () => {
    localStorage.setItem("entitlementType", "Unknown Role");
    const result = useAccessRights("catalogue");
    expect(result).toEqual({});
  });
});
