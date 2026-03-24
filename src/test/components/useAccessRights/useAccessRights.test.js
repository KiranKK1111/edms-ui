import useAccessRights from "../../../components/useAccessRights";

describe("useAccessRights", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Read only role", () => {
    beforeEach(() => {
      localStorage.setItem("entitlementType", "Read only");
    });

    it("should return r: true for myTasks page", () => {
      const result = useAccessRights("myTasks");
      expect(result.r).toBe(true);
    });

    it("should return r: true for userManagement page", () => {
      const result = useAccessRights("userManagement");
      expect(result.r).toBe(true);
    });

    it("should return r: false for catalogue page", () => {
      const result = useAccessRights("catalogue");
      expect(result.r).toBe(false);
    });

    it("should not have none permission for any page", () => {
      const result = useAccessRights("myTasks");
      expect(result.none).toBeUndefined();
    });
  });

  describe("Dataset delegate role", () => {
    beforeEach(() => {
      localStorage.setItem("entitlementType", "dataset delegate");
    });

    it("should return r: true for userManagement page", () => {
      const result = useAccessRights("userManagement");
      expect(result.r).toBe(true);
    });

    it("should return r: false for myTasks page", () => {
      const result = useAccessRights("myTasks");
      expect(result.r).toBe(false);
    });
  });

  describe("Subscriber role", () => {
    beforeEach(() => {
      localStorage.setItem("entitlementType", "subscriber");
    });

    it("should return none: true for myTasks page", () => {
      const result = useAccessRights("myTasks");
      expect(result.none).toBe(true);
    });

    it("should return none: true for userManagement page", () => {
      const result = useAccessRights("userManagement");
      expect(result.none).toBe(true);
    });

    it("should return none: false for catalogue page", () => {
      const result = useAccessRights("catalogue");
      expect(result.none).toBe(false);
    });
  });

  describe("Guest role", () => {
    beforeEach(() => {
      localStorage.setItem("guestRole", "guest");
    });

    it("should return r: true for catalogue page", () => {
      const result = useAccessRights("catalogue");
      expect(result.r).toBe(true);
    });

    it("should return r: true for datafeedDetails page", () => {
      const result = useAccessRights("datafeedDetails");
      expect(result.r).toBe(true);
    });

    it("should return none: true for requestAccess page", () => {
      const result = useAccessRights("requestAccess");
      expect(result.none).toBe(true);
    });

    it("should return none: true for myTasks page", () => {
      const result = useAccessRights("myTasks");
      expect(result.none).toBe(true);
    });

    it("should return none: true for userManagement page", () => {
      const result = useAccessRights("userManagement");
      expect(result.none).toBe(true);
    });

    it("should return r: false for a non-restricted page", () => {
      const result = useAccessRights("dashboard");
      expect(result.r).toBe(false);
    });
  });

  describe("Role not in access rights list", () => {
    it("should return empty permissions for unknown role", () => {
      localStorage.setItem("entitlementType", "Dataset Owner");
      const result = useAccessRights("myTasks");
      expect(result).toEqual({});
    });
  });

  describe("Fallback to guestRole", () => {
    it("should use guestRole when entitlementType is not set", () => {
      localStorage.setItem("guestRole", "guest");
      const result = useAccessRights("catalogue");
      expect(result.r).toBe(true);
    });
  });
});
