import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import VendorData from "../../pages/masterData/VendorData";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const props = {
  contracts: [
    [
      {
        agreementId: "AG001",
        agreementName: "TestAgreement",
        agreementEdmsEntiryId: "V001",
        agreementType: "Vendor Contract",
        agreementStartDate: "2024-01-01",
        agreementExpiryDate: "2025-12-31",
        agreementStatus: "Active",
        agreementUpdateFlag: "N",
      },
    ],
  ],
  licenses: [
    {
      licenseId: "L001",
      licenseLongName: "Test License",
      licenseShortName: "TL",
      licenseAgreementId: "AG001",
      licenseExpiryDate: "2025-12-31",
      licenseStatus: "Active",
      licenseUpdateFlag: "N",
    },
  ],
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

describe("VendorData", () => {
  beforeEach(() => {
    localStorage.clear();
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
});
