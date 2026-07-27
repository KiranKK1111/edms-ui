import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import LicenseLimitations from "../../../components/license/licenseLimitations/LicenseLimitations";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const location = { pathname: "/another-route", state: null };
  const params = {};
  return {
    ...actual,
    useLocation: () => location,
    useParams: () => params,
  };
});

jest.mock("../../../store/actions/licensedataAction", () => ({
  support: jest.fn(),
}));

const buildState = () => ({
  license: { selectedLicense: "" },
  licenseReq: { support: [] },
});

const renderLimitations = () =>
  render(
    <AppProviders>
      <LicenseLimitations next={jest.fn()} />
    </AppProviders>
  );

describe("LicenseLimitations", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the Licence Limitations field", () => {
    renderLimitations();
    expect(
      screen.getAllByText("Licence Limitations").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render a textarea input", () => {
    const { container } = renderLimitations();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });
});
