import React from "react";
import { render, screen } from "@testing-library/react";
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

const isAcessDisabled = require("../../../utils/accessMyTask");

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
});
