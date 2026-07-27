import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DocumentDeleteValidate from "../../../components/Modals/DocumentDeleteValidate";
import { AppProviders } from "../../../design-system";
import { startDeleteDocument } from "../../../store/actions/datafeedAction";

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
});
