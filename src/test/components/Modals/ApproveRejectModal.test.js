import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApproveRejectModal from "../../../components/Modals/ApproveRejectModal";
import { AppProviders } from "../../../design-system";
import {
  getAllTasks,
  updateTaskAction,
} from "../../../store/actions/MyTasksActions.js";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../store/actions/MyTasksActions.js", () => ({
  getAllTasks: jest.fn(),
  updateTaskAction: jest.fn(),
}));

const currentActionData = {
  taskListId: "T-100",
  taskListObject: "Datafeed",
  taskListObjectAction: "Create",
  taskListTaskStatus: "Pending",
};

const makeProps = (overrides = {}) => ({
  approveModal: false,
  rejectModal: false,
  currentActionData,
  setDisabledSubmitBtn: jest.fn(),
  refreshPage: jest.fn(),
  getStatus: jest.fn(),
  ...overrides,
});

const renderModal = (props) => {
  const finalProps = props || makeProps();
  const utils = render(
    <AppProviders>
      <ApproveRejectModal {...finalProps} />
    </AppProviders>
  );
  return { ...utils, props: finalProps };
};

const typeReason = (text) => {
  const textarea = document.querySelector("textarea");
  fireEvent.change(textarea, { target: { value: text } });
  return textarea;
};

describe("ApproveRejectModal", () => {
  beforeEach(() => {
    // CRA sets resetMocks:true, so every implementation must be re-installed.
    getAllTasks.mockReturnValue({ type: "GET_ALL_TASKS" });
    updateTaskAction.mockImplementation((payload) => ({
      type: "UPDATE_TASK",
      payload,
    }));
    mockDispatch.mockResolvedValue({
      data: { statusMessage: { message: "Task updated successfully" } },
    });
  });

  it("should render without crashing when both modals are closed", () => {
    const { baseElement } = renderModal();
    expect(baseElement).toBeInTheDocument();
    expect(screen.queryByText("Approve Task")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject Task")).not.toBeInTheDocument();
  });

  it("should show the Approve Task modal when approveModal is true", () => {
    renderModal(makeProps({ approveModal: true }));
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("should show the Reject Task modal with a reason textarea when rejectModal is true", () => {
    renderModal(makeProps({ rejectModal: true }));
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(screen.getByText(/reason for rejecting/i)).toBeInTheDocument();
    expect(document.querySelector("textarea")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("The reject reason (Max 250 characters)")
    ).toBeInTheDocument();
  });

  it("should dispatch updateTaskAction with the current action data on approve", async () => {
    const { props } = renderModal(makeProps({ approveModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(props.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith(currentActionData)
    );
    await waitFor(() => expect(getAllTasks).toHaveBeenCalled());
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_TASK",
      payload: currentActionData,
    });
    await waitFor(() => expect(props.refreshPage).toHaveBeenCalled());
  });

  it("should surface the status message and forward the response via getStatus on approve", async () => {
    const response = {
      data: { statusMessage: { message: "Task approved successfully" } },
    };
    mockDispatch.mockResolvedValue(response);
    const { props } = renderModal(makeProps({ approveModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(
      await screen.findByText("Task approved successfully")
    ).toBeInTheDocument();
    expect(props.getStatus).toHaveBeenCalledWith(response);
  });

  it("should not show a snackbar when the approve response has no statusMessage", async () => {
    const response = { data: { taskListId: "T-100" } };
    mockDispatch.mockResolvedValue(response);
    const { props } = renderModal(makeProps({ approveModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(props.getStatus).toHaveBeenCalledWith(response));
    expect(getAllTasks).toHaveBeenCalled();
    expect(document.querySelector(".MuiAlert-message")).toBeNull();
  });

  it("should skip refresh actions when the approve response has no data", async () => {
    mockDispatch.mockResolvedValue({});
    const { props } = renderModal(makeProps({ approveModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(props.refreshPage).toHaveBeenCalled());
    expect(getAllTasks).not.toHaveBeenCalled();
    expect(props.getStatus).not.toHaveBeenCalled();
  });

  it("should not blow up on approve when getStatus is not provided", async () => {
    const props = makeProps({ approveModal: true, getStatus: undefined });
    renderModal(props);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(props.refreshPage).toHaveBeenCalled());
  });

  it("should close the approve modal and re-enable submit on cancel", async () => {
    const { props } = renderModal(makeProps({ approveModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(props.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
    expect(mockDispatch).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText("Approve Task")).not.toBeInTheDocument()
    );
  });

  it("should block reject submission and show the required error when the reason is empty", async () => {
    const { props } = renderModal(makeProps({ rejectModal: true }));

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("reason is mandatory !")).toBeInTheDocument();
    expect(updateTaskAction).not.toHaveBeenCalled();
    expect(props.setDisabledSubmitBtn).not.toHaveBeenCalledWith(true);
  });

  it("should set a manual error when the reason is only whitespace", async () => {
    const { props } = renderModal(makeProps({ rejectModal: true }));

    typeReason("     ");
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("reason is mandatory !")).toBeInTheDocument();
    expect(updateTaskAction).not.toHaveBeenCalled();
    expect(props.setDisabledSubmitBtn).not.toHaveBeenCalledWith(true);
    expect(props.refreshPage).not.toHaveBeenCalled();
  });

  it("should dispatch a Rejected payload carrying the reason", async () => {
    const { props } = renderModal(makeProps({ rejectModal: true }));

    typeReason("Missing supporting documentation");
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        ...currentActionData,
        taskListRejectionReason: "Missing supporting documentation",
        taskListTaskStatus: "Rejected",
      })
    );
    expect(props.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    await waitFor(() => expect(getAllTasks).toHaveBeenCalled());
    await waitFor(() => expect(props.refreshPage).toHaveBeenCalled());
  });

  it("should reset the reason field, close the modal and toast on a successful reject", async () => {
    const response = {
      data: { statusMessage: { message: "Task rejected successfully" } },
    };
    mockDispatch.mockResolvedValue(response);
    const { props } = renderModal(makeProps({ rejectModal: true }));

    const textarea = typeReason("Not compliant");
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(
      await screen.findByText("Task rejected successfully")
    ).toBeInTheDocument();
    expect(props.getStatus).toHaveBeenCalledWith(response);
    await waitFor(() => expect(textarea.value).toBe(""));
  });

  it("should still refresh the page when the reject response has no data", async () => {
    mockDispatch.mockResolvedValue(undefined);
    const { props } = renderModal(makeProps({ rejectModal: true }));

    typeReason("Rejected for cause");
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(props.refreshPage).toHaveBeenCalled());
    expect(getAllTasks).not.toHaveBeenCalled();
    expect(props.getStatus).not.toHaveBeenCalled();
  });

  it("should clear the reason and re-enable submit when the reject modal is cancelled", async () => {
    const { props } = renderModal(makeProps({ rejectModal: true }));

    const textarea = typeReason("some reason");
    expect(textarea.value).toBe("some reason");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(props.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
    expect(updateTaskAction).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
  });

  it("should sync internal state when the modal props change", async () => {
    const props = makeProps();
    const { rerender } = render(
      <AppProviders>
        <ApproveRejectModal {...props} />
      </AppProviders>
    );
    expect(screen.queryByText("Reject Task")).not.toBeInTheDocument();

    rerender(
      <AppProviders>
        <ApproveRejectModal {...props} rejectModal={true} />
      </AppProviders>
    );
    expect(await screen.findByText("Reject Task")).toBeInTheDocument();
  });
});
