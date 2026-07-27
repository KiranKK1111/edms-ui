import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import HeaderPanel from "../../../components/headerPanel/HeaderPanel";

let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => jest.fn(),
}));

let mockLocation = {};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockLocation,
  withRouter: (component) => component,
  useHistory: () => ({ push: jest.fn() }),
}));

const setupSelector = (licenseInfo = {}, agreementInfo = {}) => {
  mockState = {
    license: { licenseById: licenseInfo },
    contract: { agreementById: agreementInfo },
  };
};

const setupLocation = (data = { dataFeedStatus: "Active", entityShortName: "TestEntity" }) => {
  mockLocation = { pathname: "/catalog/details", state: { data } };
};

const renderPanel = () =>
  render(
    <AppProviders>
      <HeaderPanel />
    </AppProviders>
  );

describe("HeaderPanel", () => {
  beforeEach(() => {
    setupLocation();
    setupSelector();
  });

  it("should render all five header fields", () => {
    renderPanel();
    expect(screen.getByText("Number of available Licences")).toBeInTheDocument();
    expect(screen.getByText("Expiration date")).toBeInTheDocument();
    expect(screen.getByText("Data source")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("SCB Data Owner")).toBeInTheDocument();
  });

  it("should display the entity short name as data source", () => {
    renderPanel();
    expect(screen.getByText("TestEntity")).toBeInTheDocument();
  });

  it("should display NA when entityShortName is empty", () => {
    setupLocation({ dataFeedStatus: "Active", entityShortName: "" });
    renderPanel();
    // Data source NA + SCB Data Owner NA
    expect(screen.getAllByText("NA").length).toBeGreaterThanOrEqual(1);
  });

  it("should render a success status chip for active status", () => {
    const { container } = renderPanel();
    expect(container.querySelector(".MuiChip-colorSuccess")).toBeInTheDocument();
  });

  it("should render a warning status chip for pending status", () => {
    setupLocation({ dataFeedStatus: "Pending", entityShortName: "Test" });
    const { container } = renderPanel();
    expect(container.querySelector(".MuiChip-colorWarning")).toBeInTheDocument();
  });

  it("should render an error status chip for inactive status", () => {
    setupLocation({ dataFeedStatus: "Inactive", entityShortName: "Test" });
    const { container } = renderPanel();
    expect(container.querySelector(".MuiChip-colorError")).toBeInTheDocument();
  });

  it("should display Unlimited licenses for an enterprise license type", () => {
    setupSelector(
      {
        licenseType: "Enterprise License",
        licenseNumberOfLicensesPurchaised: "100",
        licenseNumberOfLicensesUsed: "50",
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    renderPanel();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
  });

  it("should calculate available licenses for a non-enterprise type", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNumberOfLicensesPurchaised: "100",
        licenseNumberOfLicensesUsed: "30",
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    renderPanel();
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("should display license expiry date when the inheritance flag is true", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNoInheritanceFlag: "true",
        licenseExpiryDate: "2025-12-31",
      },
      {}
    );
    renderPanel();
    expect(screen.getByText("31 Dec 2025")).toBeInTheDocument();
  });

  it("should display agreement expiry date when the inheritance flag is false", () => {
    setupSelector(
      { licenseType: "Named User", licenseNoInheritanceFlag: "false" },
      { agreementExpiryDate: "2026-06-30" }
    );
    renderPanel();
    expect(screen.getByText("30 Jun 2026")).toBeInTheDocument();
  });

  it("should display the default date when there is no agreement expiry", () => {
    setupSelector(
      { licenseNoInheritanceFlag: "false" },
      { agreementExpiryDate: null }
    );
    renderPanel();
    expect(screen.getByText("31 Dec 2099")).toBeInTheDocument();
  });

  it("should display the SCB Data Owner when set", () => {
    setupSelector({}, { agreementScbAgreementMgrBankId: "1234567" });
    renderPanel();
    expect(screen.getByText("1234567")).toBeInTheDocument();
  });

  it("should handle null licenseInfo gracefully", () => {
    mockState = {
      license: { licenseById: null },
      contract: { agreementById: null },
    };
    const { container } = renderPanel();
    expect(container.querySelector(".page-form-meta")).toBeInTheDocument();
  });

  it("should handle null used licenses", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNumberOfLicensesPurchaised: "50",
        licenseNumberOfLicensesUsed: null,
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    renderPanel();
    expect(screen.getByText("50")).toBeInTheDocument();
  });
});
