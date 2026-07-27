import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import LicenseDetails from "../../../components/license/licenseDetails/LicenseDetails";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockLocation = { pathname: "/addLicense", state: null };
let mockParams = {};
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => mockLocation,
  useParams: () => mockParams,
}));

jest.mock("../../../store/services/LicenseService", () => ({
  getLicenseCountById: jest.fn(),
}));

jest.mock("../../../store/actions/licensedataAction", () => ({
  licenseDetails: jest.fn(),
}));

const { getLicenseCountById } = require("../../../store/services/LicenseService");

const buildState = () => ({
  licenseReq: { licenseDetailsRequirements: [] },
  license: { selectedLicense: "" },
});

const defaultProps = {
  next: jest.fn(),
  formData: false,
  contractId: "C001",
  licenseStatus: "Pending",
  handleChange: jest.fn(),
  handleLicenseType: jest.fn(),
  licenseList: [],
  isLicenseNameChanged: false,
};

const renderDetails = (props = {}) =>
  render(
    <AppProviders>
      <LicenseDetails {...defaultProps} {...props} />
    </AppProviders>
  );

describe("LicenseDetails", () => {
  beforeEach(() => {
    mockState = buildState();
    getLicenseCountById.mockResolvedValue({ data: { licenseListCount: 5 } });
    mockLocation = { pathname: "/addLicense", state: null };
    mockParams = {};
    localStorage.clear();
    localStorage.setItem(
      "agRecord",
      JSON.stringify({
        agreementExpiryDate: "2025-12-31",
        agreementNoExpiryFlag: "N",
        agreementId: "AG001",
      })
    );
  });

  it("should render the core licence fields", () => {
    renderDetails();
    expect(screen.getAllByText("Licence ID").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Licence Value").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Long Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Short Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the licence type and data procurement type fields", () => {
    renderDetails();
    expect(screen.getAllByText("Licence Type").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Data Procurement Type").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the No. of Licences purchased field", () => {
    renderDetails();
    expect(
      screen.getAllByText("No. of Licences purchased").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the Different from Agreement checkbox", () => {
    renderDetails();
    expect(screen.getByText("Different from Agreement")).toBeInTheDocument();
  });

  it("should NOT render No. of Licence Used on the addLicense path", () => {
    mockLocation = { pathname: "/addLicense", state: null };
    renderDetails();
    expect(screen.queryByText("No. of Licence Used")).not.toBeInTheDocument();
  });

  it("should render No. of Licence Used on the editLicense path", () => {
    mockLocation = { pathname: "/editLicense/L001", state: null };
    renderDetails();
    expect(
      screen.getAllByText("No. of Licence Used").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render with a location state record", () => {
    mockLocation = {
      pathname: "/editLicense/L001",
      state: {
        record: {
          licenseId: "L001",
          licenseLongName: "Test Long",
          licenseShortName: "TL",
          licenseType: "Enterprise Licence",
          licenseDataProcurementType: "Data Leasing",
          licenseValuePerMonth: "1000",
          licenseExpiryDate: "2025-12-31",
          licenseNumberOfLicensesPurchaised: "10",
          licenseNumberOfLicensesUsed: "5",
          licenseStatus: "Active",
        },
      },
    };
    renderDetails();
    expect(screen.getAllByText("Licence ID").length).toBeGreaterThanOrEqual(1);
  });
});
