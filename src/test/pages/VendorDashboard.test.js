import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import VendorDashboard from "../../pages/vendorDashboard/VendorDashboard";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
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

const renderPage = (props) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <VendorDashboard dispatch={() => Promise.resolve({})} {...props} />
      </MemoryRouter>
    </AppProviders>
  );

describe("VendorDashboard", () => {
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
});
