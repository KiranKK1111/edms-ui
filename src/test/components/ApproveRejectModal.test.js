import React from "react";
import { render, screen } from "@testing-library/react";
import ApproveRejectModal from "../../components/Modals/ApproveRejectModal";
import { AppProviders } from "../../design-system";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../store/actions/MyTasksActions.js", () => ({
  getAllTasks: jest.fn(),
  getOverViewRecordsList: jest.fn(),
  updateTaskAction: jest.fn(),
}));

const defaultProps = {
  approveModal: false,
  rejectModal: false,
  currentActionData: {},
  setDisabledSubmitBtn: jest.fn(),
  refreshPage: jest.fn(),
};

const renderModal = (props = {}) =>
  render(
    <AppProviders>
      <ApproveRejectModal {...defaultProps} {...props} />
    </AppProviders>
  );

describe("ApproveRejectModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    const { baseElement } = renderModal();
    expect(baseElement).toBeInTheDocument();
  });

  it("should render the Approve Task modal content when approve modal is open", () => {
    renderModal({ approveModal: true });
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
  });

  it("should render an Approve action button when approve modal is open", () => {
    renderModal({ approveModal: true });
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("should render the Reject Task modal content when reject modal is open", () => {
    renderModal({ rejectModal: true });
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(
      screen.getByText(/reason for rejecting/i)
    ).toBeInTheDocument();
  });

  it("should render the reason textarea with a max length of 250", () => {
    renderModal({ rejectModal: true });
    const textarea = document.querySelector('textarea[maxlength="250"]');
    expect(textarea).toBeInTheDocument();
  });

  it("should render a Reject action button when reject modal is open", () => {
    renderModal({ rejectModal: true });
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should render with currentActionData", () => {
    const { baseElement } = renderModal({
      approveModal: true,
      currentActionData: { taskId: "T001", taskListTaskStatus: "Pending" },
    });
    expect(baseElement).toBeInTheDocument();
  });
});
