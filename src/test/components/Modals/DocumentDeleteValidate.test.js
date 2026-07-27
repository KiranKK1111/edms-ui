import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentDeleteValidate from "../../../components/Modals/DocumentDeleteValidate";
import { AppProviders } from "../../../design-system";
import { startDeleteDocument } from "../../../store/actions/datafeedAction";
import {
  getAllTasks,
  updateTaskAction,
} from "../../../store/actions/MyTasksActions";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  getAllTasks: jest.fn().mockReturnValue({ type: "GET_ALL_TASKS" }),
  getOverViewRecordsList: jest.fn(),
  updateTaskAction: jest.fn().mockReturnValue(
    Promise.resolve({
      data: { statusMessage: { message: "Task rejected" } },
    })
  ),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startDeleteDocument: jest.fn(),
  startGetAllDocuments: jest.fn(),
}));

const defaultProps = {
  deleteModal: false,
  editReplaceModal: false,
  rejectModal: false,
  currentActionData: { docDisplayFilename: "test.pdf", docObjectId: "O1" },
  setDisabledSubmitBtn: jest.fn(),
  setDeleteModal: jest.fn(),
  getDocuments: jest.fn(),
  refreshPage: jest.fn(),
  getStatus: jest.fn(),
};

const renderModal = (props = {}) =>
  render(
    <AppProviders>
      <DocumentDeleteValidate {...defaultProps} {...props} />
    </AppProviders>
  );

describe("DocumentDeleteValidate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // CRA sets resetMocks:true — re-install every implementation here.
    getAllTasks.mockReturnValue({ type: "GET_ALL_TASKS" });
    updateTaskAction.mockImplementation((payload) => ({
      type: "UPDATE_TASK",
      payload,
    }));
    startDeleteDocument.mockResolvedValue({});
    mockDispatch.mockReturnValue(Promise.resolve({}));
  });

  it("should render without crashing", () => {
    const { baseElement } = renderModal();
    expect(baseElement).toBeInTheDocument();
  });

  it("should render the Delete Records modal when deleteModal is true", () => {
    renderModal({ deleteModal: true });
    expect(screen.getByText("Delete Records")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete Records?")
    ).toBeInTheDocument();
  });

  it("should render the Replace File modal when editReplaceModal is true", () => {
    renderModal({ editReplaceModal: true });
    expect(screen.getByText("Replace File")).toBeInTheDocument();
    expect(
      screen.getByText("This file/link is already existing. Replace?")
    ).toBeInTheDocument();
  });

  it("should render the Reject Task modal when rejectModal is true", () => {
    renderModal({ rejectModal: true });
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(screen.getByText(/reason for rejecting/i)).toBeInTheDocument();
  });

  it("should render a reason textarea inside the reject modal", () => {
    renderModal({ rejectModal: true });
    expect(document.querySelector("textarea")).toBeInTheDocument();
  });

  it("should call startDeleteDocument when the Delete action is confirmed", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "Deleted successfully" } },
    });
    renderModal({ deleteModal: true });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    expect(startDeleteDocument).toHaveBeenCalledWith("test.pdf", "O1");
  });

  it("should close the modal when Cancel is clicked on the delete modal", () => {
    renderModal({ deleteModal: true });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
  });

  // -------------------------------------------------------------------
  // Delete / replace flow
  // -------------------------------------------------------------------

  it("should refresh documents, toast, report status and navigate on a successful delete", async () => {
    const response = {
      data: { statusMessage: { message: "Deleted successfully" } },
    };
    startDeleteDocument.mockResolvedValue(response);
    renderModal({ deleteModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(defaultProps.getDocuments).toHaveBeenCalled());
    expect(
      await screen.findByText("Deleted successfully")
    ).toBeInTheDocument();
    expect(defaultProps.getStatus).toHaveBeenCalledWith(response);
    expect(mockHistoryPush).toHaveBeenCalledWith(
      "/masterData/O1/addDocuments"
    );
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
    expect(defaultProps.setDeleteModal).toHaveBeenCalledWith(false);
  });

  it("should not toast when the delete response carries no statusMessage", async () => {
    const response = { data: { docObjectId: "O1" } };
    startDeleteDocument.mockResolvedValue(response);
    renderModal({ deleteModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(defaultProps.getStatus).toHaveBeenCalledWith(response)
    );
    expect(document.querySelector(".MuiAlert-message")).toBeNull();
    expect(mockHistoryPush).toHaveBeenCalled();
  });

  it("should skip navigation when the delete response has no data", async () => {
    startDeleteDocument.mockResolvedValue({});
    renderModal({ deleteModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(defaultProps.setDeleteModal).toHaveBeenCalledWith(false)
    );
    expect(defaultProps.getDocuments).not.toHaveBeenCalled();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("should not blow up on delete when getStatus is not provided", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "Deleted successfully" } },
    });
    renderModal({ deleteModal: true, getStatus: undefined });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(mockHistoryPush).toHaveBeenCalled());
  });

  it("should reuse the delete handler for the Replace File confirmation", async () => {
    startDeleteDocument.mockResolvedValue({
      data: { statusMessage: { message: "Replaced" } },
    });
    renderModal({ editReplaceModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(startDeleteDocument).toHaveBeenCalledWith("test.pdf", "O1")
    );
    expect(await screen.findByText("Replaced")).toBeInTheDocument();
  });

  it("should close the Replace File modal on cancel", async () => {
    renderModal({ editReplaceModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(screen.queryByText("Replace File")).not.toBeInTheDocument()
    );
    expect(startDeleteDocument).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------
  // Reject flow
  // -------------------------------------------------------------------

  it("should block the rejection and show the required error for an empty reason", async () => {
    renderModal({ rejectModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("reason is mandatory !")).toBeInTheDocument();
    expect(updateTaskAction).not.toHaveBeenCalled();
    expect(defaultProps.setDisabledSubmitBtn).not.toHaveBeenCalledWith(true);
  });

  it("should dispatch a Rejected payload carrying the reason", async () => {
    mockDispatch.mockReturnValue(
      Promise.resolve({ data: { statusMessage: { message: "Task rejected" } } })
    );
    renderModal({ rejectModal: true });

    const textarea = document.querySelector("textarea");
    fireEvent.change(textarea, { target: { value: "Wrong document" } });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        docDisplayFilename: "test.pdf",
        docObjectId: "O1",
        taskListRejectionReason: "Wrong document",
        taskListTaskStatus: "Rejected",
      })
    );
    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(true);
    expect(getAllTasks).toHaveBeenCalled();
    expect(await screen.findByText("Task rejected")).toBeInTheDocument();
    await waitFor(() => expect(textarea.value).toBe(""));
    expect(defaultProps.refreshPage).toHaveBeenCalled();
  });

  it("should still refresh the page when the reject response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(undefined));
    renderModal({ rejectModal: true });

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "Rejected for cause" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(defaultProps.refreshPage).toHaveBeenCalled());
    expect(getAllTasks).not.toHaveBeenCalled();
    expect(defaultProps.getStatus).not.toHaveBeenCalled();
  });

  it("should not toast when the reject response carries no statusMessage", async () => {
    const response = { data: { taskListId: "T1" } };
    mockDispatch.mockReturnValue(Promise.resolve(response));
    renderModal({ rejectModal: true });

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "No status message" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(defaultProps.getStatus).toHaveBeenCalledWith(response)
    );
    expect(document.querySelector(".MuiAlert-message")).toBeNull();
  });

  it("should close the reject modal on cancel without dispatching", async () => {
    renderModal({ rejectModal: true });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(defaultProps.setDisabledSubmitBtn).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });

  it("should sync the modal state when props change", async () => {
    const { rerender } = render(
      <AppProviders>
        <DocumentDeleteValidate {...defaultProps} />
      </AppProviders>
    );
    expect(screen.queryByText("Delete Records")).not.toBeInTheDocument();

    rerender(
      <AppProviders>
        <DocumentDeleteValidate {...defaultProps} rejectModal={true} />
      </AppProviders>
    );
    expect(await screen.findByText("Reject Task")).toBeInTheDocument();
  });
});
