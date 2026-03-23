import { modify, clarityIdValidation, itamIdValidation, mandatoryFields } from "../../../components/requestAccess/validationsRequestAccess";

jest.mock("axios");

describe("modify", () => {
  it("should modify existing property error and message", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = modify(valObj, "clarityId", true, "Error message");
    expect(result.clarityId.error).toBe(true);
    expect(result.clarityId.message).toBe("Error message");
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

describe("clarityIdValidation", () => {
  it("should set error when idExist is true", () => {
    const valObj = { clarityId: { error: false, message: "" } };
    const result = clarityIdValidation(valObj, true);
    expect(result.clarityId.error).toBe(true);
    expect(result.clarityId.message).toBe("Clarity ID already exists.");
  });

  it("should clear error when idExist is false", () => {
    const valObj = { clarityId: { error: true, message: "old" } };
    const result = clarityIdValidation(valObj, false);
    expect(result.clarityId.error).toBe(false);
    expect(result.clarityId.message).toBe("");
  });
});

describe("itamIdValidation", () => {
  it("should set error when idExist is true", () => {
    const valObj = { itamId: { error: false, message: "" } };
    const result = itamIdValidation(valObj, true);
    expect(result.itamId.error).toBe(true);
    expect(result.itamId.message).toBe("ITAM ID already exists.");
  });

  it("should clear error when idExist is false", () => {
    const valObj = { itamId: { error: true, message: "old" } };
    const result = itamIdValidation(valObj, false);
    expect(result.itamId.error).toBe(false);
    expect(result.itamId.message).toBe("");
  });
});

describe("mandatoryFields", () => {
  it("should enable all when both clarityId and itamId have values", () => {
    const result = mandatoryFields("CLRT001", "ITAM001");
    expect(result).toEqual({
      clarityIdCondition: false,
      projectNameCondition: true,
      itamIdCondition: false,
      appNameCondition: true,
    });
  });

  it("should enable only itamId related when only itamId has value", () => {
    const result = mandatoryFields("", "ITAM001");
    expect(result).toEqual({
      clarityIdCondition: false,
      projectNameCondition: false,
      itamIdCondition: false,
      appNameCondition: true,
    });
  });

  it("should enable only clarityId related when only clarityId has value", () => {
    const result = mandatoryFields("CLRT001", "");
    expect(result).toEqual({
      clarityIdCondition: false,
      projectNameCondition: true,
      itamIdCondition: false,
      appNameCondition: false,
    });
  });

  it("should return defaults when both are empty", () => {
    const result = mandatoryFields("", "");
    expect(result).toEqual({
      clarityIdCondition: true,
      projectNameCondition: false,
      itamIdCondition: true,
      appNameCondition: false,
    });
  });

  it("should return defaults when both are undefined", () => {
    const result = mandatoryFields(undefined, undefined);
    expect(result).toEqual({
      clarityIdCondition: true,
      projectNameCondition: false,
      itamIdCondition: true,
      appNameCondition: false,
    });
  });
});
