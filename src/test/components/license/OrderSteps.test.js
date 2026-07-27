import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import OrderSteps from "../../../components/license/step/OrderSteps";
import {
  setSelectedLicense,
} from "../../../store/actions/licenseAction";
import { upload } from "../../../store/actions/licensedataAction";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockParams = { id: "123" };
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useHistory: () => ({ push: jest.fn() }),
}));

// Step content children are exercised by their own suites. The LicenseDetails
// mock captures the props it receives so the handler callbacks can be driven.
const mockDetailsProps = {};
jest.mock(
  "../../../components/license/licenseDetails/LicenseDetails",
  () => (props) => {
    Object.assign(mockDetailsProps, props);
    return <div data-testid="license-details-step" />;
  }
);
jest.mock("../../../components/license/licenseLimitations/LicenseLimitations", () => () => (
  <div data-testid="license-limitations-step" />
));
jest.mock("../../../components/license/reviewSubmit/ReviewSubmit", () => () => (
  <div data-testid="review-submit-step" />
));

jest.mock("../../../store/actions/contractAction", () => ({
  startGetContracts: jest.fn(),
}));
jest.mock("../../../store/actions/licenseAction", () => ({
  setSelectedLicense: jest.fn(),
  startGetLicenses: jest.fn(),
}));
jest.mock("../../../store/actions/licensedataAction", () => ({
  upload: jest.fn(),
}));

const license = { licenseList: [[]], selectedLicense: [{}] };
const contract = {
  data: [
    [
      { agreementStatus: "active", contractName: "TestContract", contractId: "C001", contractStatus: "Active" },
      { agreementStatus: "inactive", contractName: "OtherContract", contractId: "C002", contractStatus: "Inactive" },
    ],
  ],
  selectedContract: [],
  contractDetails: [],
};
const licenseReq = { licenseDetailsRequirements: [] };

const defaultProps = {
  current: 0,
  formData: false,
  next: jest.fn(),
  onStepsReady: jest.fn(),
  isFormValid: jest.fn(),
  savedData: jest.fn(),
};

const renderSteps = (props = {}) =>
  render(
    <AppProviders>
      <OrderSteps {...defaultProps} {...props} />
    </AppProviders>
  );

describe("OrderSteps (controlled body)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockDetailsProps).forEach((k) => delete mockDetailsProps[k]);
    mockParams = { id: "123" };
    mockState = { license, contract, licenseReq };
  });

  it("should render the main container", () => {
    const { container } = renderSteps();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("reports its step list to the controller via onStepsReady", () => {
    renderSteps();
    expect(defaultProps.onStepsReady).toHaveBeenCalledWith([
      { key: "Licence Details", title: "Licence Details" },
      { key: "Licence Limitations", title: "Licence Limitations" },
      { key: "Review & Submit", title: "Review & Submit" },
    ]);
  });

  it("renders only the current step's content (step 0)", () => {
    renderSteps({ current: 0 });
    expect(screen.getByTestId("license-details-step")).toBeInTheDocument();
    expect(
      screen.queryByTestId("license-limitations-step")
    ).not.toBeInTheDocument();
  });

  it("renders the limitations step content when current is 1", () => {
    renderSteps({ current: 1 });
    expect(screen.getByTestId("license-limitations-step")).toBeInTheDocument();
  });

  it("renders the review step content when current is 2", () => {
    renderSteps({ current: 2 });
    expect(screen.getByTestId("review-submit-step")).toBeInTheDocument();
  });

  it("does NOT render its own stepper navigation buttons", () => {
    renderSteps();
    expect(
      screen.queryByRole("button", { name: "Next" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Previous" })
    ).not.toBeInTheDocument();
  });

  it("should call the isFormValid and savedData props", () => {
    renderSteps();
    expect(defaultProps.isFormValid).toHaveBeenCalled();
    expect(defaultProps.savedData).toHaveBeenCalled();
  });

  it("reports isFormValid=false on the first step and true on the review step", () => {
    renderSteps({ current: 0 });
    expect(defaultProps.isFormValid).toHaveBeenCalledWith(false);
    jest.clearAllMocks();
    renderSteps({ current: 2 });
    expect(defaultProps.isFormValid).toHaveBeenCalledWith(true);
  });

  it("marks the snapshot as an update when the route carries a licence id", () => {
    renderSteps();
    expect(defaultProps.savedData).toHaveBeenCalledWith(
      expect.objectContaining({ isUpdated: true }),
      true
    );
  });

  it("marks the snapshot as a create when there is no licence id in the route", () => {
    mockParams = {};
    renderSteps();
    expect(defaultProps.savedData).toHaveBeenCalledWith(
      expect.objectContaining({ isUpdated: false }),
      true
    );
  });

  it("should render with a contractId in params and clear the selected licence", () => {
    mockParams = { contractId: "C001" };
    const { container } = renderSteps();
    expect(container.querySelector("#main")).toBeInTheDocument();
    expect(setSelectedLicense).toHaveBeenCalledWith([]);
  });

  it("falls back to matching the licence by short name and splits its technical documents", () => {
    mockState = {
      license: {
        licenseList: [
          [
            {
              licenseId: "L-999",
              licenseShortName: "123",
              licenseName: "Lic1",
              technicalDocument: "doc1.pdf,doc2.pdf",
            },
          ],
        ],
        selectedLicense: [],
      },
      contract,
      licenseReq,
    };
    renderSteps();
    expect(setSelectedLicense).toHaveBeenCalledWith([
      expect.objectContaining({ licenseShortName: "123" }),
    ]);
    expect(upload).toHaveBeenCalledWith([
      { name: "doc1.pdf" },
      { name: "doc2.pdf" },
    ]);
    // the matched licence is merged into the wizard state snapshot
    expect(defaultProps.savedData).toHaveBeenCalledWith(
      expect.objectContaining({ licenseName: "Lic1" }),
      true
    );
  });

  it("matches the licence by id and resets uploads when it has no technical document", () => {
    mockState = {
      license: {
        licenseList: [[{ licenseId: "123", licenseName: "Lic2" }]],
        selectedLicense: [],
      },
      contract,
      licenseReq,
    };
    renderSteps();
    expect(upload).toHaveBeenCalledWith([]);
    expect(defaultProps.savedData).toHaveBeenCalledWith(
      expect.objectContaining({ licenseName: "Lic2" }),
      true
    );
  });

  it("opens the audit log dialog when modalStatus is true and closes it via OK", async () => {
    renderSteps({ modalStatus: true });
    expect(screen.getByText("Audit Log")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
    });
    await waitFor(() =>
      expect(screen.queryByText("Audit Log")).not.toBeInTheDocument()
    );
  });

  it("closes the audit log dialog via the backdrop escape key", async () => {
    renderSteps({ modalStatus: true });
    const dialog = screen.getByRole("dialog");
    await act(async () => {
      fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    });
    await waitFor(() =>
      expect(screen.queryByText("Audit Log")).not.toBeInTheDocument()
    );
  });

  it("updates state and flags the name change via handleChange", async () => {
    renderSteps();
    await act(async () => {
      mockDetailsProps.handleChange({
        target: { name: "licenseName", value: "My Licence" },
      });
    });
    expect(mockDetailsProps.licenseName).toBe("My Licence");
    expect(mockDetailsProps.isLicenseNameChanged).toBe(true);
    expect(defaultProps.savedData).toHaveBeenCalledWith(
      expect.objectContaining({ licenseName: "My Licence" }),
      true
    );
  });

  it("updates other fields via handleChange without flagging the name change", async () => {
    renderSteps();
    await act(async () => {
      mockDetailsProps.handleChange({
        target: { name: "productDescription", value: "Some product" },
      });
    });
    expect(mockDetailsProps.productDescription).toBe("Some product");
    expect(mockDetailsProps.isLicenseNameChanged).toBe(false);
  });

  it("sets the contract owner via handledropChange", async () => {
    renderSteps();
    await act(async () => {
      mockDetailsProps.handledropChange("Jane Owner");
    });
    expect(mockDetailsProps.contractOwner).toBe("Jane Owner");
  });

  it("resolves contract id and status via handleContractChange", async () => {
    renderSteps();
    await act(async () => {
      mockDetailsProps.handleContractChange("TestContract");
    });
    expect(mockDetailsProps.contractId).toBe("C001");
    expect(mockDetailsProps.contractName).toBe("TestContract");
    expect(mockDetailsProps.licenseStatus).toBe("Active");
  });

  it("updates licence type, cost, data coverage and status via their handlers", async () => {
    renderSteps();
    await act(async () => {
      mockDetailsProps.handleLicenseType("Enterprise");
    });
    expect(mockDetailsProps.licenseType).toBe("Enterprise");
    await act(async () => {
      mockDetailsProps.handleLicenseCost(5000);
    });
    expect(mockDetailsProps.licenseCost).toBe(5000);
    await act(async () => {
      mockDetailsProps.handleDataCoverage("Global equities");
    });
    expect(mockDetailsProps.dataCoverage).toBe("Global equities");
    await act(async () => {
      mockDetailsProps.handleStatusChange("Approved");
    });
    expect(mockDetailsProps.licenseStatus).toBe("Approved");
  });
});
