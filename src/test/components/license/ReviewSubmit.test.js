import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import ReviewSubmit from "../../../components/license/reviewSubmit/ReviewSubmit";

jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({ pathname: "/another-route", state: null }),
}));

const buildState = () => ({
  licenseReq: {
    licenseDetailsRequirements: [{ expirationDate: "" }],
    support: [{}],
  },
});

const renderReview = () =>
  render(
    <AppProviders>
      <ReviewSubmit stepsdata={{ licenseName: "" }} />
    </AppProviders>
  );

describe("ReviewSubmit (license)", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the main container", () => {
    const { container } = renderReview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Licence Details section", () => {
    renderReview();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });

  it("should render the Licence Limitations section", () => {
    renderReview();
    expect(
      screen.getAllByText("Licence Limitations").length
    ).toBeGreaterThanOrEqual(1);
  });
});
