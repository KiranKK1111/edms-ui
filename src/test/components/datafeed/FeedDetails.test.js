import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FeedDetails from "../../../components/datafeed/FeedDetails";

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

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "F1" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/services/DatafeedService", () => ({
  getDataFeedById: jest.fn(),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(() => "startGetDatafeeds"),
  getDatafeedDetailsByCrId: jest.fn((x) => "getDatafeedDetailsByCrId_" + x),
}));

jest.mock("../../../store/actions/MyTasksActions", () => ({
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessMyTask", () => {
  const fn = jest.fn().mockReturnValue(false);
  return fn;
});

jest.mock("../../../design-system/toast", () => {
  const api = {
    open: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return { __esModule: true, toast: api, default: api, setToastApi: jest.fn() };
});

const isAcessDisabled = require("../../../utils/accessMyTask");
const { toast } = require("../../../design-system/toast");
const { updateTaskAction } = require("../../../store/actions/MyTasksActions");
const {
  startGetDatafeeds,
  getDatafeedDetailsByCrId,
} = require("../../../store/actions/datafeedAction");

const feedRecord = {
  feedId: "F1",
  documentationLink: "https://test.com",
  feedDescription: "Test feed description",
  feedStatus: "Active",
  personalData: "No",
  dataConfidentiality: "Low",
  longName: "Test Feed Long",
  shortName: "TF",
};

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListObject: "Datafeed",
        taskListCreatedBy: "other_user",
      },
    },
  },
  history: { push: jest.fn() },
};

const renderFeed = (props = baseMockProps) =>
  render(
    <MemoryRouter>
      <FeedDetails {...props} />
    </MemoryRouter>
  );

describe("FeedDetails", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockHistoryPush.mockClear();
    isAcessDisabled.mockReturnValue(false);
    // CRA sets resetMocks:true — re-install every implementation here.
    updateTaskAction.mockImplementation((payload) => ({
      type: "UPDATE_TASK",
      payload,
    }));
    startGetDatafeeds.mockReturnValue({ type: "GET_DATAFEEDS" });
    getDatafeedDetailsByCrId.mockImplementation((id) => ({
      type: "GET_DATAFEED_BY_CR_ID",
      id,
    }));
    mockDispatch.mockReturnValue(Promise.resolve({ data: { success: true } }));
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    mockState = {
      datafeedInfo: { datafeedsData: [feedRecord] },
    };
  });

  it("should render without crashing", () => {
    const { container } = renderFeed();
    expect(container).toBeInTheDocument();
  });

  it("should render the General Details heading", () => {
    renderFeed();
    expect(screen.getByText("General Details")).toBeInTheDocument();
  });

  it("should render the feed short name", () => {
    renderFeed();
    expect(screen.getAllByText(/TF/).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Approve and Reject buttons", () => {
    renderFeed();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should render the datafeed-details container", () => {
    const { container } = renderFeed();
    expect(container.querySelector(".datafeed-details")).toBeInTheDocument();
  });

  it("should not disable actions when taskListTaskStatus is Pending", () => {
    renderFeed();
    expect(screen.getByRole("button", { name: "Approve" })).not.toBeDisabled();
  });

  it("should disable actions when isAcessDisabled returns true", () => {
    isAcessDisabled.mockReturnValue(true);
    renderFeed();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should disable actions when taskListCreatedBy equals psid", () => {
    const props = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListCreatedBy: "current_user",
          },
        },
      },
    };
    renderFeed(props);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should render with Update action props", () => {
    const props = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Update",
          },
        },
      },
    };
    const { container } = renderFeed(props);
    expect(container).toBeInTheDocument();
  });

  it("should handle empty datafeedsData", () => {
    mockState = { datafeedInfo: { datafeedsData: [] } };
    renderFeed();
    expect(screen.getByText("General Details")).toBeInTheDocument();
  });

  it("should handle null datafeedsData", () => {
    mockState = { datafeedInfo: { datafeedsData: null } };
    const { container } = renderFeed();
    expect(container).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------
  // Read-only detail binding
  // ---------------------------------------------------------------------

  it("should bind the feed record from the store into labelled detail fields", () => {
    renderFeed();
    expect(screen.getByText("Data Feed ID :")).toBeInTheDocument();
    expect(screen.getByText("F1")).toBeInTheDocument();
    expect(screen.getByText("Test feed description")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Test Feed Long")).toBeInTheDocument();
  });

  it("should not render the documentation url field", () => {
    renderFeed();
    expect(screen.queryByText("https://test.com")).not.toBeInTheDocument();
  });

  it("should show the loading placeholder when no feed matches the route id", () => {
    mockState = { datafeedInfo: { datafeedsData: [] } };
    renderFeed();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch all datafeeds for a Create task", () => {
    renderFeed();
    expect(startGetDatafeeds).toHaveBeenCalled();
    expect(getDatafeedDetailsByCrId).not.toHaveBeenCalled();
  });

  it("should fetch the change-request snapshot for a non-Create task", () => {
    const props = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListObjectAction: "Update",
          },
        },
      },
    };
    renderFeed(props);
    expect(getDatafeedDetailsByCrId).toHaveBeenCalledWith("F1");
    expect(startGetDatafeeds).not.toHaveBeenCalled();
    expect(screen.getByText("Test Feed Long")).toBeInTheDocument();
  });

  it("should disable the actions when the task is already Approved", () => {
    const props = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListTaskStatus: "Approved",
          },
        },
      },
    };
    renderFeed(props);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should disable the actions when the task is already Rejected", () => {
    const props = {
      ...baseMockProps,
      location: {
        state: {
          myTaskData: {
            ...baseMockProps.location.state.myTaskData,
            taskListTaskStatus: "Rejected",
          },
        },
      },
    };
    renderFeed(props);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  // ---------------------------------------------------------------------
  // Approve flow
  // ---------------------------------------------------------------------

  it("should open the Approve confirmation modal from the header action", () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByText("Approve Task")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?")
    ).toBeInTheDocument();
  });

  it("should dispatch an APPROVED payload built from myTaskData and localStorage", async () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListObject: "Datafeed",
        taskListCreatedBy: "other_user",
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
      })
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Task Updated Successfully!")
    );
    expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks");
  });

  it("should not navigate when the approve response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve({}));
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should close the approve modal on cancel without dispatching", async () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Approve Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------
  // Reject flow
  // ---------------------------------------------------------------------

  it("should open the Reject modal with the reason field", () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
    expect(document.querySelector("textarea")).toBeInTheDocument();
  });

  it("should keep the reject modal open and skip dispatch when no reason is entered", async () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(updateTaskAction).not.toHaveBeenCalled());
    expect(screen.getByText("Reject Task")).toBeInTheDocument();
  });

  it("should dispatch a REJECTED payload carrying the reason and navigate away", async () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const textarea = document.querySelector("textarea");
    fireEvent.change(textarea, { target: { value: "Incomplete metadata" } });

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() =>
      expect(updateTaskAction).toHaveBeenCalledWith({
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListObject: "Datafeed",
        taskListCreatedBy: "other_user",
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: "current_user",
        roleName: "Admin",
        taskListRejectionReason: "Incomplete metadata",
      })
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Task Updated Successfully!")
    );
    expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks");
  });

  it("should not navigate when the reject response has no data", async () => {
    mockDispatch.mockReturnValue(Promise.resolve(undefined));
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    fireEvent.change(document.querySelector("textarea"), {
      target: { value: "Rejected for cause" },
    });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(updateTaskAction).toHaveBeenCalled());
    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should close the reject modal on cancel without dispatching", async () => {
    renderFeed();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Reject Task")).not.toBeInTheDocument()
    );
    expect(updateTaskAction).not.toHaveBeenCalled();
  });
});
