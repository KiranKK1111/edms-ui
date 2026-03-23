import { bindData } from "../../../components/license/bindData/bindData";

describe("License bindData", () => {
  let mockForm;

  beforeEach(() => {
    mockForm = {
      setFieldsValue: jest.fn(),
      resetFields: jest.fn(),
    };
  });

  it("should call resetFields when data is empty", () => {
    bindData([], mockForm);
    expect(mockForm.resetFields).toHaveBeenCalled();
  });

  it("should call resetFields when data is null", () => {
    bindData(null, mockForm);
    expect(mockForm.resetFields).toHaveBeenCalled();
  });

  it("should call setFieldsValue for regular fields", () => {
    const data = [{ licenseLongName: "Test License" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      licenseLongName: "Test License",
    });
  });

  it("should convert boolean-like string fields to lowercase", () => {
    const data = [{ redistributionAllowed: "Yes" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      redistributionAllowed: "yes",
    });
  });

  it("should convert expirationDate to moment", () => {
    const data = [{ expirationDate: "2024-12-31" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalled();
    const call = mockForm.setFieldsValue.mock.calls[0][0];
    expect(call).toHaveProperty("expirationDate");
  });

  it("should handle multiple known boolean fields", () => {
    const data = [{ cacheAllowed: "YES", storageAllowed: "NO" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({ cacheAllowed: "yes" });
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({ storageAllowed: "no" });
  });

  it("should not convert non-string boolean fields", () => {
    const data = [{ personalData: true }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({ personalData: true });
  });
});
