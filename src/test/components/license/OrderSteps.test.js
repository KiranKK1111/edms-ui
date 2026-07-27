import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import OrderSteps from "../../../components/license/step/OrderSteps";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockParams = { id: "123" };
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useHistory: () => ({ push: jest.fn() }),
}));

// Step content children are exercised by their own suites.
jest.mock("../../../components/license/licenseDetails/LicenseDetails", () => () => (
  <div data-testid="license-details-step" />
));
jest.mock("../../../components/license/licenseLimitations/LicenseLimitations", () => () => (
  <div data-testid="license-limitations-step" />
));
jest.mock("../../../components/license/reviewSubmit/ReviewSubmit", () => () => (
  <div data-testid="review-submit-step" />
));

jest.mock("../../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn(),
}));
jest.mock("../../../store/actions/licenseAction", () => ({
  setSelectedLicense: jest.fn(),
  startGetLicenses: jest.fn(),
}));
jest.mock("../../../store/actions/licensedataAction", () => ({
  upload: jest.fn(),
}));

const license = { licenseList: [[]], selectedLicense: [{}] };
const contract = {
  data: [
    [
      { agreementStatus: "active", contractName: "TestContract", contractId: "C001", contractStatus: "Active" },
      { agreementStatus: "inactive", contractName: "OtherContract", contractId: "C002", contractStatus: "Inactive" },
    ],
  ],
  selectedContract: [],
  contractDetails: [],
};
const licenseReq = { licenseDetailsRequirements: [] };

const defaultProps = {
  current: 0,
  formData: false,
  next: jest.fn(),
  onStepsReady: jest.fn(),
  isFormValid: jest.fn(),
  savedData: jest.fn(),
};

const renderSteps = (props = {}) =>
  render(
    <AppProviders>
      <OrderSteps {...defaultProps} {...props} />
    </AppProviders>
  );

describe("OrderSteps (controlled body)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: "123" };
    mockState = { license, contract, licenseReq };
  });

  it("should render the main container", () => {
    const { container } = renderSteps();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("reports its step list to the controller via onStepsReady", () => {
    renderSteps();
    expect(defaultProps.onStepsReady).toHaveBeenCalledWith([
      { key: "Licence Details", title: "Licence Details" },
      { key: "Licence Limitations", title: "Licence Limitations" },
      { key: "Review & Submit", title: "Review & Submit" },
    ]);
  });

  it("renders only the current step's content (step 0)", () => {
    renderSteps({ current: 0 });
    expect(screen.getByTestId("license-details-step")).toBeInTheDocument();
    expect(
      screen.queryByTestId("license-limitations-step")
    ).not.toBeInTheDocument();
  });

  it("renders the limitations step content when current is 1", () => {
    renderSteps({ current: 1 });
    expect(screen.getByTestId("license-limitations-step")).toBeInTheDocument();
  });

  it("renders the review step content when current is 2", () => {
    renderSteps({ current: 2 });
    expect(screen.getByTestId("review-submit-step")).toBeInTheDocument();
  });

  it("does NOT render its own stepper navigation buttons", () => {
    renderSteps();
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Previous" })
    ).not.toBeInTheDocument();
  });

  it("should call the isFormValid and savedData props", () => {
    renderSteps();
    expect(defaultProps.isFormValid).toHaveBeenCalled();
    expect(defaultProps.savedData).toHaveBeenCalled();
  });

  it("should render with a contractId in params", () => {
    mockParams = { contractId: "C001" };
    const { container } = renderSteps();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });
});
