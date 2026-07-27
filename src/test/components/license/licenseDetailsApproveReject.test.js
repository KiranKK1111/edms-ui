import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import LicenseDetailsApproveReject from "../../../components/license/licenseDetailsApproveReject/licenseDetailsApproveReject";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: mockPush }),
}));

jest.mock("../../../store/actions/licenseAction", () => ({
  getLicenseDetailsById: jest.fn(() => "getLicenseDetailsById"),
  getLicenseDetailsByCrId: jest.fn(() => "getLicenseDetailsByCrId"),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => jest.fn());

const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const {
  getLicenseDetailsById,
  getLicenseDetailsByCrId,
} = require("../../../store/actions/licenseAction");
const isAcessDisabled = require("../../../utils/accessMyTask");

const buildState = () => ({
  license: {
    data: [
      {
        licenseId: "L001",
        licenseLongName: "Test License",
        licenseShortName: "TL",
        licenseType: "Standard",
        licenseDataProcurementType: "API",
        licenseValuePerMonth: "100",
        licenseExpiryDate: "2026-12-31",
        licenseNumberOfLicensesPurchaised: "5",
        licenseNumberOfLicensesUsed: "2",
        licenseStatus: "Active",
        licenseLimitations: "None",
        usageModel: "api",
        technicalDocument: "doc1.pdf,doc2.pdf",
      },
    ],
  },
});

const mockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T001",
        taskListObject: "license",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListCreatedBy: "user1",
      },
    },
  },
  history: { push: mockPush },
};

const renderComponent = (props = mockProps) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <LicenseDetailsApproveReject {...props} />
      </MemoryRouter>
    </AppProviders>
  );

// Build props with an overridden myTaskData block.
const withTask = (overrides) => ({
  ...mockProps,
  location: {
    state: {
      myTaskData: { ...mockProps.location.state.myTaskData, ...overrides },
    },
  },
});

describe("LicenseDetailsApproveReject", () => {
  beforeEach(() => {
    // CRA sets resetMocks:true — re-install every implementation here.
    isAcessDisabled.mockReturnValue(false);
    updateTaskAction.mockImplementation((payload) => ({
      type: "UPDATE_TASK",
      payload,
    }));
    getLicenseDetailsById.mockImplementation((id) => ({
      type: "GET_LICENSE_BY_ID",
      id,
    }));
    getLicenseDetailsByCrId.mockImplementation((id) => ({
      type: "GET_LICENSE_BY_CR_ID",
      id,
    }));
    mockDispatch.mockReturnValue(Promise.resolve({ data: true }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    mockState = buildState();
  });

  it("should render the Licence Details section header", () => {
    renderComponent();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });

  it("should render the Licence Limitations section header", () => {
    renderComponent();
    expect(
      screen.getAllByText("Licence Limitations").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the licence short name as the title", () => {
    renderComponent();
    expect(screen.getAllByText("TL").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Approve and Reject buttons", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should open the approve modal and dispatch on confirm", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
  });

  // -------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------

  it("should load the licence by id for a Create task", () => {
    renderComponent();
    expect(getLicenseDetailsById).toHaveBeenCalledWith("123");
    expect(getLicenseDetailsByCrId).not.toHaveBeenCalled();
  });

  it("should load the change-request snapshot for an Update task", () => {
    renderComponent(withTask({ taskListObjectAction: "Update" }));
    expect(getLicenseDetailsByCrId).toHaveBeenCalledWith("123");
    expect(getLicenseDetailsById).not.toHaveBeenCalled();
  });

  it("should load the change-request snapshot for a Deactivate task", () => {
    renderComponent(withTask({ taskListObjectAction: "Deactivate" }));
    expect(getLicenseDetailsByCrId).toHaveBeenCalledWith("123");
    expect(getLicenseDetailsById).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Read-only detail binding
  // -------------------------------------------------------------------

  it("should bind every licence detail field from the store", () => {
    renderComponent();
    expect(screen.getByText("Licence ID")).toBeInTheDocument();
    expect(screen.getByText("L001")).toBeInTheDocument();
    expect(screen.getByText("Test License")).toBeInTheDocument();
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("should format a string expiry date", () => {
    renderComponent();
    expect(screen.getByText("31 Dec, 2026")).toBeInTheDocument();
  });

  it("should format an array expiry date via conVertDateArrayToDate", () => {
    mockState = buildState();
    mockState.license.data[0].licenseExpiryDate = [2027, 1, 15];
    renderComponent();
    expect(screen.getByText("Expiration Date")).toBeInTheDocument();
    expect(screen.getByText(/2027/)).toBeInTheDocument();
  });

  it("should hide 'No. of Licence Used' for a Create task", () => {
    renderComponent();
    expect(screen.queryByText("No. of Licence Used")).not.toBeInTheDocument();
  });

  it("should show 'No. of Licence Used' for a non-Create task", () => {
    renderComponent(withTask({ taskListObjectAction: "Update" }));
    expect(screen.getByText("No. of Licence Used")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should fall back to 0 when no licences have been used", () => {
    mockState = buildState();
    mockState.license.data[0].licenseNumberOfLicensesUsed = null;
    renderComponent(withTask({ taskListObjectAction: "Update" }));
    expect(screen.getByText("No. of Licence Used")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should render without technical documents", () => {
    mockState = buildState();
    mockState.license.data[0].technicalDocument = "";
    renderComponent();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
  });

  it("should render the empty state when the licence data is empty", () => {
    mockState = { license: { data: [] } };
    renderComponent();
    expect(
      screen.getByText("Licence details not available")
    ).toBeInTheDocument();
    expect(screen.queryByText("Licence Details")).not.toBeInTheDocument();
  });

  it("should tolerate a licence list whose first entry is missing", () => {
    mockState = { license: { data: [null] } };
    renderComponent();
    expect(screen.getByText("Licence Details")).toBeInTheDocument();
    expect(screen.queryByText("Licence ID")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------
  // Action availability
  // -------------------------------------------------------------------

  it("should disable the actions when the task is already Approved", () => {
    renderComponent(withTask({ taskListTaskStatus: "Approved" }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should disable the actions when the task is already Rejected", () => {
    renderComponent(withTask({ taskListTaskStatus: "Rejected" }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should disable the actions when access is not permitted", () => {
    isAcessDisabled.mockReturnValue(true);
    renderComponent();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should disable the actions for the requester who raised the task", () => {
    renderComponent(withTask({ taskListCreatedBy: "current_user" }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  // -------------------------------------------------------------------
  // Approve flow
  // -------------------------------------------------------------------

  it("should dispatch an APPROVED payload and navigate to My Tasks", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        taskListId: "T001",
        taskListObject: "license",
        taskListObjectAction: "Create",
        taskListCreatedBy: "user1",
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
      })
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/myTasks"));
  });

  it("should not navigate when the approve response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({}));
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should close the approve modal on cancel without dispatching", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Approve Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Reject flow
  // -------------------------------------------------------------------

  it("should open the reject modal with the reason field", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(document.querySelector("textarea")).toBeInTheDocument();
  });

  it("should swallow a native submit of the reason form", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const form = screen.getByRole("dialog").querySelector("form");
    expect(form).toBeInTheDocument();
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    form.dispatchEvent(submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it("should not dispatch a rejection when no reason is entered", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(updateTaskAction).not.toHaveBeenCalled());
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should dispatch a REJECTED payload carrying the reason and navigate away", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "Licence value not agreed" },
    });

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        taskListId: "T001",
        taskListObject: "license",
        taskListObjectAction: "Create",
        taskListCreatedBy: "user1",
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
        taskListRejectionReason: "Licence value not agreed",
      })
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/myTasks"));
  });

  it("should not navigate when the reject response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(undefined));
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "Rejected for cause" },
    });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should close the reject modal on cancel without dispatching", async () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });
});
