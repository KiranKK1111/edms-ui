import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import VendorData from "../../pages/masterData/VendorData";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// ---- redux (resetMocks safe: plain functions + module-level jest.fn) ----
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

// ---- router: real Link/MemoryRouter, capture history.push ----
const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useHistory: () => ({ push: mockHistoryPush }),
  };
});

// ---- pending-change warning popup ----
jest.mock("../../utils/warningUtils.js", () => ({
  warning: jest.fn(),
  checkForString: jest.fn(),
}));

// ---- store actions ----
jest.mock("../../store/actions/datasetFormActions", () => ({
  clearDataset: jest.fn(),
}));
jest.mock("../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn(),
  startUpdateAgreement: jest.fn(),
}));
jest.mock("../../store/actions/licenseAction", () => ({
  cleanResponse: jest.fn(),
  startAddLicense: jest.fn(),
}));

const { warning } = require("../../utils/warningUtils.js");
const { clearDataset } = require("../../store/actions/datasetFormActions");
const {
  startGetContracts,
  startUpdateAgreement,
} = require("../../store/actions/contractAction");
const { cleanResponse, startAddLicense } = require("../../store/actions/licenseAction");

const makeAgreement = (over = {}) => ({
  agreementId: "AG001",
  agreementName: "TestAgreement",
  agreementEdmsEntiryId: "V001",
  agreementType: "Vendor Contract",
  agreementStartDate: "2024-01-01",
  agreementExpiryDate: "2025-12-31",
  agreementStatus: "Active",
  agreementUpdateFlag: "N",
  contractStatus: "Active",
  ...over,
});

const makeLicense = (over = {}) => ({
  licenseId: "L001",
  licenseLongName: "Test License",
  licenseShortName: "TL",
  licenseAgreementId: "AG001",
  licenseExpiryDate: "2025-12-31",
  licenseStatus: "Active",
  licenseUpdateFlag: "N",
  ...over,
});

const props = {
  contracts: [[makeAgreement()]],
  licenses: [makeLicense()],
  vendors: [
    {
      entityId: "V001",
      longName: "Test Vendor",
      shortName: "TV",
      entityStatus: "Active",
    },
  ],
  datasets: [
    {
      datasetId: "DS001",
      shortName: "TD",
      licenseId: "L001",
      datasetStatus: "Active",
      entityId: "V001",
    },
  ],
  vendorId: "V001",
  entityName: "TV",
};

const renderPage = (override = {}) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <VendorData {...props} {...override} />
      </MemoryRouter>
    </AppProviders>
  );

// The agreement (outer) table renders its "More" menu button first; the
// licence sub-table rows (detail panel) render theirs after it.
const openAgreementMenu = async () => {
  const buttons = await screen.findAllByRole("button", { name: "More" });
  fireEvent.click(buttons[0]);
  return await screen.findByRole("menu");
};

const expandFirstRow = async () => {
  const buttons = await screen.findAllByRole("button", { name: "Expand" });
  fireEvent.click(buttons[0]);
  await screen.findByText("Licence Name");
};

const openLicenceMenu = async () => {
  await expandFirstRow();
  const buttons = await screen.findAllByRole("button", { name: "More" });
  fireEvent.click(buttons[buttons.length - 1]);
  return await screen.findByRole("menu");
};

describe("VendorData", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "tester");
    // grant RW on all master-data buttons so menus/buttons are enabled
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Masterdata",
          objectName: "Add Agreement Button and Agreement Pages",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Licence Button and Licence Pages",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Dataset Button and Dataset Pages",
          permission: "RW",
        },
      ])
    );
    mockDispatch.mockImplementation(() => Promise.resolve({ data: {} }));
    startUpdateAgreement.mockImplementation(() =>
      Promise.resolve({ data: { ok: true } })
    );
    startGetContracts.mockImplementation(() => ({ type: "GET_CONTRACTS" }));
    startAddLicense.mockImplementation((payload) => ({
      type: "ADD_LICENSE",
      payload,
    }));
    cleanResponse.mockImplementation(() => ({ type: "CLEAN_RESPONSE" }));
    clearDataset.mockImplementation(() => ({ type: "CLEAR_DATASET" }));
  });

  it("should render the main wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Agreement Name column header", () => {
    renderPage();
    expect(screen.getByText("Agreement Name")).toBeInTheDocument();
  });

  it("should render with empty contracts", () => {
    const { container } = renderPage({ contracts: [[]] });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with empty licenses", () => {
    const { container } = renderPage({ licenses: [] });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with empty vendors", () => {
    const { container } = renderPage({ vendors: [] });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should dispatch clearDataset and cleanResponse on mount", () => {
    renderPage();
    expect(clearDataset).toHaveBeenCalled();
    expect(cleanResponse).toHaveBeenCalled();
  });

  it("should only show agreements belonging to the vendor", async () => {
    renderPage({
      contracts: [
        [
          makeAgreement(),
          makeAgreement({
            agreementId: "AG999",
            agreementName: "OtherVendorAgreement",
            agreementEdmsEntiryId: "V999",
          }),
        ],
      ],
    });
    expect(await screen.findByText("TestAgreement")).toBeInTheDocument();
    expect(screen.queryByText("OtherVendorAgreement")).not.toBeInTheDocument();
  });

  it("should render a success chip for green statuses and camel chip otherwise", async () => {
    renderPage({
      contracts: [
        [
          makeAgreement(),
          makeAgreement({
            agreementId: "AG002",
            agreementName: "PendingAgreement",
            agreementStatus: "Pending",
            contractExpDate: "2025-06-30",
          }),
        ],
      ],
    });
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(await screen.findByText("Pending")).toBeInTheDocument();
  });

  it("should handle undefined licenses (zero licence count)", async () => {
    renderPage({ licenses: undefined });
    expect(await screen.findByText("TestAgreement")).toBeInTheDocument();
  });

  it("should render the agreement name as an edit link when update flag is N", async () => {
    renderPage();
    const link = await screen.findByText("TestAgreement");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/masterData/TV/modifyAgreement"
    );
    fireEvent.click(link);
    expect(localStorage.getItem("agId")).toBe("AG001");
    expect(localStorage.getItem("entityIdInfo")).toBe("V001");
  });

  it("should show the pending-change warning when name is clicked and flag is Y", async () => {
    renderPage({
      contracts: [[makeAgreement({ agreementUpdateFlag: "Y" })]],
    });
    fireEvent.click(await screen.findByText("TestAgreement"));
    expect(warning).toHaveBeenCalled();
    expect(localStorage.getItem("agId")).toBeNull();
  });

  it("should sort by expiration date when the header is clicked", async () => {
    renderPage({
      contracts: [
        [
          makeAgreement(),
          makeAgreement({
            agreementId: "AG002",
            agreementName: "SecondAgreement",
            agreementExpiryDate: "2024-05-01",
          }),
        ],
      ],
    });
    await screen.findByText("TestAgreement");
    fireEvent.click(screen.getByText("Expiration Date"));
    expect(await screen.findByText("SecondAgreement")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Expiration Date"));
    expect(await screen.findByText("TestAgreement")).toBeInTheDocument();
  });

  it("should store agId via the Edit menu action when editable", async () => {
    renderPage();
    const menu = await openAgreementMenu();
    const edit = within(menu).getByText("Edit");
    expect(edit.closest("a")).toHaveAttribute(
      "href",
      "/masterData/TV/modifyAgreement"
    );
    fireEvent.click(edit);
    expect(localStorage.getItem("agId")).toBe("AG001");
    expect(localStorage.getItem("entityIdInfo")).toBe("V001");
  });

  it("should warn from the Edit menu action when flag is Y", async () => {
    renderPage({
      contracts: [[makeAgreement({ agreementUpdateFlag: "Y", agreementStatus: "Inactive" })]],
    });
    const menu = await openAgreementMenu();
    fireEvent.click(within(menu).getByText("Edit"));
    expect(warning).toHaveBeenCalled();
  });

  it("should block agreement deactivation when licences are still active", async () => {
    renderPage();
    const menu = await openAgreementMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Unable to Deactivate Agreement!")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unable to Deactivate Agreement!")
      ).not.toBeInTheDocument()
    );
    expect(startUpdateAgreement).not.toHaveBeenCalled();
  });

  it("should deactivate the agreement after confirmation", async () => {
    renderPage({ licenses: [makeLicense({ licenseStatus: "Inactive" })] });
    const menu = await openAgreementMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Deactivate Agreement?")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(startUpdateAgreement).toHaveBeenCalled());
    const payload = startUpdateAgreement.mock.calls[0][0];
    expect(payload.agreementStatus).toBe("Deactivate");
    expect(payload.agreementUpdateFlag).toBe("Y");
    expect(payload.agreementLastUpdatedBy).toBe("tester");
    expect(payload).not.toHaveProperty("contractId");
    expect(payload).not.toHaveProperty("vendorId");
    expect(payload).not.toHaveProperty("licenses");
    expect(payload).not.toHaveProperty("taskStatus");
    expect(
      await screen.findByText(
        "Agreement deactivation request submitted successfully."
      )
    ).toBeInTheDocument();
    expect(startGetContracts).toHaveBeenCalled();
  });

  it("should not deactivate the agreement when confirmation is cancelled", async () => {
    renderPage({ licenses: [] });
    const menu = await openAgreementMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Deactivate Agreement?")).not.toBeInTheDocument()
    );
    expect(startUpdateAgreement).not.toHaveBeenCalled();
  });

  it("should warn instead of deactivating when flag is Y and status active", async () => {
    renderPage({
      contracts: [[makeAgreement({ agreementUpdateFlag: "Y" })]],
    });
    const menu = await openAgreementMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(warning).toHaveBeenCalled();
    expect(startUpdateAgreement).not.toHaveBeenCalled();
  });

  it("should disable Deactivate for inactive agreements", async () => {
    renderPage({
      contracts: [[makeAgreement({ agreementStatus: "Inactive" })]],
    });
    const menu = await openAgreementMenu();
    expect(
      within(menu).getByText("Deactivate").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should store the agreement record when Add Licence is clicked", async () => {
    renderPage();
    const addLicence = await screen.findByRole("link", { name: "Add Licence" });
    expect(addLicence).toHaveAttribute(
      "href",
      "/masterData/TestAgreement/addLicense"
    );
    fireEvent.click(addLicence);
    const stored = JSON.parse(localStorage.getItem("agRecord"));
    expect(stored.agreementId).toBe("AG001");
  });

  it("should disable Add Licence when the agreement is pending", async () => {
    renderPage({
      contracts: [[makeAgreement({ agreementStatus: "Pending" })]],
    });
    await screen.findByText("TestAgreement");
    const addLicence = screen.getByText("Add Licence").closest("a,button");
    expect(addLicence).toHaveAttribute("aria-disabled", "true");
  });

  it("should render the licence sub-table when a row is expanded", async () => {
    renderPage();
    await expandFirstRow();
    expect(screen.getByText("Licence ID")).toBeInTheDocument();
    const link = screen.getByText("TL");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/masterData/TL/modifylicense"
    );
    fireEvent.click(link);
    const stored = JSON.parse(localStorage.getItem("agRecord"));
    expect(stored.agreementId).toBe("AG001");
  });

  it("should warn when clicking a licence name with a pending change", async () => {
    renderPage({ licenses: [makeLicense({ licenseUpdateFlag: "Y" })] });
    await expandFirstRow();
    fireEvent.click(screen.getByText("TL"));
    expect(warning).toHaveBeenCalled();
  });

  it("should render licence status chips, including the warning variant", async () => {
    renderPage({
      licenses: [
        makeLicense(),
        makeLicense({
          licenseId: "L002",
          licenseShortName: "TL2",
          licenseStatus: "Pending",
        }),
        makeLicense({
          licenseId: "L003",
          licenseShortName: "TL3",
          licenseStatus: "",
        }),
      ],
    });
    await expandFirstRow();
    expect(screen.getByText("TL2")).toBeInTheDocument();
    expect(screen.getByText("TL3")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(1);
  });

  it("should carry the licence record in router state on the Edit menu item", async () => {
    renderPage();
    const menu = await openLicenceMenu();
    const edit = within(menu).getByText("Edit");
    expect(edit.closest("a")).toHaveAttribute(
      "href",
      "/masterData/TL/modifylicense"
    );
    fireEvent.click(edit);
    const stored = JSON.parse(localStorage.getItem("agRecord"));
    expect(stored.agreementId).toBe("AG001");
  });

  it("should warn from the licence Edit menu item when flag is Y", async () => {
    renderPage({ licenses: [makeLicense({ licenseUpdateFlag: "Y" })] });
    const menu = await openLicenceMenu();
    fireEvent.click(within(menu).getByText("Edit"));
    expect(warning).toHaveBeenCalled();
  });

  it("should block licence deactivation when datasets are still active", async () => {
    renderPage();
    const menu = await openLicenceMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Unable to deactivate Licence!")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unable to deactivate Licence!")
      ).not.toBeInTheDocument()
    );
    expect(startAddLicense).not.toHaveBeenCalled();
  });

  it("should deactivate the licence after confirmation", async () => {
    renderPage({ datasets: [] });
    const menu = await openLicenceMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(await screen.findByText("Deactivate Licence?")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(startAddLicense).toHaveBeenCalled());
    const payload = startAddLicense.mock.calls[0][0];
    expect(payload.licenseStatus).toBe("Deactivate");
    expect(payload.licenseUpdateFlag).toBe("Y");
    expect(payload.isUpdate).toBe(true);
    expect(payload.licenseLastUpdatedBy).toBe("tester");
    expect(payload).not.toHaveProperty("name");
    expect(payload).not.toHaveProperty("datasets");
    expect(
      await screen.findByText(
        "Licence deactivation request submitted successfully."
      )
    ).toBeInTheDocument();
  });

  it("should not deactivate the licence when confirmation is cancelled", async () => {
    renderPage({ datasets: [] });
    const menu = await openLicenceMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Deactivate Licence?")).not.toBeInTheDocument()
    );
    expect(startAddLicense).not.toHaveBeenCalled();
  });

  it("should warn on licence Deactivate when flag is Y and status active", async () => {
    renderPage({ licenses: [makeLicense({ licenseUpdateFlag: "Y" })] });
    const menu = await openLicenceMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(warning).toHaveBeenCalled();
    expect(startAddLicense).not.toHaveBeenCalled();
  });

  it("should disable licence Deactivate for inactive licences", async () => {
    renderPage({ licenses: [makeLicense({ licenseStatus: "Inactive" })] });
    const menu = await openLicenceMenu();
    expect(
      within(menu).getByText("Deactivate").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should navigate to add dataset with the licence in router state", async () => {
    renderPage();
    await expandFirstRow();
    fireEvent.click(screen.getByRole("button", { name: "Add Dataset" }));
    expect(mockHistoryPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/masterData/TL/dataset",
        state: expect.objectContaining({
          isUpdate: false,
          eid: "V001",
          licence: expect.objectContaining({ licenseId: "L001" }),
        }),
      })
    );
  });

  it("should disable Add Dataset for pending licences", async () => {
    renderPage({ licenses: [makeLicense({ licenseStatus: "Pending" })] });
    await expandFirstRow();
    expect(screen.getByRole("button", { name: "Add Dataset" })).toBeDisabled();
  });
});
