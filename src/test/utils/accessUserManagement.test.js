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

  it("should return false when isMainPage is true and isEditButton is false (second if branch)", () => {
    // isMainPage = true (Main Page with RW -> disabled=true), isEditButton = false (Edit btn with RW -> disabled=false)
    // Wait - isButtonObject for Main Page RW returns true (disabled), for non-Main Page RW returns false (not disabled)
    // !isMainPage = !true = false, so first if is false
    // isMainPage=true && !isEditButton = true && !false = true, so second if sets disabled=false
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
    // isMainPage = isButtonObject("User Management", "Main Page") -> Main Page + RW -> true
    // isEditButton = isButtonObject("User Management", "Add New User / Edit Roles Button") -> non-Main Page + RW -> false
    // !isMainPage && isEditButton = !true && false = false -> skip first if
    // isMainPage && !isEditButton = true && !false = true -> second if sets isdisabled = false
    expect(result).toBe(false);
  });

  it("should return false when both conditions are false", () => {
    // Both Main Page and Edit Button not found -> both return true (disabled)
    // !isMainPage && isEditButton = false && true = false
    // isMainPage && !isEditButton = true && false = true -> sets false
    // Actually both default to true when not found
    // !true && true = false -> skip
    // true && !true = false -> skip
    // isdisabled stays false
    const result = isUserManagementDisabled();
    expect(result).toBe(false);
  });

  it("should return true when !isMainPage && isEditButton", () => {
    // isMainPage needs to be false: Main Page + R -> false
    // isEditButton needs to be true: Edit btn + R -> true (non-Main Page with R is disabled=true)
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
});
