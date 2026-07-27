import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn(() => Promise.resolve({}));
let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockLocationState = {};
let mockHistory = { push: jest.fn(), replace: jest.fn() };
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => mockHistory,
  useLocation: () => ({ state: mockLocationState }),
  withRouter: (Component) => Component,
}));

// Mock the tab strip — DatasetPage owns the hero + action buttons only.
jest.mock("../../../components/dataset/DatasetTabs", () => () => (
  <div data-testid="dataset-tabs" />
));

jest.mock("../../../store/actions/requestAccessActions", () => ({
  clearStore: jest.fn(),
  unsubscribe: jest.fn(),
  getDataById: jest.fn(),
}));
jest.mock("../../../store/actions/DatasetPageActions", () => ({
  catalogueDetailsData: jest.fn(),
}));
jest.mock("../../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(),
}));

const mockIsButtonObject = jest.fn();
const mockGetPermissionObject = jest.fn();
jest.mock("../../../utils/accessButtonCheck", () => (...args) =>
  mockIsButtonObject(...args)
);
jest.mock("../../../utils/accessObject", () => (...args) =>
  mockGetPermissionObject(...args)
);
jest.mock("../../../utils/warningUtils", () => ({ warning: jest.fn() }));

import DatasetPage from "../../../components/dataset/DatasetPage";

const defaultReduxState = {
  datafeedInfo: {
    datafeedById: { datafeed: { longName: "Test Feed", feedStatus: "Active" } },
    loading: false,
  },
  dataFamily: { datasetById: {}, loading: false },
  requestAccess: { dataByIdResponse: { dataById: {} } },
  license: { licenseById: {}, loading: false },
  contract: { agreementById: {}, loading: false },
};

const dataWith = (overrides = {}) => ({
  data: {
    entityId: "E1",
    datasetId: "D1",
    dataFeedId: "F1",
    subscription: null,
    entityShortName: "Entity",
    dataFeedStatus: "Active",
    ...overrides,
  },
});

const renderPage = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <DatasetPage />
      </MemoryRouter>
    </AppProviders>
  );

describe("DatasetPage", () => {
  beforeEach(() => {
    mockDispatch = jest.fn(() => Promise.resolve({}));
    mockState = { ...defaultReduxState };
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    mockHistory = { push: jest.fn(), replace: jest.fn() };
    localStorage.clear();
    mockLocationState = dataWith();
  });

  it("should render the main container", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the dataset tabs", () => {
    renderPage();
    expect(screen.getByTestId("dataset-tabs")).toBeInTheDocument();
  });

  it("should render the datafeed long name in the hero", () => {
    renderPage();
    expect(screen.getAllByText("Test Feed").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Request Access when access is granted and there is no subscription", () => {
    mockLocationState = dataWith({ subscription: null });
    renderPage();
    expect(
      screen.getByRole("button", { name: "Request Access" })
    ).toBeInTheDocument();
  });

  it("should disable Request Access when the feed is not active", () => {
    mockLocationState = dataWith({ subscription: null, dataFeedStatus: "Pending" });
    renderPage();
    expect(screen.getByRole("button", { name: "Request Access" })).toBeDisabled();
  });

  it("should render Modify Access and Unsubscribe for an active subscription", () => {
    mockLocationState = dataWith({
      subscription: {
        subscriptionId: "S1",
        subscriptionStatus: "Active",
        subscriptionUpdateFlag: "N",
      },
    });
    renderPage();
    expect(
      screen.getByRole("button", { name: "Modify Access" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unsubscribe" })
    ).toBeInTheDocument();
  });

  it("should NOT render subscription buttons when access permission is null", () => {
    mockGetPermissionObject.mockReturnValue(null);
    mockLocationState = dataWith({ subscription: null });
    renderPage();
    expect(
      screen.queryByRole("button", { name: "Request Access" })
    ).not.toBeInTheDocument();
  });

  it("should render Request Access for a Guest role", () => {
    localStorage.setItem("guestRole", "Guest");
    mockGetPermissionObject.mockReturnValue(null);
    mockLocationState = dataWith({ subscription: null });
    renderPage();
    expect(
      screen.getByRole("button", { name: "Request Access" })
    ).toBeInTheDocument();
  });

  it("should navigate to the subscription page on Request Access click", () => {
    mockLocationState = dataWith({ subscription: null });
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Request Access" }));
    expect(mockHistory.push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/catalog/subscription" })
    );
  });
});
