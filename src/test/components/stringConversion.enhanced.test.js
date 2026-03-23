import {
  camelize,
  normalText,
  normalLabel,
  camelText,
  checkUrlSlash,
  getCustomLabels,
  getObjFromSubscription,
} from "../../components/stringConversion";

describe("camelize", () => {
  it("should convert space-separated text to camelCase", () => {
    expect(camelize("hello world")).toBe("helloWorld");
  });

  it("should convert dash-separated text to camelCase", () => {
    expect(camelize("hello-world")).toBe("helloWorld");
  });

  it("should convert underscore-separated text to camelCase", () => {
    expect(camelize("hello_world")).toBe("helloWorld");
  });

  it("should convert dot-separated text to camelCase", () => {
    expect(camelize("hello.world")).toBe("helloWorld");
  });

  it("should handle single word", () => {
    expect(camelize("hello")).toBe("hello");
  });

  it("should handle multiple separators", () => {
    expect(camelize("hello world-foo_bar")).toBe("helloWorldFooBar");
  });
});

describe("normalText", () => {
  it("should add space before uppercase letters and capitalize first letter", () => {
    expect(normalText("helloWorld")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(normalText("hello")).toBe("Hello");
  });

  it("should handle already capitalized text", () => {
    expect(normalText("Hello")).toBe(" Hello");
  });
});

describe("normalLabel", () => {
  it("should convert camelCase to normal label", () => {
    expect(normalLabel("clarityId")).toBe("Clarity id");
  });

  it("should handle single word", () => {
    expect(normalLabel("hello")).toBe("Hello");
  });

  it("should convert helloWorld to Hello world", () => {
    expect(normalLabel("helloWorld")).toBe("Hello world");
  });
});

describe("camelText", () => {
  it("should capitalize first letter and lowercase rest", () => {
    expect(camelText("HELLO")).toBe("Hello");
  });

  it("should handle already formatted text", () => {
    expect(camelText("Hello")).toBe("Hello");
  });

  it("should handle single character", () => {
    expect(camelText("h")).toBe("h");
  });

  it("should handle null/undefined", () => {
    expect(camelText(null)).toBeFalsy();
    expect(camelText(undefined)).toBeFalsy();
  });
});

describe("checkUrlSlash", () => {
  it("should replace forward slash with %2F", () => {
    expect(checkUrlSlash("path/to/resource")).toBe("path%2Fto%2Fresource");
  });

  it("should return original string when no slashes", () => {
    expect(checkUrlSlash("resource")).toBe("resource");
  });

  it("should return undefined for 're' (case-insensitive)", () => {
    expect(checkUrlSlash("re")).toBeUndefined();
    expect(checkUrlSlash("RE")).toBeUndefined();
  });

  it("should handle null/undefined", () => {
    expect(checkUrlSlash(null)).toBeUndefined();
    expect(checkUrlSlash(undefined)).toBeUndefined();
  });
});

describe("getCustomLabels", () => {
  it("should replace 'id' with 'ID' in labels", () => {
    expect(getCustomLabels("clarityId")).toBe("Clarity ID");
  });

  it("should return normal label for regular text", () => {
    expect(getCustomLabels("department")).toBe("Department");
  });
});

describe("getObjFromSubscription", () => {
  it("should return value from business requirements", () => {
    const subscription = {
      businessRequirements: [{ key1: "value1", key2: "value2" }],
    };
    expect(getObjFromSubscription(subscription, "key1")).toBe("value1");
  });

  it("should return undefined when subscription is null", () => {
    expect(getObjFromSubscription(null, "key1")).toBeUndefined();
  });

  it("should return undefined when businessRequirements is empty", () => {
    const subscription = { businessRequirements: [] };
    expect(getObjFromSubscription(subscription, "key1")).toBeUndefined();
  });

  it("should return undefined when businessRequirements is missing", () => {
    const subscription = {};
    expect(getObjFromSubscription(subscription, "key1")).toBeUndefined();
  });

  it("should return undefined for non-existent key", () => {
    const subscription = {
      businessRequirements: [{ key1: "value1" }],
    };
    expect(getObjFromSubscription(subscription, "nonExistent")).toBeUndefined();
  });
});
