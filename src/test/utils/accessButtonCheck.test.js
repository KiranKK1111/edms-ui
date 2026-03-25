import isButtonObject from "../../utils/accessButtonCheck";

describe("isButtonObject", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true (disabled) when objectMatrix is empty", () => {
    localStorage.setItem("objectMatrix", JSON.stringify([]));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return true (disabled) when objectMatrix is not set", () => {
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  // For "Main Page" objName: RW -> disabled (true), R -> enabled (false)
  it("should return true for Main Page with RW permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return false for Main Page with R permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(false);
  });

  // For non-"Main Page" objName: RW -> enabled (false), R -> disabled (true)
  it("should return false for non-Main Page with RW permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Overview");
    expect(result).toBe(false);
  });

  it("should return true for non-Main Page with R permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Overview");
    expect(result).toBe(true);
  });

  it("should return true when no matching entry found", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Masterdata", "Main Page");
    expect(result).toBe(true);
  });

  it("should match case-insensitively", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("catalogue", "overview");
    expect(result).toBe(false);
  });

  it("should skip items with missing category field", () => {
    const matrix = [
      { objectName: "Main Page", permission: "R" },
      { category: "Catalogue", objectName: "Main Page", permission: "R" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(false);
  });

  it("should skip items with missing objectName field", () => {
    const matrix = [
      { category: "Catalogue", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return true for Main Page with unknown permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Main Page", permission: "X" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Main Page");
    expect(result).toBe(true);
  });

  it("should return true for non-Main Page with unknown permission", () => {
    const matrix = [
      { category: "Catalogue", objectName: "Overview", permission: "X" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Overview");
    expect(result).toBe(true);
  });

  it("should use includes for category matching (partial match)", () => {
    const matrix = [
      { category: "Catalogue Management", objectName: "Overview", permission: "RW" },
    ];
    localStorage.setItem("objectMatrix", JSON.stringify(matrix));
    const result = isButtonObject("Catalogue", "Overview");
    expect(result).toBe(false);
  });
});
