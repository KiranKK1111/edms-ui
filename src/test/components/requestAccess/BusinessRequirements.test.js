import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BusinessRequirements, {
  ruleForSubscriptionFor,
} from "../../../components/requestAccess/BusinessRequirements";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  withRouter: (component) => component,
}));

const mockBusinessRequirementsAction = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  businessRequirements: (...args) => mockBusinessRequirementsAction(...args),
}));

// Keep the real validation helpers (clarityIdValidation / itamIdValidation /
// modify) but stub the network-backed uniqueness lookup.
jest.mock("../../../components/requestAccess/validationsRequestAccess", () => {
  const actual = jest.requireActual(
    "../../../components/requestAccess/validationsRequestAccess"
  );
  return { __esModule: true, ...actual, checkValueExist: jest.fn() };
});
const {
  checkValueExist,
} = require("../../../components/requestAccess/validationsRequestAccess");

const buildState = (overrides = {}) => ({
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
  requestAccess: { businessRequirements: [] },
  ...overrides,
});

let mockNext;
let mockSetSubscriptionFor;
let mockSetVendorRequest;

const baseProps = () => ({
  next: mockNext,
  formData: false,
  view: "br",
  setSubscriptionFor: mockSetSubscriptionFor,
  setVendorRequest: mockSetVendorRequest,
});

const renderBR = (props = {}) =>
  render(<BusinessRequirements {...baseProps()} {...props} />);

const selectSubscriptionType = (label) => {
  fireEvent.mouseDown(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: label }));
};

const fillMandatoryFields = () => {
  fireEvent.change(screen.getByPlaceholderText("Reason for Subscription"), {
    target: { value: "Because we need the data" },
  });
  fireEvent.change(screen.getByPlaceholderText("No. of Licences"), {
    target: { value: "12" },
  });
  fireEvent.change(screen.getByPlaceholderText("Department"), {
    target: { value: "Risk Technology" },
  });
};

describe("BusinessRequirements", () => {
  beforeEach(() => {
    mockDispatch = jest.fn();
    mockNext = jest.fn();
    mockSetSubscriptionFor = jest.fn();
    mockSetVendorRequest = jest.fn();
    mockBusinessRequirementsAction.mockReturnValue("businessRequirements");
    checkValueExist.mockResolvedValue(false);
    localStorage.clear();
    localStorage.setItem("psid", "psid_user");
    mockState = buildState();
  });

  it("should render the business container", () => {
    const { container } = renderBR();
    expect(container.querySelector(".business")).toBeInTheDocument();
  });

  it("should render the On-Demand Vendor request section", () => {
    renderBR();
    expect(screen.getByText("On-Demand Vendor request")).toBeInTheDocument();
  });

  it("should default to an individual subscription and report it to the parent", () => {
    renderBR();
    // Individual subscription => "Myself" is ticked and Subscription for is locked
    expect(screen.getByRole("checkbox", { name: "Myself" })).toBeChecked();
    expect(screen.getByPlaceholderText("Subscription for")).toBeDisabled();
    expect(mockSetSubscriptionFor).toHaveBeenCalledWith(true);
    expect(mockSetVendorRequest).toHaveBeenLastCalledWith("N");
  });

  it("should prefill Subscription for with the logged in psid for an individual subscription", () => {
    renderBR();
    expect(screen.getByPlaceholderText("Subscription for")).toHaveValue(
      "psid_user"
    );
  });

  it("should hide the service account name field for an individual subscription", () => {
    renderBR();
    expect(
      screen.queryByPlaceholderText("Service account name")
    ).not.toBeInTheDocument();
  });

  it("should run the debounced clarity id and itam id uniqueness checks on mount", async () => {
    renderBR();
    await waitFor(
      () => expect(checkValueExist).toHaveBeenCalledWith("", "clarityId"),
      { timeout: 3000 }
    );
    await waitFor(
      () => expect(checkValueExist).toHaveBeenCalledWith("", "itamId"),
      { timeout: 3000 }
    );
  });

  it("should still settle the debounced checks when the ids already exist", async () => {
    checkValueExist.mockResolvedValue(true);
    const { container } = renderBR();
    await waitFor(() => expect(checkValueExist).toHaveBeenCalledTimes(2), {
      timeout: 3000,
    });
    expect(container.querySelector(".business")).toBeInTheDocument();
  });

  it("should prefill the form from the redux business requirements", () => {
    mockState = buildState({
      requestAccess: {
        businessRequirements: [
          {
            subscriptionId: "SUB-1",
            clarityId: "CL-99",
            reason: "Existing reason",
            licensesSubscribed: "42",
            subscriptionStatus: "Active",
            department: "Finance",
            projectName: "Atlas",
          },
        ],
      },
    });
    renderBR();
    expect(
      screen.getByPlaceholderText(
        "Subscription ID will be generated after submission"
      )
    ).toHaveValue("SUB-1");
    expect(screen.getByPlaceholderText("Clarity ID")).toHaveValue("CL-99");
    expect(screen.getByPlaceholderText("Reason for Subscription")).toHaveValue(
      "Existing reason"
    );
    expect(screen.getByPlaceholderText("No. of Licences")).toHaveValue("42");
    expect(screen.getByPlaceholderText("Status")).toHaveValue("Active");
    expect(screen.getByPlaceholderText("Department")).toHaveValue("Finance");
    expect(screen.getByPlaceholderText("Project name")).toHaveValue("Atlas");
  });

  it("should reveal the service account fields when switching to an application subscription", () => {
    renderBR();
    selectSubscriptionType("Application Subscription");
    expect(
      screen.getByPlaceholderText("Service account name")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Subscription for")).toBeEnabled();
    expect(screen.getByPlaceholderText("Subscription for")).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: "Myself" })).not.toBeChecked();
    expect(mockSetSubscriptionFor).toHaveBeenLastCalledWith(false);
  });

  it("should keep the vendor request radios disabled when the feed config is off", () => {
    renderBR();
    selectSubscriptionType("Application Subscription");
    expect(screen.getByRole("radio", { name: "Yes" })).toBeDisabled();
  });

  it("should keep the vendor request radios disabled for an individual subscription", () => {
    mockState = buildState({
      datafeedInfo: { congigUi: { vendorRequestConfig: "Y" } },
    });
    renderBR();
    expect(screen.getByRole("radio", { name: "Yes" })).toBeDisabled();
  });

  it("should keep the vendor request radios disabled when there is no ui config", () => {
    mockState = buildState({ datafeedInfo: { congigUi: {} } });
    renderBR();
    selectSubscriptionType("Application Subscription");
    expect(screen.getByRole("radio", { name: "Yes" })).toBeDisabled();
  });

  it("should enable and propagate the vendor request flag for an application subscription", () => {
    mockState = buildState({
      datafeedInfo: { congigUi: { vendorRequestConfig: "Y" } },
    });
    renderBR();
    selectSubscriptionType("Application Subscription");
    const yes = screen.getByRole("radio", { name: "Yes" });
    expect(yes).toBeEnabled();
    fireEvent.click(yes);
    expect(mockSetVendorRequest).toHaveBeenLastCalledWith("Y");
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(mockSetVendorRequest).toHaveBeenLastCalledWith("N");
  });

  it("should run the blur handlers without throwing", () => {
    renderBR();
    selectSubscriptionType("Application Subscription");
    fireEvent.blur(screen.getByPlaceholderText("Subscription for"));
    fireEvent.blur(screen.getByPlaceholderText("No. of Licences"));
    fireEvent.blur(screen.getByPlaceholderText("Project name"));
    fireEvent.blur(screen.getByPlaceholderText("Department"));
    expect(screen.getByPlaceholderText("Department")).toBeInTheDocument();
  });

  it("should dispatch the business requirements and advance when the form is valid", async () => {
    const { rerender } = renderBR();
    fillMandatoryFields();
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(mockBusinessRequirementsAction).toHaveBeenCalledWith(
        expect.objectContaining({
          reasonForSubscription: "Because we need the data",
          numberOfEndUserSubscriptions: "12",
          department: "Risk Technology",
          subscriptionType: "Individual Subscription",
          subscriptionFor: "psid_user",
        })
      )
    );
    expect(mockDispatch).toHaveBeenCalledWith("businessRequirements");
    await waitFor(() => expect(mockNext).toHaveBeenCalledWith(true));
    expect(mockNext).toHaveBeenCalledWith(false);
  });

  it("should not advance and should surface the mandatory field errors", async () => {
    const { rerender } = renderBR();
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Reason for Subscription is mandatory(Max 500 characters)")
      ).toBeInTheDocument()
    );
    expect(screen.getByText("No. of Licences is mandatory")).toBeInTheDocument();
    expect(screen.getByText("Department is mandatory")).toBeInTheDocument();
    expect(mockBusinessRequirementsAction).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(false);
    expect(mockNext).not.toHaveBeenCalledWith(true);
  });

  it("should reject an empty service account id for an application subscription", async () => {
    const { rerender } = renderBR();
    selectSubscriptionType("Application Subscription");
    fillMandatoryFields();
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Please enter a service account ID")
      ).toBeInTheDocument()
    );
    expect(mockBusinessRequirementsAction).not.toHaveBeenCalled();
  });

  it("should reject a service account id containing spaces", async () => {
    const { rerender } = renderBR();
    selectSubscriptionType("Application Subscription");
    fillMandatoryFields();
    fireEvent.change(screen.getByPlaceholderText("Subscription for"), {
      target: { value: "svc account" },
    });
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Application service account ID cannot contain spaces")
      ).toBeInTheDocument()
    );
    expect(mockBusinessRequirementsAction).not.toHaveBeenCalled();
  });

  it("should accept a valid service account id for an application subscription", async () => {
    const { rerender } = renderBR();
    selectSubscriptionType("Application Subscription");
    fillMandatoryFields();
    fireEvent.change(screen.getByPlaceholderText("Subscription for"), {
      target: { value: "svc_account" },
    });
    fireEvent.change(screen.getByPlaceholderText("Service account name"), {
      target: { value: "Service Account" },
    });
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(mockBusinessRequirementsAction).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionFor: "svc_account",
          serviceAccountName: "Service Account",
          subscriptionType: "Application Subscription",
        })
      )
    );
  });

  it("should reject a non numeric number of licences", async () => {
    const { rerender } = renderBR();
    fillMandatoryFields();
    fireEvent.change(screen.getByPlaceholderText("No. of Licences"), {
      target: { value: "abc" },
    });
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(screen.getByText("Only numbers are allowed")).toBeInTheDocument()
    );
    expect(mockBusinessRequirementsAction).not.toHaveBeenCalled();
  });

  it("should reject an invalid project name and an over long reason", async () => {
    const { rerender } = renderBR();
    fillMandatoryFields();
    fireEvent.change(screen.getByPlaceholderText("Project name"), {
      target: { value: "Bad*Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Reason for Subscription"), {
      target: { value: "x".repeat(501) },
    });
    rerender(<BusinessRequirements {...baseProps()} formData={true} />);
    await waitFor(() =>
      expect(
        screen.getByText("Only alphabets and numbers are allowed")
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(
        "Reason for Subscription should not be more than 500 characters"
      )
    ).toBeInTheDocument();
  });

  it("should not trigger the submit effect while formData stays false", () => {
    renderBR();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockBusinessRequirementsAction).not.toHaveBeenCalled();
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
