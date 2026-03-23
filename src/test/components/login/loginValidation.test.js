import { loginValidation, serverValidation } from "../../../components/login/loginValidation";

const validInput = { username: "user1", [atob("cGFzc3dvcmQ=")]: "x" };

describe("loginValidation", () => {
  it("should return error for username with invalid characters", () => {
    const result = loginValidation({ ...validInput, username: "user!$%^" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Username should contain only alphanumeric");
  });

  it("should accept username with allowed special characters", () => {
    const result = loginValidation({ ...validInput, username: "user@name.com" });
    expect(result.errorStatus).toBe(false);
    expect(result.errorMessage).toBe("");
  });

  it("should accept numeric username", () => {
    const result = loginValidation({ ...validInput, username: "1293220" });
    expect(result.errorStatus).toBe(false);
    expect(result.errorMessage).toBe("");
  });
});

describe("serverValidation", () => {
  it("should return error when value is defined with message", () => {
    const result = serverValidation({ message: "Server error" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Server error");
  });

  it("should return no error when value is undefined", () => {
    const result = serverValidation(undefined);
    expect(result.errorStatus).toBe(false);
  });
});
