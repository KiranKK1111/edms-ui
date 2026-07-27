import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContractApproveRejectView, {
  conVertDateArrayToDate,
} from "../../../components/addContract/contractApproveRejectView";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockMyTaskData = {
  taskListId: "T1",
  taskListObjectAction: "Create",
  taskListTaskStatus: "Pending",
  taskListObject: "Contract",
  taskListCreatedBy: "other_user",
};
const mockHistoryPush = jest.fn();
const mockHistory = {
  push: mockHistoryPush,
  location: { state: { myTaskData: mockMyTaskData } },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "C1" }),
  useHistory: () => mockHistory,
}));

jest.mock("../../../store/actions/contractAction", () => ({
  getContractDetailsByChangeRequestId: jest.fn(
    (x) => "getContractDetailsByChangeRequestId_" + x
  ),
  getContractDetailsById: jest.fn((x) => "getContractDetailsById_" + x),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => {
  const fn = jest.fn().mockReturnValue(false);
  return fn;
});

const isAcessDisabled = require("../../../utils/accessMyTask");

const contractDetails = {
  agreementExpiryDate: null,
  agreementPartyId: "P1",
  agreementReferenceText: "Ref Text",
  agreementScbAgreementMgrBankId: "B1",
  agreementSignedOn: "2023-01-15",
  agreementStartDate: "2023-01-01",
  agreementStatus: "Active",
  agreementId: "A1",
  agreementLimitations: "Some limitations",
  agreementLink: "https://link.com",
  agreementName: "Test Agreement",
  agreementType: "Contract",
  agreementValue: "100",
  agreementReferenceId: "R1",
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: { ...mockMyTaskData },
    },
  },
  history: { push: jest.fn() },
};

const renderView = (props = baseMockProps) =>
  render(
    <MemoryRouter>
      <ContractApproveRejectView {...props} />
    </MemoryRouter>
  );

describe("ContractApproveRejectView", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockHistoryPush.mockClear();
    isAcessDisabled.mockReturnValue(false);
    mockDispatch.mockReturnValue(Promise.resolve({ data: { success: true } }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    mockHistory.location = { state: { myTaskData: mockMyTaskData } };
    mockState = {
      contract: { contractDetails: { ...contractDetails } },
      vendor: [],
    };
  });

  it("should render without crashing", () => {
    const { container } = renderView();
    expect(container).toBeInTheDocument();
  });

  it("should render the Agreement Details breadcrumb / header", () => {
    renderView();
    expect(screen.getAllByText("Agreement Details").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the agreement name", () => {
    renderView();
    expect(screen.getAllByText("Test Agreement").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Agreement Limitations section", () => {
    renderView();
    expect(screen.getByText("Agreement Limitations")).toBeInTheDocument();
  });

  it("should render the Agreement Document section", () => {
    renderView();
    expect(screen.getByText("Agreement Document")).toBeInTheDocument();
  });

  it("should render Approve and Reject actions", () => {
    renderView();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should render multiple label-review elements", () => {
    const { container } = renderView();
    expect(container.querySelectorAll(".label-review").length).toBeGreaterThan(5);
  });

  // ---- conVertDateArrayToDate utility ----
  it("should convert date array to formatted date", () => {
    const result = conVertDateArrayToDate([2023, 1, 15]);
    expect(result).toBeDefined();
  });

  it("should return undefined for null dateArray", () => {
    expect(conVertDateArrayToDate(null)).toBeUndefined();
  });

  it("should return undefined for undefined dateArray", () => {
    expect(conVertDateArrayToDate(undefined)).toBeUndefined();
  });

  // ---- Render with different actions ----
  it("should render with Update action props", () => {
    const updateMyTaskData = { ...mockMyTaskData, taskListObjectAction: "Update" };
    mockHistory.location = { state: { myTaskData: updateMyTaskData } };
    const { container } = renderView({
      ...baseMockProps,
      location: { state: { myTaskData: updateMyTaskData } },
    });
    expect(container).toBeInTheDocument();
  });

  it("should render with Deactivate action props", () => {
    const deactivateMyTaskData = {
      ...mockMyTaskData,
      taskListObjectAction: "Deactivate",
    };
    mockHistory.location = { state: { myTaskData: deactivateMyTaskData } };
    const { container } = renderView({
      ...baseMockProps,
      location: { state: { myTaskData: deactivateMyTaskData } },
    });
    expect(container).toBeInTheDocument();
  });

  // ---- Empty / null contract data ----
  it("should show fallback when contract data is empty", () => {
    mockState = { contract: { contractDetails: {} }, vendor: [] };
    renderView();
    expect(
      screen.getByText("Agreement details not available")
    ).toBeInTheDocument();
  });

  it("should handle null contract gracefully", () => {
    mockState = { contract: null, vendor: [] };
    const { container } = renderView();
    expect(container).toBeInTheDocument();
  });

  // ---- actionsDisabled behaviour ----
  it("should disable actions when taskListTaskStatus is Approved", () => {
    const approvedMyTaskData = {
      ...mockMyTaskData,
      taskListTaskStatus: "Approved",
    };
    mockHistory.location = { state: { myTaskData: approvedMyTaskData } };
    renderView({
      ...baseMockProps,
      location: { state: { myTaskData: approvedMyTaskData } },
    });
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should not disable actions when Pending", () => {
    renderView();
    expect(screen.getByRole("button", { name: "Approve" })).not.toBeDisabled();
  });

  it("should disable actions when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    renderView();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should disable actions when taskListCreatedBy matches psid", () => {
    mockHistory.location = {
      state: {
        myTaskData: { ...mockMyTaskData, taskListCreatedBy: "current_user" },
      },
    };
    renderView();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });
});
