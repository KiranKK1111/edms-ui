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

let mockPathname = "/another-route";
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({ pathname: mockPathname, state: null }),
}));

const buildState = () => ({
  licenseReq: {
    licenseDetailsRequirements: [{ expirationDate: "" }],
    support: [{}],
  },
});

const renderReview = (stepsdata = { licenseName: "" }) =>
  render(
    <AppProviders>
      <ReviewSubmit stepsdata={stepsdata} />
    </AppProviders>
  );

describe("ReviewSubmit (license)", () => {
  beforeEach(() => {
    mockState = buildState();
    mockPathname = "/another-route";
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

  it("should render every licence detail label", () => {
    renderReview();
    [
      "Licence ID",
      "Long Name",
      "Short Name",
      "Licence Type",
      "Data Procurement Type",
      "Licence Value",
      "Expiration Date",
      "No. of Licences Purchased",
      "No. of Licence Used",
      "Status",
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("should render the values held in the licence requirements slice", () => {
    mockState = {
      licenseReq: {
        licenseDetailsRequirements: [
          {
            licenceId: "LIC-42",
            longName: "Market Data Long",
            shortName: "MDL",
            licenceType: "Enterprise",
            dataProcurementType: "Subscription",
            licenceValue: "9000",
            NoOfLicencePurchased: 10,
            NoOfLicenceUsed: 3,
            status: "Active",
            expirationDate: "2025-06-15T10:00:00",
          },
        ],
        support: [{ licenceLimitations: "No redistribution allowed" }],
      },
    };
    renderReview();
    expect(screen.getByText("LIC-42")).toBeInTheDocument();
    expect(screen.getByText("Market Data Long")).toBeInTheDocument();
    expect(screen.getByText("MDL")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("9000")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("15 Jun, 2025")).toBeInTheDocument();
    expect(screen.getByText("No redistribution allowed")).toBeInTheDocument();
  });

  it("should hide No. of Licence Used while creating a licence", () => {
    mockPathname = "/addLicense/step/1";
    renderReview();
    expect(screen.getByText("Licence ID")).toBeInTheDocument();
    expect(screen.queryByText("No. of Licence Used")).not.toBeInTheDocument();
  });

  it("should show No. of Licence Used while updating a licence", () => {
    mockPathname = "/editLicense/step/1";
    renderReview();
    expect(screen.getByText("No. of Licence Used")).toBeInTheDocument();
  });

  it("should tolerate empty requirements and support slices", () => {
    mockState = {
      licenseReq: { licenseDetailsRequirements: [], support: [] },
    };
    const { container } = renderReview();
    expect(container.querySelector("#main")).toBeInTheDocument();
    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
    // no requirements record → nothing to format, the value cell stays blank
    const labels = container.querySelectorAll(".label-review");
    expect(labels.length).toBe(11);
  });

  it("should tolerate missing requirements and support slices entirely", () => {
    mockState = { licenseReq: {} };
    const { container } = renderReview();
    expect(container.querySelector("#main")).toBeInTheDocument();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });

  it("should render a blank expiration date when the record has none", () => {
    mockState = {
      licenseReq: {
        licenseDetailsRequirements: [{ licenceId: "LIC-1", expirationDate: null }],
        support: [{}],
      },
    };
    renderReview();
    expect(screen.getByText("LIC-1")).toBeInTheDocument();
    expect(screen.queryByText(/, 20\d\d$/)).not.toBeInTheDocument();
  });

  it("should read the step payload passed by the parent wizard", () => {
    const { container } = renderReview({
      licenseName: "Wizard licence",
      productDescription: "desc",
      licenseCost: "100",
      redistributionAllowed: "Yes",
      dataExpertEmailAddress: "expert@example.com",
    });
    expect(container.querySelector("#main")).toBeInTheDocument();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });
});
