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

  it("should map the DB licenseLimitations key onto the licenceLimitations field", () => {
    mockState = {
      license: {
        selectedLicense: [{ licenseLimitations: "Internal use only" }],
      },
      licenseReq: { support: [] },
    };
    renderLimitations();
    expect(screen.getByDisplayValue("Internal use only")).toBeInTheDocument();
  });

  it("should prefer the saved wizard draft over the DB record", () => {
    mockState = {
      license: {
        selectedLicense: [{ licenseLimitations: "From DB" }],
      },
      licenseReq: { support: [{ licenceLimitations: "Typed draft" }] },
    };
    renderLimitations();
    expect(screen.getByDisplayValue("Typed draft")).toBeInTheDocument();
  });

  it("should register a draft saver that persists limitations for Previous", () => {
    const { support } = require("../../../store/actions/licensedataAction");
    const registerDraftSaver = jest.fn();
    render(
      <AppProviders>
        <LicenseLimitations
          next={jest.fn()}
          registerDraftSaver={registerDraftSaver}
        />
      </AppProviders>
    );
    expect(registerDraftSaver).toHaveBeenCalledWith(expect.any(Function));
    mockDispatch.mockClear();
    support.mockClear();
    const saver = registerDraftSaver.mock.calls[0][0];
    saver();
    expect(mockDispatch).toHaveBeenCalled();
    expect(support).toHaveBeenCalledWith([
      expect.objectContaining({ licenceLimitations: expect.anything() }),
    ]);
  });
});
