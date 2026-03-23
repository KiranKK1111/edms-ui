import isAccesPageDisabled from "../../utils/accessPageCheck";

describe("isAccesPageDisabled", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true (disabled) when objectMatrix is empty", () => {
    localStorage.setItem("objectMatrix", JSON.stringify([]));
    const result = isAccesPageDisabled("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return true (disabled) when objectMatrix is not set", () => {
    const result = isAccesPageDisabled("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return false (enabled) for Main Page with RW permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("Catalogue", "Main Page");
    expect(result).toBe(false);
  });

  it("should return false (enabled) for Main Page with R permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("Catalogue", "Main Page");
    expect(result).toBe(false);
  });

  it("should return true (disabled) for non-Main Page objName", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("Catalogue", "Overview");
    expect(result).toBe(true);
  });

  it("should return true when no matching entry found", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("Masterdata", "Main Page");
    expect(result).toBe(true);
  });

  it("should match category case-insensitively but objectName exactly", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("catalogue", "Main Page");
    expect(result).toBe(false);
  });

  it("should return true for Main Page with unknown permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "X" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isAccesPageDisabled("Catalogue", "Main Page");
    expect(result).toBe(true);
  });
});
