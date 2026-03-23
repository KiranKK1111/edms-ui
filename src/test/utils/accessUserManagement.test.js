import isUserManagementDisabled from "../../utils/accessUserManagement";

describe("isUserManagementDisabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return false when objectMatrix is empty", () => {
    localStorage.setItem("objectMatrix", JSON.stringify([]));
    const result = isUserManagementDisabled();
    expect(result).toBe(false);
  });

  it("should return true when Main Page is not disabled but Edit Button is disabled", () => {
    const matrix = [
      {
        category: "User Management",
        objectName: "Main Page",
        permission: "R",
      },
      {
        category: "User Management",
        objectName: "Add New User / Edit Roles Button",
        permission: "R",
      },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isUserManagementDisabled();
    expect(result).toBe(true);
  });

  it("should return false when Main Page is disabled and Edit Button is not disabled", () => {
    const matrix = [
      {
        category: "User Management",
        objectName: "Main Page",
        permission: "RW",
      },
      {
        category: "User Management",
        objectName: "Add New User / Edit Roles Button",
        permission: "RW",
      },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isUserManagementDisabled();
    expect(result).toBe(false);
  });
});
