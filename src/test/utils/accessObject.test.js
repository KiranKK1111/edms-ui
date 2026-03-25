import getPermissionObject from "../../utils/accessObject";

describe("getPermissionObject", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return undefined when objectMatrix is empty", () => {
    localStorage.setItem("objectMatrix", JSON.stringify([]));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });

  it("should return undefined when objectMatrix is not set", () => {
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });

  it("should return matching object when category and objectName match", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
      { category: "Masterdata", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toEqual({
      category: "Catalogue",
      objectName: "Main Page",
      permission: "RW",
    });
  });

  it("should match case-insensitively", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("catalogue", "main page");
    expect(result).toEqual({
      category: "Catalogue",
      objectName: "Main Page",
      permission: "RW",
    });
  });

  it("should return undefined when no match is found", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Masterdata", "Overview");
    expect(result).toBeUndefined();
  });

  it("should handle items with null category or objectName", () => {
    const matrix = [
      { category: null, objectName: "Main Page", permission: "RW" },
      { category: "Catalogue", objectName: null, permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });

  it("should return the first matching object when multiple matches exist", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
      { category: "Catalogue Page", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toEqual({
      category: "Catalogue",
      objectName: "Main Page",
      permission: "RW",
    });
  });

  it("should skip items with undefined category", () => {
    const matrix = [
      { objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });

  it("should skip items with undefined objectName", () => {
    const matrix = [
      { category: "Catalogue", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });

  it("should use includes for category matching (partial match)", () => {
    const matrix = [
      { category: "Catalogue Management", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toEqual({
      category: "Catalogue Management",
      objectName: "Main Page",
      permission: "R",
    });
  });

  it("should return undefined when filter results in empty array", () => {
    const matrix = [
      { category: "Masterdata", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = getPermissionObject("Catalogue", "Main Page");
    expect(result).toBeUndefined();
  });
});
