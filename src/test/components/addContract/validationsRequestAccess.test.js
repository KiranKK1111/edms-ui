import { modify, clarityIdValidation } from "../../../components/addContract/validationsRequestAccess";

describe("Contract modify", () => {
  it("should modify existing property error and message", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = modify(valObj, "clarityId", true, "Error");
    expect(result.clarityId.error).toBe(true);
    expect(result.clarityId.message).toBe("Error");
  });

  it("should return undefined when property does not exist", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = modify(valObj, "nonExistent", true, "Error");
    expect(result).toBeUndefined();
  });

  it("should return a new object reference", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = modify(valObj, "clarityId", true, "Error");
    expect(result).not.toBe(valObj);
  });
});

describe("Contract clarityIdValidation", () => {
  it("should return error when value is empty string", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = clarityIdValidation("", valObj);
    expect(result.clarityId.error).toBe(true);
    expect(result.clarityId.message).toBe("Clarity ID is mandatory.");
  });

  it("should return error when value length is greater than 8", () => {
    const valObj = { contractid: { error: false, message: "" } };
    const result = clarityIdValidation("123456789", valObj);
    expect(result.contractid.error).toBe(true);
    expect(result.contractid.message).toBe("Please enter a valid Clarity ID");
  });

  it("should clear error when value is valid", () => {
    const valObj = { clarityId: { error: true, message: "old" } };
    const result = clarityIdValidation("CLRT001", valObj);
    expect(result.clarityId.error).toBe(false);
    expect(result.clarityId.message).toBe("");
  });

  it("should accept value of exactly 8 characters", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = clarityIdValidation("12345678", valObj);
    expect(result.clarityId.error).toBe(false);
    expect(result.clarityId.message).toBe("");
  });
});
