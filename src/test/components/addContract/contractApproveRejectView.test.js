import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
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
const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const {
  getContractDetailsById,
  getContractDetailsByChangeRequestId,
} = require("../../../store/actions/contractAction");

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
    // CRA sets resetMocks:true — re-install every implementation here.
    updateTaskAction.mockImplementation((payload) => ({
      type: "UPDATE_TASK",
      payload,
    }));
    getContractDetailsById.mockImplementation((id) => ({
      type: "GET_CONTRACT_BY_ID",
      id,
    }));
    getContractDetailsByChangeRequestId.mockImplementation((id) => ({
      type: "GET_CONTRACT_BY_CR_ID",
      id,
    }));
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

  // ---- data loading ----
  it("should load the agreement by id for a Create task", () => {
    renderView();
    expect(getContractDetailsById).toHaveBeenCalledWith("C1");
    expect(getContractDetailsByChangeRequestId).not.toHaveBeenCalled();
  });

  it("should load the change-request snapshot for an Update task", () => {
    const updateMyTaskData = {
      ...mockMyTaskData,
      taskListObjectAction: "Update",
    };
    mockHistory.location = { state: { myTaskData: updateMyTaskData } };
    renderView({
      ...baseMockProps,
      location: { state: { myTaskData: updateMyTaskData } },
    });
    expect(getContractDetailsByChangeRequestId).toHaveBeenCalledWith("C1");
    expect(getContractDetailsById).not.toHaveBeenCalled();
  });

  it("should load the change-request snapshot for a Deactivate task", () => {
    const deactivateMyTaskData = {
      ...mockMyTaskData,
      taskListObjectAction: "Deactivate",
    };
    mockHistory.location = { state: { myTaskData: deactivateMyTaskData } };
    renderView({
      ...baseMockProps,
      location: { state: { myTaskData: deactivateMyTaskData } },
    });
    expect(getContractDetailsByChangeRequestId).toHaveBeenCalledWith("C1");
  });

  // ---- read-only detail binding ----
  it("should bind the agreement fields from the store", () => {
    renderView();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("Ref Text")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Some limitations")).toBeInTheDocument();
    expect(screen.getByText("https://link.com")).toBeInTheDocument();
  });

  it("should render No Expiry when the expiry date is null", () => {
    renderView();
    expect(screen.getByText("No Expiry")).toBeInTheDocument();
  });

  it("should format string dates for a Create task", () => {
    renderView();
    expect(screen.getByText("15 Jan, 2023")).toBeInTheDocument();
    expect(screen.getByText("01 Jan, 2023")).toBeInTheDocument();
  });

  it("should format array dates from a change-request payload", () => {
    const updateMyTaskData = {
      ...mockMyTaskData,
      taskListObjectAction: "Update",
    };
    mockHistory.location = { state: { myTaskData: updateMyTaskData } };
    mockState = {
      contract: {
        contractDetails: {
          ...contractDetails,
          agreementSignedOn: [2024, 3, 5],
          agreementStartDate: [2024, 4, 1],
          agreementExpiryDate: [2025, 12, 31],
        },
      },
      vendor: [],
    };
    renderView({
      ...baseMockProps,
      location: { state: { myTaskData: updateMyTaskData } },
    });
    expect(screen.getByText("05 Mar, 2024")).toBeInTheDocument();
    expect(screen.getByText("01 Apr, 2024")).toBeInTheDocument();
    expect(screen.getByText("31 Dec, 2025")).toBeInTheDocument();
  });

  it("should render placeholders when the dates are missing", () => {
    mockState = {
      contract: {
        contractDetails: {
          ...contractDetails,
          agreementSignedOn: undefined,
          agreementStartDate: undefined,
          agreementExpiryDate: undefined,
        },
      },
      vendor: [],
    };
    const { container } = renderView();
    expect(screen.getByText("Signed On:")).toBeInTheDocument();
    expect(container.querySelectorAll(".label-review").length).toBeGreaterThan(
      5
    );
  });

  it("should still render the details when only the agreement name is present", () => {
    mockState = {
      contract: { contractDetails: { agreementName: "Name Only" } },
      vendor: [],
    };
    renderView();
    expect(screen.getByText("Agreement ID :")).toBeInTheDocument();
    expect(
      screen.queryByText("Agreement details not available")
    ).not.toBeInTheDocument();
  });

  // ---- approve flow ----
  it("should open the Approve confirmation modal from the header action", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
  });

  it("should dispatch an APPROVED payload and navigate to My Tasks", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        ...mockMyTaskData,
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
      })
    );
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
  });

  it("should not navigate when the approve response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({}));
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("should close the approve modal on cancel without dispatching", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Approve Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });

  // ---- reject flow ----
  it("should open the Reject modal with the reason field", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(document.querySelector("textarea")).toBeInTheDocument();
  });

  it("should block the rejection and show the required error for an empty reason", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("reason is mandatory !")).toBeInTheDocument();
    expect(updateTaskAction).not.toHaveBeenCalled();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("should dispatch a REJECTED payload carrying the reason and navigate away", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const textarea = document.querySelector("textarea");
    fireEvent.change(textarea, { target: { value: "Terms not acceptable" } });

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        ...mockMyTaskData,
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
        taskListRejectionReason: "Terms not acceptable",
      })
    );
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
  });

  it("should not navigate when the reject response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(undefined));
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "Rejected for cause" },
    });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("should close the reject modal on cancel without dispatching", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });
});
