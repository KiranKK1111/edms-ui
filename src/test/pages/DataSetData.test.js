import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import DataSetData from "../../pages/masterData/DataSetData";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const datasetsInfo = [
  {
    datasetId: "DS001",
    longName: "Test Dataset",
    shortName: "TD",
    licenseId: "L001",
    datasetStatus: "Active",
    entityId: "E001",
    datasetUpdateFlag: "N",
  },
  {
    datasetId: "DS002",
    longName: "Pending Dataset",
    shortName: "PD",
    licenseId: "L001",
    datasetStatus: "Pending",
    entityId: "E001",
    datasetUpdateFlag: "Y",
  },
];

const datafeedsInfo = [
  {
    feedId: "F001",
    shortName: "TF",
    datasetId: "DS001",
    feedStatus: "Active",
    feedUpdateFlag: "N",
    isEnabled: true,
  },
];

const licenses = [
  {
    licenseId: "L001",
    licenseLongName: "License One",
    licenseShortName: "L1",
    licenseStatus: "Active",
    licenseUpdateFlag: "N",
  },
];

const defaultProps = {
  datasetsInfo,
  datafeedsInfo,
  licenses,
  handleTabClick: jest.fn(),
  dataSetEntityId: "E001",
  vendorId: "V001",
  disableAllButtons: false,
};

const state = { allSubscriptionList: { allSubscriptionList: [] } };

const renderPage = (props = {}) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <DataSetData {...defaultProps} {...props} />
      </MemoryRouter>
    </AppProviders>
  );

describe("DataSetData", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "user1");
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the main wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Dataset Name column header", () => {
    renderPage();
    expect(screen.getByText("Dataset Name")).toBeInTheDocument();
  });

  it("should render with empty datasetsInfo", () => {
    const { container } = renderPage({ datasetsInfo: [], datafeedsInfo: [] });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with undefined licenses", () => {
    const { container } = renderPage({ licenses: undefined });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });
});
