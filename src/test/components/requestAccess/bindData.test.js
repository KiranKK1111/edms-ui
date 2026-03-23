import { bindData } from "../../../components/requestAccess/bindData";

describe("RequestAccess bindData", () => {
  let mockForm;

  beforeEach(() => {
    mockForm = {
      setFieldsValue: jest.fn(),
    };
  });

  it("should not call setFieldsValue when data is empty", () => {
    const result = bindData([], mockForm);
    expect(mockForm.setFieldsValue).not.toHaveBeenCalled();
  });

  it("should map reason field to reasonForSubscription", () => {
    const data = [{ reason: "Business need" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      reasonForSubscription: "Business need",
    });
  });

  it("should map licensesSubscribed to numberOfEndUserSubscriptions", () => {
    const data = [{ licensesSubscribed: 5 }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      numberOfEndUserSubscriptions: 5,
    });
  });

  it("should map subscriptionStatus to status", () => {
    const data = [{ subscriptionStatus: "Active" }];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      status: "Active",
    });
  });

  it("should also set the original field value", () => {
    const data = [{ reason: "Test" }];
    bindData(data, mockForm);
    // Should call for mapping AND for original field
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({ reason: "Test" });
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      reasonForSubscription: "Test",
    });
  });

  it("should handle multiple items in data array", () => {
    const data = [
      { reason: "Need 1" },
      { reason: "Need 2" },
    ];
    bindData(data, mockForm);
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      reasonForSubscription: "Need 1",
    });
    expect(mockForm.setFieldsValue).toHaveBeenCalledWith({
      reasonForSubscription: "Need 2",
    });
  });
});
