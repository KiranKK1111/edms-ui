import React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import DatasetTasklistDetails from "../../../components/datasetForm/DatasetTasklistDetails";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "DS1" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(() => "startGetDatasets"),
  gerDatasetByCrId: jest.fn((x) => "gerDatasetByCrId_" + x),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => jest.fn());

const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const isAcessDisabled = require("../../../utils/accessMyTask");

const datasetRecord = {
  datasetId: "DS1",
  longName: "Dataset One",
  shortName: "DS1Short",
  datasetStatus: "Active",
  datasetDescription: "A dataset",
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListCreatedBy: "other_user",
        taskListObject: "Dataset",
      },
    },
  },
  history: { push: jest.fn() },
};

const renderDetails = (props = baseMockProps) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <DatasetTasklistDetails {...props} />
      </MemoryRouter>
    </AppProviders>
  );

describe("DatasetTasklistDetails", () => {
  beforeEach(() => {
    isAcessDisabled.mockReturnValue(false);
    mockDispatch.mockReturnValue(Promise.resolve({ data: { success: true } }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    mockState = { dataset: { datasetsInfo: [datasetRecord] } };
  });

  it("should render the Dataset details heading", () => {
    renderDetails();
    expect(screen.getByText("Dataset details")).toBeInTheDocument();
  });

  it("should render the dataset short name as the title", () => {
    renderDetails();
    expect(screen.getAllByText("DS1Short").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Approve and Reject action buttons", () => {
    renderDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should NOT disable actions for a pending task created by another user", () => {
    renderDetails();
    expect(screen.getByRole("button", { name: "Approve" })).not.toBeDisabled();
  });

  it("should disable actions when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    renderDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should disable actions when the task was created by the current user", () => {
    localStorage.setItem("psid", "other_user");
    renderDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should open the approve modal when Approve is clicked", () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
  });

  it("should open the reject modal when Reject is clicked", () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
  });

  it("should dispatch updateTaskAction and navigate on confirmed approve", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({ data: true }));
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
  });

  it("should render a dash title when there is no dataset data", () => {
    mockState = { dataset: { datasetsInfo: [] } };
    renderDetails();
    // breadcrumb + hero title fall back to "-"
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });
});
