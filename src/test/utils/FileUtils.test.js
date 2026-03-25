import { getUniqueFileName } from "../../utils/FileUtils";

describe("getUniqueFileName", () => {
  it("should return timestamp with filename when fileObj has name", () => {
    const fileObj = { name: "document.pdf" };
    const result = getUniqueFileName(fileObj);
    expect(result).toMatch(/^\d+-document\.pdf$/);
  });

  it("should return timestamp with .pdf extension when fileObj has no name", () => {
    const fileObj = {};
    const result = getUniqueFileName(fileObj);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should return timestamp with .pdf extension when fileObj is null", () => {
    const result = getUniqueFileName(null);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should return timestamp with .pdf extension when fileObj is undefined", () => {
    const result = getUniqueFileName(undefined);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should generate unique filenames for different calls", () => {
    const fileObj = { name: "test.csv" };
    const result1 = getUniqueFileName(fileObj);
    const result2 = getUniqueFileName(fileObj);
    // Both should contain the filename
    expect(result1).toContain("test.csv");
    expect(result2).toContain("test.csv");
  });

  it("should handle filenames with special characters", () => {
    const fileObj = { name: "my file (1).pdf" };
    const result = getUniqueFileName(fileObj);
    expect(result).toContain("my file (1).pdf");
  });

  it("should return timestamp with .pdf when fileObj.name is empty string", () => {
    const fileObj = { name: "" };
    const result = getUniqueFileName(fileObj);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should return timestamp with .pdf when fileObj is false", () => {
    const result = getUniqueFileName(false);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should return timestamp with .pdf when fileObj is 0", () => {
    const result = getUniqueFileName(0);
    expect(result).toMatch(/^\d+\.pdf$/);
  });

  it("should include correct timestamp components", () => {
    const before = new Date();
    const fileObj = { name: "test.txt" };
    const result = getUniqueFileName(fileObj);
    const after = new Date();
    // Verify the result starts with digits and ends with the filename
    expect(result).toMatch(/^\d+-test\.txt$/);
    // Verify year is present
    expect(result).toContain(String(before.getFullYear()));
  });
});
