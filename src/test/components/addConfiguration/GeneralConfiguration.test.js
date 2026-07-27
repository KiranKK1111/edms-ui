import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import GeneralConfiguration from "../../../components/addConfiguration/GeneralConfiguration";

// MUI's useMediaQuery (via the date picker) needs a full matchMedia mock.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const setupSelector = (configValues = {}) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const renderCfg = (props = {}) =>
  render(
    <GeneralConfiguration next={jest.fn()} passUpdates={jest.fn()} {...props} />
  );

describe("GeneralConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    sessionStorage.clear();
    sessionStorage.setItem("feedShortName", "TestFeed");
    setupSelector();
  });

  it("should render the section headers", () => {
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
    expect(screen.getByText("Proxy")).toBeInTheDocument();
    expect(screen.getByText("On-Demand Vendor request")).toBeInTheDocument();
  });

  it("should render core field labels", () => {
    renderCfg();
    expect(screen.getByText("Source processor")).toBeInTheDocument();
    expect(screen.getByText("Cron scheduler")).toBeInTheDocument();
    expect(screen.getByText("Storage location")).toBeInTheDocument();
  });

  it("should render the route type radio options", () => {
    renderCfg();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("One-time")).toBeInTheDocument();
  });

  it("should render with config values from redux", () => {
    setupSelector({
      startDate: "2025-01-01",
      expiryDate: "2025-12-31",
      routeType: "Scheduled",
      sourceProcessor: "sftpProcessor",
      proxyRequirement: "No",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
      cronScheduler: "0 0 * * *",
    });
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
  });

  it("should show proxy fields when proxyRequirement is Yes", () => {
    setupSelector({
      proxyRequirement: "Yes",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
    });
    renderCfg();
    expect(screen.getByText("Proxy hostname")).toBeInTheDocument();
    expect(screen.getByText("Proxy port")).toBeInTheDocument();
  });

  it("should render disabled fields when isUpdate is true", () => {
    const { container } = renderCfg({ isUpdate: true });
    expect(container.querySelectorAll("input[disabled]").length).toBeGreaterThanOrEqual(1);
  });

  it("should handle a feed short name with a space in sessionStorage", () => {
    sessionStorage.setItem("feedShortName", "Test Feed Name");
    setupSelector({});
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
  });
});
