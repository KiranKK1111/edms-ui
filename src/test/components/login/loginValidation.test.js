import {
  loginValidation,
  serverValidation,
} from "../../../components/login/loginValidation";

const validInput = { username: "user1", password: "pass1" };

describe("loginValidation", () => {
  it("should return error when both username and password are empty", () => {
    const result = loginValidation({ username: "", password: "" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe(
      "Please enter username and password"
    );
  });

  it("should return error when both username and password are undefined", () => {
    const result = loginValidation({});
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe(
      "Please enter username and password"
    );
  });

  it("should return error when username is missing but password provided", () => {
    const result = loginValidation({ username: "", password: "pass1" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Username is required");
  });

  it("should return error when username is undefined but password provided", () => {
    const result = loginValidation({ password: "pass1" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Username is required");
  });

  it("should return error when password is missing but username provided", () => {
    const result = loginValidation({ username: "user1", password: "" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Password is required");
  });

  it("should return error when password is undefined but username provided", () => {
    const result = loginValidation({ username: "user1" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Password is required");
  });

  it("should return error for username with invalid characters", () => {
    const result = loginValidation({ ...validInput, username: "user!$%^" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe(
      "Username should contain only alphanumeric"
    );
  });

  it("should accept username with allowed special characters (@./#&+-_)", () => {
    const result = loginValidation({
      ...validInput,
      username: "user@name.com",
    });
    expect(result.errorStatus).toBe(false);
    expect(result.errorMessage).toBe("");
  });

  it("should accept numeric username", () => {
    const result = loginValidation({ ...validInput, username: "1293220" });
    expect(result.errorStatus).toBe(false);
    expect(result.errorMessage).toBe("");
  });

  it("should accept alphanumeric username", () => {
    const result = loginValidation({ ...validInput, username: "user123" });
    expect(result.errorStatus).toBe(false);
    expect(result.errorMessage).toBe("");
  });

  it("should accept username with underscores", () => {
    const result = loginValidation({
      ...validInput,
      username: "user_name_1",
    });
    expect(result.errorStatus).toBe(false);
  });

  it("should accept username with spaces", () => {
    const result = loginValidation({
      ...validInput,
      username: "user name",
    });
    expect(result.errorStatus).toBe(false);
  });

  it("should return no error for valid input", () => {
    const result = loginValidation(validInput);
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

  it("should return error with custom message", () => {
    const result = serverValidation({ message: "Invalid credentials" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("Invalid credentials");
  });

  it("should return error with empty message", () => {
    const result = serverValidation({ message: "" });
    expect(result.errorStatus).toBe(true);
    expect(result.errorMessage).toBe("");
  });
});
