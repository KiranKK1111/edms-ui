import React from "react";
import { render } from "@testing-library/react";
import BusinessRequirements, {
  ruleForSubscriptionFor,
} from "../../../components/requestAccess/BusinessRequirements";

const mockDispatch = jest.fn();
let mockState = {
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
  requestAccess: { businessRequirements: [] },
};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  withRouter: (component) => component,
}));

const mockNext = jest.fn();
const mockSetSubscriptionFor = jest.fn();
const mockSetVendorRequest = jest.fn();

describe("BusinessRequirements", () => {
  it("should render the business container", () => {
    const { container } = render(
      <BusinessRequirements
        next={mockNext}
        formData={false}
        view={"br"}
        setSubscriptionFor={mockSetSubscriptionFor}
        setVendorRequest={mockSetVendorRequest}
      />
    );
    expect(container.querySelector(".business")).toBeInTheDocument();
  });

  it("should render the Subscription type field", () => {
    const { getByText } = render(
      <BusinessRequirements
        next={mockNext}
        formData={false}
        view={"br"}
        setSubscriptionFor={mockSetSubscriptionFor}
        setVendorRequest={mockSetVendorRequest}
      />
    );
    expect(getByText("On-Demand Vendor request")).toBeInTheDocument();
  });
});

describe("ruleForSubscriptionFor", () => {
  test("should reject when subFor is false and value is empty", async () => {
    await expect(ruleForSubscriptionFor(false, "")).rejects.toThrow(
      "Please enter a service account ID"
    );
  });

  test("should reject when subFor is false and value contains spaces", async () => {
    await expect(ruleForSubscriptionFor(false, "invalid value")).rejects.toThrow(
      "Application service account ID cannot contain spaces"
    );
  });

  test("should resolve when subFor is false and value is valid", async () => {
    await expect(
      ruleForSubscriptionFor(false, "validValue")
    ).resolves.toBeUndefined();
  });

  test("should resolve when subFor is true regardless of value", async () => {
    await expect(ruleForSubscriptionFor(true, "")).resolves.toBeUndefined();
    await expect(
      ruleForSubscriptionFor(true, "anyValue")
    ).resolves.toBeUndefined();
  });
});
