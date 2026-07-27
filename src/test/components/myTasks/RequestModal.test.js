import React from "react";
import { render, screen } from "@testing-library/react";
import RequestModal from "../../../components/myTasks/RequestModal";

describe("RequestModal", () => {
  const defaultProps = {
    isModalVisible: true,
    handleOk: jest.fn(),
    handleCancel: jest.fn(),
    title: "Approve Task",
  };

  it("should render a dialog when visible", () => {
    render(<RequestModal {...defaultProps}>Content</RequestModal>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should not render a dialog when not visible", () => {
    render(
      <RequestModal {...defaultProps} isModalVisible={false}>
        Content
      </RequestModal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render the children content", () => {
    render(<RequestModal {...defaultProps}>Test Content</RequestModal>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render Cancel and confirm buttons", () => {
    render(<RequestModal {...defaultProps}>Content</RequestModal>);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("should show the Approve label for the Approve Task title", () => {
    render(<RequestModal {...defaultProps}>Content</RequestModal>);
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });

  it("should show the Reject label for the Reject Task title", () => {
    render(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should show the Delete label for a Delete title", () => {
    render(
      <RequestModal {...defaultProps} title="Delete Records">
        Content
      </RequestModal>
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should render the approve icon for the Approve Task title", () => {
    render(<RequestModal {...defaultProps}>Content</RequestModal>);
    expect(
      document.querySelector('[data-testid="CheckCircleOutlinedIcon"]')
    ).toBeInTheDocument();
  });

  it("should render the reject icon for the Reject Task title", () => {
    render(
      <RequestModal {...defaultProps} title="Reject Task">
        Content
      </RequestModal>
    );
    expect(
      document.querySelector('[data-testid="HighlightOffIcon"]')
    ).toBeInTheDocument();
  });

  it("should render the delete/warning icon for the Delete title", () => {
    render(
      <RequestModal {...defaultProps} title="Delete Records">
        Content
      </RequestModal>
    );
    expect(
      document.querySelector('[data-testid="ErrorOutlineOutlinedIcon"]')
    ).toBeInTheDocument();
  });

  it("should display the title text in the dialog", () => {
    render(
      <RequestModal {...defaultProps} title="Replace File">
        Content
      </RequestModal>
    );
    expect(screen.getByText("Replace File")).toBeInTheDocument();
  });
});
