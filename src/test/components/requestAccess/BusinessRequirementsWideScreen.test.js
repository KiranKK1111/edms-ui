import React from "react";
import { render, screen } from "@testing-library/react";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  withRouter: (component) => component,
}));

jest.mock("../../../store/actions/requestAccessActions", () => ({
  businessRequirements: jest.fn(),
}));

jest.mock("../../../components/requestAccess/validationsRequestAccess", () => {
  const actual = jest.requireActual(
    "../../../components/requestAccess/validationsRequestAccess"
  );
  return { __esModule: true, ...actual, checkValueExist: jest.fn() };
});
const {
  checkValueExist,
} = require("../../../components/requestAccess/validationsRequestAccess");

// The module reads window.matchMedia at import time to pick the licences label,
// so the wide-screen branch has to be primed BEFORE the component is required.
window.matchMedia = (query) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BusinessRequirements =
  require("../../../components/requestAccess/BusinessRequirements").default;

describe("BusinessRequirements on a wide screen", () => {
  beforeEach(() => {
    mockDispatch = jest.fn();
    checkValueExist.mockResolvedValue(false);
    localStorage.clear();
    localStorage.setItem("psid", "psid_user");
    mockState = {
      datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
      requestAccess: { businessRequirements: [] },
    };
  });

  it("should use the wide screen licences label", () => {
    render(
      <BusinessRequirements
        next={jest.fn()}
        formData={false}
        view="br"
        setSubscriptionFor={jest.fn()}
        setVendorRequest={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText("No. of Licences")).toBeInTheDocument();
    expect(screen.getAllByText("No. of Licences").length).toBeGreaterThan(0);
  });
});
