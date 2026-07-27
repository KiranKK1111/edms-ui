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
import VendorDashboard from "../../pages/vendorDashboard/VendorDashboard";
import {
  startGetVendors,
  startDeleteVendor,
} from "../../store/actions/VendorActions";
import { startGetContracts } from "../../store/actions/contractAction";
import { startGetLicenses } from "../../store/actions/licenseAction";
import imperativeConfirm from "../../design-system/imperativeConfirm";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

// `connect` is stubbed out, so the module's mapStateToProps is captured here to
// keep it directly assertable. `var` is required: connect() runs while the
// component module is imported, before any `const` in this file is initialised.
var mockMapStateToProps;
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: (mapStateToProps) => (Component) => {
    mockMapStateToProps = mockMapStateToProps || [];
    mockMapStateToProps.push(mapStateToProps);
    return Component;
  },
}));

jest.mock("../../pages/masterData/VendorData", () => () => (
  <div data-testid="mock-vendor-data" />
));

jest.mock("../../store/actions/VendorActions", () => ({
  startGetVendors: jest.fn(),
  startDeleteVendor: jest.fn(),
}));
jest.mock("../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn(),
}));
jest.mock("../../store/actions/licenseAction", () => ({
  startGetLicenses: jest.fn(),
}));
jest.mock("../../design-system/imperativeConfirm", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const approvedVendor = {
  entityId: "V1",
  longName: "Vendor One",
  shortName: "V1",
  entityType: "External",
  website: "example.com",
  entityStatus: "Active",
  entityDescription: "Test vendor",
  vendorId: "V1",
  taskStatus: "Approved",
};

const pendingVendor = {
  entityId: "V2",
  longName: "Vendor Two",
  shortName: "V2",
  entityType: "Internal",
  website: "pending.com",
  entityStatus: "Pending",
  entityDescription: "Pending vendor",
  vendorId: "V2",
  taskStatus: "Pending",
};

const secondVendor = {
  entityId: "V3",
  longName: "Vendor Three",
  shortName: "V3",
  entityType: "External",
  website: "three.com",
  entityStatus: "Active",
  entityDescription: "Third vendor",
  vendorId: "V3",
  taskStatus: "Approved",
};

const rejectedVendor = {
  ...approvedVendor,
  entityId: "V4",
  vendorId: "V4",
  shortName: "V4",
  longName: "Vendor Four",
  entityStatus: "Rejected",
  taskStatus: "Rejected",
};

const renderPage = (props) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <VendorDashboard dispatch={() => Promise.resolve({})} {...props} />
      </MemoryRouter>
    </AppProviders>
  );

/* Opens the "Manage" overflow menu and clicks the Delete entry. */
const clickDelete = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /Manage/i }));
  const menu = await screen.findByRole("menu");
  fireEvent.click(within(menu).getByText("Delete"));
};

describe("VendorDashboard", () => {
  beforeEach(() => {
    // CRA sets resetMocks:true — install every implementation here.
    // Only the delete thunk is awaited by the component; the fetch effects
    // return their dispatch result straight out of useEffect, so those must
    // stay undefined or React treats the value as a cleanup function.
    mockDispatch.mockImplementation((action) =>
      action && action.type === "DELETE_VENDOR" ? Promise.resolve({}) : undefined
    );
    startGetVendors.mockImplementation(() => ({ type: "GET_VENDORS" }));
    startGetContracts.mockImplementation(() => ({ type: "GET_CONTRACTS" }));
    startGetLicenses.mockImplementation(() => ({ type: "GET_LICENSES" }));
    startDeleteVendor.mockImplementation((payload) => ({
      type: "DELETE_VENDOR",
      payload,
    }));
    imperativeConfirm.mockResolvedValue(false);
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("should render the dashboard-main container", () => {
    const { container } = renderPage({
      vendors: [approvedVendor],
      contracts: [{ vendorId: "V1", contractId: "C1" }],
      licenses: [],
    });
    expect(container.querySelector(".dashboard-main")).toBeInTheDocument();
  });

  it("should render Entity Details for a selected vendor", () => {
    renderPage({
      vendors: [approvedVendor],
      contracts: [{ vendorId: "V1", contractId: "C1" }],
      licenses: [],
    });
    expect(screen.getByText("Entity Details")).toBeInTheDocument();
  });

  it("should render VendorData when contracts exist", () => {
    renderPage({
      vendors: [approvedVendor],
      contracts: [{ vendorId: "V1", contractId: "C1" }],
      licenses: [],
    });
    expect(screen.getByTestId("mock-vendor-data")).toBeInTheDocument();
  });

  it("should render a warning alert for a pending vendor", () => {
    renderPage({
      vendors: [pendingVendor],
      contracts: [{ vendorId: "V2", contractId: "C1" }],
      licenses: [],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should render empty state when there are no vendors", () => {
    renderPage({ vendors: [], contracts: [], licenses: [] });
    expect(screen.getByText("There are no active vendors")).toBeInTheDocument();
  });

  it("should fetch vendors, contracts and licences on mount", async () => {
    renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
    await waitFor(() => expect(startGetContracts).toHaveBeenCalled());
    expect(startGetLicenses).toHaveBeenCalled();
    expect(startGetVendors).toHaveBeenCalled();
  });

  /* ---------------------------------------------------------------- *
   * Side navigation selection                                         *
   * ---------------------------------------------------------------- */
  describe("vendor selection", () => {
    it("should select the first vendor when no key has been persisted", async () => {
      renderPage({
        vendors: [approvedVendor, secondVendor],
        contracts: [],
        licenses: [],
      });
      expect(await screen.findByText(/Vendor One/)).toBeInTheDocument();
    });

    it("should switch vendors and persist the selection in sessionStorage", async () => {
      renderPage({
        vendors: [approvedVendor, secondVendor],
        contracts: [],
        licenses: [],
      });
      await screen.findByText(/Vendor One/);

      fireEvent.click(screen.getByRole("button", { name: "V3" }));

      expect(await screen.findByText(/Vendor Three/)).toBeInTheDocument();
      expect(sessionStorage.getItem("dashKey")).toBe("1");
      expect(sessionStorage.getItem("vendorid")).toBe("V3");
    });

    it("should restore the persisted vendor on reload", async () => {
      sessionStorage.setItem("dashKey", "1");
      sessionStorage.setItem("vendorid", "V3");
      renderPage({
        vendors: [approvedVendor, secondVendor],
        contracts: [],
        licenses: [],
      });
      expect(await screen.findByText(/Vendor Three/)).toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------- *
   * Status driven button state                                        *
   * ---------------------------------------------------------------- */
  describe("status gating", () => {
    it("should disable Manage and Add Contract for a pending vendor", async () => {
      renderPage({ vendors: [pendingVendor], contracts: [], licenses: [] });
      await screen.findByText(/Vendor Two/);
      expect(screen.getByRole("button", { name: /Manage/i })).toBeDisabled();
      expect(
        screen.getByRole("link", { name: /Add Contract/i })
      ).toHaveAttribute("aria-disabled", "true");
    });

    it("should allow Manage but block Add Contract for a rejected vendor", async () => {
      renderPage({ vendors: [rejectedVendor], contracts: [], licenses: [] });
      await screen.findByText(/Vendor Four/);
      expect(screen.getByRole("button", { name: /Manage/i })).toBeEnabled();
      expect(
        screen.getByRole("link", { name: /Add Contract/i })
      ).toHaveAttribute("aria-disabled", "true");
    });

    it("should dismiss the pending review banner", async () => {
      renderPage({ vendors: [pendingVendor], contracts: [], licenses: [] });
      const alert = await screen.findByRole("alert");
      fireEvent.click(within(alert).getByRole("button", { name: /close/i }));
      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
      );
    });

    it("should render an Active chip for an active vendor", async () => {
      renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
      expect(await screen.findByText("Active")).toBeInTheDocument();
    });
  });

  /* ---------------------------------------------------------------- *
   * Delete vendor                                                     *
   * ---------------------------------------------------------------- */
  describe("delete vendor", () => {
    it("should submit the delete request when the vendor has no contracts", async () => {
      localStorage.setItem("psid", "1234567");
      imperativeConfirm.mockResolvedValue(true);
      renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
      await screen.findByText(/Vendor One/);

      await clickDelete();

      await waitFor(() => expect(startDeleteVendor).toHaveBeenCalled());
      expect(startDeleteVendor).toHaveBeenCalledWith(
        expect.objectContaining({ vendorId: "V1", createdBy: "1234567" })
      );
      expect(imperativeConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Delete Vendor ?",
          content: expect.stringContaining("submitted for approval"),
        })
      );
      await waitFor(() =>
        expect(sessionStorage.getItem("vendorid")).toBeNull()
      );
    });

    it("should refuse the delete while contracts are still attached", async () => {
      imperativeConfirm.mockResolvedValue(true);
      renderPage({
        vendors: [approvedVendor],
        contracts: [{ vendorId: "V1", contractId: "C1" }],
        licenses: [],
      });
      await screen.findByText(/Vendor One/);

      await clickDelete();

      await waitFor(() => expect(imperativeConfirm).toHaveBeenCalled());
      expect(imperativeConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining("You cannot complete this action"),
        })
      );
      expect(startDeleteVendor).not.toHaveBeenCalled();
    });

    it("should do nothing when the confirmation is cancelled", async () => {
      imperativeConfirm.mockResolvedValue(false);
      renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
      await screen.findByText(/Vendor One/);

      await clickDelete();

      await waitFor(() => expect(imperativeConfirm).toHaveBeenCalled());
      expect(startDeleteVendor).not.toHaveBeenCalled();
    });

    it("should swallow a failing delete request", async () => {
      imperativeConfirm.mockResolvedValue(true);
      mockDispatch.mockImplementation((action) =>
        action && action.type === "DELETE_VENDOR"
          ? Promise.reject(new Error("delete failed"))
          : undefined
      );
      renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
      await screen.findByText(/Vendor One/);

      await clickDelete();

      await waitFor(() => expect(startDeleteVendor).toHaveBeenCalled());
      expect(sessionStorage.getItem("vendorid")).toBeNull();
    });
  });

  /* ---------------------------------------------------------------- *
   * Contract panel variants                                           *
   * ---------------------------------------------------------------- */
  describe("contract panel", () => {
    it("should show the no-contracts message for an empty contract list", async () => {
      renderPage({ vendors: [approvedVendor], contracts: [], licenses: [] });
      expect(await screen.findByText("No contracts")).toBeInTheDocument();
    });

    it("should offer Add Contract in the empty state for an approved vendor", async () => {
      renderPage({
        vendors: [approvedVendor],
        contracts: null,
        licenses: [],
      });
      expect(
        await screen.findByText("There are no contracts for this vendor")
      ).toBeInTheDocument();
      // one link in the panel header, one inside the empty state
      expect(
        screen.getAllByRole("link", { name: /Add Contract/i })
      ).toHaveLength(2);
    });

    it("should disable Add Contract in the empty state for a pending vendor", async () => {
      renderPage({ vendors: [pendingVendor], contracts: null, licenses: [] });
      await screen.findByText("There are no contracts for this vendor");
      const buttons = screen.getAllByRole("button", { name: /Add Contract/i });
      expect(buttons.some((b) => b.disabled)).toBe(true);
    });
  });

  it("should map contracts, licences and vendors from the store", () => {
    expect(mockMapStateToProps).toHaveLength(1);
    expect(
      mockMapStateToProps[0]({
        contract: { data: [[{ contractId: "C1" }]] },
        license: { data: [{ licenseId: "L1" }] },
        vendor: { list: [approvedVendor] },
      })
    ).toEqual({
      contracts: [{ contractId: "C1" }],
      licenses: [{ licenseId: "L1" }],
      vendors: [approvedVendor],
    });
  });
});
