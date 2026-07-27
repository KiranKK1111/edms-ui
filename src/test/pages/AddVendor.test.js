import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import AddVendor from "../../pages/addVendor/AddVendor";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockParams = {};
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => mockParams,
  useHistory: () => ({ push: jest.fn(), replace: jest.fn() }),
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock("../../store/actions/VendorActions", () => ({
  startAddVendor: jest.fn().mockReturnValue(Promise.resolve({})),
  startGetVendors: jest.fn().mockReturnValue(Promise.resolve({})),
  saveLocalData: jest.fn(),
}));

jest.mock("../../components/vendors/AddVendor/NewVendorForm", () => () => (
  <div data-testid="mock-new-vendor-form" />
));
jest.mock("../../components/vendors/AddVendor/ReviewSubmit", () => () => (
  <div data-testid="mock-review-submit" />
));

const defaultState = { vendor: { list: [] } };

const renderPage = () =>
  render(
    <AppProviders>
      <AddVendor history={{ push: jest.fn() }} />
    </AppProviders>
  );

describe("AddVendor", () => {
  beforeEach(() => {
    mockParams = {};
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((cb) => cb(defaultState));
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should render the entity form step", () => {
    renderPage();
    expect(screen.getByTestId("mock-new-vendor-form")).toBeInTheDocument();
  });

  it("should render the Next button on the first step", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
  });

  it("should render the Cancel button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  it("should render the Submit button disabled on the first step", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeDisabled();
  });

  it("should render in edit mode without crashing", () => {
    mockParams = { id: "V1" };
    renderPage();
    expect(screen.getByTestId("mock-new-vendor-form")).toBeInTheDocument();
  });
});
