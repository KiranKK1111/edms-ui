import { isNumber } from "../../../components/validations/commonValidations";

describe("isNumber", () => {
  it("should return true for digit key (0-9)", () => {
    expect(isNumber({ which: 48 })).toBe(true); // 0
    expect(isNumber({ which: 49 })).toBe(true); // 1
    expect(isNumber({ which: 57 })).toBe(true); // 9
  });

  it("should return false for alphabetic key", () => {
    expect(isNumber({ which: 65 })).toBe(false); // A
    expect(isNumber({ which: 90 })).toBe(false); // Z
    expect(isNumber({ which: 97 })).toBe(false); // a
  });

  it("should return true for control keys (charCode <= 31)", () => {
    expect(isNumber({ which: 8 })).toBe(true);  // Backspace
    expect(isNumber({ which: 13 })).toBe(true); // Enter
    expect(isNumber({ which: 0 })).toBe(true);  // null char
  });

  it("should return false for special character keys", () => {
    expect(isNumber({ which: 33 })).toBe(false);  // !
    expect(isNumber({ which: 64 })).toBe(false);  // @
    expect(isNumber({ which: 35 })).toBe(false);  // #
    expect(isNumber({ which: 46 })).toBe(false);  // .
  });

  it("should use keyCode when which is not available", () => {
    expect(isNumber({ keyCode: 50 })).toBe(true);  // 2
    expect(isNumber({ keyCode: 65 })).toBe(false);  // A
  });

  it("should use window.event when evt is falsy", () => {
    // When passed falsy event, should not throw
    const originalEvent = window.event;
    window.event = { which: 50 };
    expect(isNumber(null)).toBe(true);
    window.event = originalEvent;
  });
});
