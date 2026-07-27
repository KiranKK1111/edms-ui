import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import LicenseDetails from "../../../components/license/licenseDetails/LicenseDetails";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: (mapStateToProps) => (Component) => {
    if (mapStateToProps) {
      mapStateToProps({ contract: { selectedContract: null } });
    }
    return Component;
  },
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
const { licenseDetails } = require("../../../store/actions/licensedataAction");

const buildState = () => ({
  licenseReq: { licenseDetailsRequirements: [] },
  license: { selectedLicense: "" },
});

// A fully valid set of licence values, shaped the way the component stores
// them in redux (licenseDetailsRequirements). bindData copies every key onto
// the form, so trigger() passes validation with this record.
const fullReduxRecord = {
  licenceId: "L100",
  licenceValue: "1000",
  longName: "Redux Long",
  shortName: "Redux Short",
  NoOfLicencePurchased: "10",
  licenceType: "User Licence",
  dataProcurementType: "Data Leasing",
  status: "Pending",
  NoOfLicenceUsed: 2,
  expirationDate: "2025-12-31",
};

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
    licenseDetails.mockClear();
    mockDispatch.mockClear();
    defaultProps.next.mockClear();
    defaultProps.handleChange.mockClear();
    defaultProps.handleLicenseType.mockClear();
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

  it("should prefill the form from location state record values", async () => {
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
          licenseExpiryDate: "2024-06-15",
          licenseNumberOfLicensesPurchaised: "10",
          licenseNumberOfLicensesUsed: "5",
          licenseStatus: "Active",
        },
      },
    };
    renderDetails();
    expect(await screen.findByDisplayValue("Test Long")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1000")).toBeInTheDocument();
    // The record's expiry differs from the agreement's -> checkbox checked
    await waitFor(() =>
      expect(screen.getByRole("checkbox")).toBeChecked()
    );
  });

  it("should prefill the form from reduxData.licenseDetailsRequirements", async () => {
    mockState.licenseReq.licenseDetailsRequirements = [{ ...fullReduxRecord }];
    renderDetails();
    expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Redux Short")).toBeInTheDocument();
    expect(screen.getByDisplayValue("L100")).toBeInTheDocument();
  });

  it("should default expiration to 2099 when agreementNoExpiryFlag is Y", async () => {
    localStorage.setItem(
      "agRecord",
      JSON.stringify({
        agreementExpiryDate: "2025-12-31",
        agreementNoExpiryFlag: "Y",
        agreementId: "AG001",
      })
    );
    renderDetails();
    expect(await screen.findByDisplayValue(/2099/)).toBeInTheDocument();
  });

  it("should validate and dispatch licence details when formData is true (create)", async () => {
    mockState.licenseReq.licenseDetailsRequirements = [{ ...fullReduxRecord }];
    const next = jest.fn();
    renderDetails({ formData: true, next });
    await waitFor(() => expect(licenseDetails).toHaveBeenCalled());
    const payload = licenseDetails.mock.calls[0][0][0];
    expect(payload.longName).toBe("Redux Long");
    expect(payload.shortName).toBe("Redux Short");
    expect(payload.licenceValue).toBe("1000");
    // create flow (addLicense path) never sends NoOfLicenceUsed
    expect(payload).not.toHaveProperty("NoOfLicenceUsed");
    expect(mockDispatch).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(false);
    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
  });

  it("should include NoOfLicenceUsed in the dispatched payload on edit", async () => {
    mockLocation = { pathname: "/editLicense/L001", state: null };
    mockState.licenseReq.licenseDetailsRequirements = [{ ...fullReduxRecord }];
    const next = jest.fn();
    renderDetails({ formData: true, next });
    await waitFor(() => expect(licenseDetails).toHaveBeenCalled());
    const payload = licenseDetails.mock.calls[0][0][0];
    expect(payload).toHaveProperty("NoOfLicenceUsed");
    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
  });

  it("should NOT dispatch when validation fails with formData true", async () => {
    // no prefill -> required fields are empty -> trigger() fails
    const next = jest.fn();
    renderDetails({ formData: true, next });
    expect(next).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(screen.getAllByText(/mandatory/i).length).toBeGreaterThan(0)
    );
    expect(licenseDetails).not.toHaveBeenCalled();
  });

  it("should fetch the used-licence count on the edit path", async () => {
    mockLocation = { pathname: "/editLicense/L001", state: null };
    renderDetails();
    await waitFor(() => expect(getLicenseCountById).toHaveBeenCalled());
    expect(await screen.findByDisplayValue("5")).toBeInTheDocument();
  });

  it("should flag a duplicate short name on blur and clear it after", async () => {
    const licenseList = [
      {
        licenseAgreementId: "AG001",
        licenseId: "L900",
        licenseShortName: "DUP",
        licenseLongName: "DUP LONG",
        contractId: "C001",
        licenseName: "Lic A",
      },
    ];
    renderDetails({ licenseList });
    const shortName = screen.getByPlaceholderText("Enter Short Name");
    fireEvent.change(shortName, { target: { value: "DUP" } });
    fireEvent.blur(shortName);
    expect(
      await screen.findByText("Licence name already exists under this agreement")
    ).toBeInTheDocument();
    fireEvent.change(shortName, { target: { value: "UNIQUE" } });
    fireEvent.blur(shortName);
    await waitFor(() =>
      expect(
        screen.queryByText("Licence name already exists under this agreement")
      ).not.toBeInTheDocument()
    );
  });

  it("should flag a duplicate long name on blur and clear it after", async () => {
    const licenseList = [
      {
        licenseAgreementId: "AG001",
        licenseId: "L900",
        licenseShortName: "DUP",
        licenseLongName: "DUP LONG",
        contractId: "C001",
        licenseName: "Lic A",
      },
    ];
    renderDetails({ licenseList });
    const longName = screen.getByPlaceholderText("Enter Long Name");
    fireEvent.change(longName, { target: { value: "DUP LONG" } });
    fireEvent.blur(longName);
    expect(
      await screen.findByText("Licence name already exists under this agreement")
    ).toBeInTheDocument();
    fireEvent.change(longName, { target: { value: "SOMETHING ELSE" } });
    fireEvent.blur(longName);
    await waitFor(() =>
      expect(
        screen.queryByText("Licence name already exists under this agreement")
      ).not.toBeInTheDocument()
    );
  });

  it("should not raise duplicate errors when no licence exists under the agreement", async () => {
    const licenseList = [
      {
        licenseAgreementId: "AG999",
        licenseId: "L900",
        licenseShortName: "DUP",
        licenseLongName: "DUP LONG",
      },
    ];
    renderDetails({ licenseList });
    const shortName = screen.getByPlaceholderText("Enter Short Name");
    fireEvent.change(shortName, { target: { value: "DUP" } });
    fireEvent.blur(shortName);
    const longName = screen.getByPlaceholderText("Enter Long Name");
    fireEvent.change(longName, { target: { value: "DUP LONG" } });
    fireEvent.blur(longName);
    await waitFor(() =>
      expect(
        screen.queryByText("Licence name already exists under this agreement")
      ).not.toBeInTheDocument()
    );
  });

  it("should call handleLicenseType when the licence type is changed", async () => {
    renderDetails();
    const combos = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combos[0]);
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getByText("User Licence"));
    expect(defaultProps.handleLicenseType).toHaveBeenCalledWith("User Licence");
  });

  it("should call handleLicenseType when the data procurement type is changed", async () => {
    renderDetails();
    const combos = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combos[1]);
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getByText("Data Purchase"));
    expect(defaultProps.handleLicenseType).toHaveBeenCalledWith("Data Purchase");
  });

  describe("duplicate licence name check on contract change", () => {
    const withNames = (overrides = {}) => [
      {
        ...fullReduxRecord,
        licenceName: "Lic A",
        licenseName: "Lic A",
        ...overrides,
      },
    ];

    it("should detect a duplicate licence name for the selected contract", async () => {
      mockState.licenseReq.licenseDetailsRequirements = withNames();
      const licenseList = [
        { contractId: "C001", licenseName: "Lic A", licenseAgreementId: "AG001" },
      ];
      renderDetails({ licenseList });
      expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    });

    it("should respect isLicenseNameChanged when editing (params.id set)", async () => {
      mockParams = { id: "L001" };
      mockState.licenseReq.licenseDetailsRequirements = withNames();
      const licenseList = [
        { contractId: "C001", licenseName: "Lic A", licenseAgreementId: "AG001" },
      ];
      renderDetails({ licenseList, isLicenseNameChanged: true });
      expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    });

    it("should treat a different licence name as not duplicate", async () => {
      mockState.licenseReq.licenseDetailsRequirements = withNames({
        licenseName: "Different",
        licenceName: "Different",
      });
      const licenseList = [
        { contractId: "C001", licenseName: "Lic A", licenseAgreementId: "AG001" },
      ];
      renderDetails({ licenseList });
      expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    });

    it("should handle a licence list without entries for the contract", async () => {
      mockState.licenseReq.licenseDetailsRequirements = withNames();
      const licenseList = [
        { contractId: "OTHER", licenseName: "Lic A", licenseAgreementId: "AG001" },
      ];
      renderDetails({ licenseList });
      expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    });

    it("should handle a missing licence list", async () => {
      mockState.licenseReq.licenseDetailsRequirements = withNames();
      renderDetails({ licenseList: null });
      expect(await screen.findByDisplayValue("Redux Long")).toBeInTheDocument();
    });
  });
});
