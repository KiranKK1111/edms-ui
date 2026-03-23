import { checkForString } from "../../utils/warningUtils";

describe("checkForString", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true when localStorage item contains the value", () => {
    localStorage.setItem("role", "Admin");
    expect(checkForString("role", "admin")).toBeTruthy();
  });

  it("should return true for case-insensitive match", () => {
    localStorage.setItem("role", "ADMIN");
    expect(checkForString("role", "admin")).toBeTruthy();
  });

  it("should return false when localStorage item does not contain value", () => {
    localStorage.setItem("role", "Consumer");
    expect(checkForString("role", "admin")).toBeFalsy();
  });

  it("should return falsy when localStorage item does not exist", () => {
    expect(checkForString("nonexistent", "value")).toBeFalsy();
  });

  it("should return true for partial match", () => {
    localStorage.setItem("role", "Dataset Owner");
    expect(checkForString("role", "owner")).toBeTruthy();
  });
});
