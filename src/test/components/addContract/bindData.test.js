import { bindData } from "../../../components/addContract/bindData";

describe("Contract bindData", () => {
  let mockForm;

  beforeEach(() => {
    mockForm = {
      setFieldsValue: jest.fn(),
    };
  });

  it("should not call setFieldsValue when data is null", () => {
    bindData(null, mockForm);
    expect(mockForm.setFieldsValue).not.toHaveBeenCalled();
  });

  it("should not call setFieldsValue when data is empty array", () => {
    bindData([], mockForm);
    expect(mockForm.setFieldsValue).not.toHaveBeenCalled();
  });

  it("should call setFieldsValue for regular fields", () => {
    const data = [{ agreementName: "Test Agreement" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      agreementName: "Test Agreement",
    });
  });

  it("should convert signedOn to moment date", () => {
    const data = [{ signedOn: "2024-01-15" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalled();
    const call = mockForm.setFieldsValue.mock.calls[0][0];
    expect(call).toHaveProperty("signedOn");
  });

  it("should convert startDate to moment date", () => {
    const data = [{ startDate: "2024-01-15" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalled();
    const call = mockForm.setFieldsValue.mock.calls[0][0];
    expect(call).toHaveProperty("startDate");
  });

  it("should convert expirationDate to moment date", () => {
    const data = [{ expirationDate: "2024-12-31" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalled();
    const call = mockForm.setFieldsValue.mock.calls[0][0];
    expect(call).toHaveProperty("expirationDate");
  });

  it("should handle multiple fields in one data item", () => {
    const data = [{ agreementName: "Test", agreementId: "AG001" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledTimes(2);
  });

  it("should filter out undefined elements from data array", () => {
    const data = [undefined, { agreementName: "Test" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      agreementName: "Test",
    });
  });
});
