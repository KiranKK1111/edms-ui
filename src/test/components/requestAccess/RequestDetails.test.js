import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppProviders from "../../../design-system/AppProviders";
import RequestDetails from "../../../components/requestAccess/RequestDetails";
import {
  APPROVE_REJECT_BTN,
  APPROVE_REJECT_BTN_SUBS,
} from "../../../utils/Constants";

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
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

const mockGetDataById = jest.fn();
const mockGetDataByCrId = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  getDataById: (...args) => mockGetDataById(...args),
  getDataByCrId: (...args) => mockGetDataByCrId(...args),
}));

const mockCatalogueDetailsData = jest.fn();
jest.mock("../../../store/actions/DatasetPageActions", () => ({
  catalogueDetailsData: (...args) => mockCatalogueDetailsData(...args),
}));

jest.mock("../../../store/actions/MyTasksActions.js", () => ({
  getAllTasks: jest.fn(() => "getAllTasks"),
  updateTaskAction: jest.fn(() => "updateTaskAction"),
}));

jest.mock("../../../utils/accessObject", () => {
  const fn = jest.fn().mockReturnValue(null);
  return fn;
});

const getPermissionObject = require("../../../utils/accessObject");

const dataById = {
  subscriptionId: "S1",
  department: "IT",
  clarityId: "CL1",
  licensesSubscribed: "5",
  subscriptionStatus: "Active",
  projectName: "Proj",
  reason: "Need access",
  subscriber: "User1",
  subscriptionType: "Team",
  dataFeedId: "F1",
  subscriptionVendorRequest: "N",
};

const buildState = (overrides = {}) => ({
  requestAccess: {
    dataByIdResponse: { dataById },
    businessRequirements: [{ subscriptionType: "Team" }],
  },
  catalogueList: { catalogueList: [] },
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
  license: {},
  contract: {},
  ...overrides,
});

const baseMockProps = {
  location: {
    state: {
      myTaskData: {
        taskListId: "T1",
        taskListObjectAction: "Create",
        taskListTaskStatus: "Pending",
        taskListObject: "Subscription",
        taskListDescription: "Test Task",
        taskListCreatedBy: "user1",
      },
    },
  },
  history: { push: jest.fn(), replace: jest.fn() },
  allowSubmit: true,
};

const withTaskData = (extra) => ({
  ...baseMockProps,
  location: {
    state: {
      myTaskData: { ...baseMockProps.location.state.myTaskData, ...extra },
    },
  },
});

const renderRequestDetails = (props = baseMockProps) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <RequestDetails {...props} />
      </MemoryRouter>
    </AppProviders>
  );

const allowActions = () =>
  getPermissionObject.mockReturnValue({ permission: "RW" });

describe("RequestDetails", () => {
  beforeEach(() => {
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
    mockHistoryPush.mockClear();
    mockGetDataById.mockReturnValue("getDataById");
    mockGetDataByCrId.mockReturnValue("getDataByCrId");
    mockCatalogueDetailsData.mockReturnValue("catalogueDetailsData");
    getPermissionObject.mockReturnValue(null);
    localStorage.clear();
    localStorage.setItem("psid", "current_user");
    localStorage.setItem("entitlementType", "Admin");
    baseMockProps.history.push.mockClear();
    baseMockProps.history.replace.mockClear();
    mockState = buildState();
  });

  it("should render without crashing", () => {
    const { container } = renderRequestDetails();
    expect(container.querySelector(".request-details")).toBeInTheDocument();
  });

  it("should render the Business Requirements heading", () => {
    renderRequestDetails();
    expect(screen.getByText("Business Requirements")).toBeInTheDocument();
  });

  it("should render Approve and Reject buttons", () => {
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("should disable the action buttons when there are no permissions", () => {
    getPermissionObject.mockReturnValue(null);
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should render the subscription field values", () => {
    renderRequestDetails();
    expect(screen.getByText("Reason for Subscription :")).toBeInTheDocument();
  });

  it("should render the DisplayTC general subscription terms", () => {
    renderRequestDetails();
    expect(
      screen.getByText("Terms & Conditions general Subscription")
    ).toBeInTheDocument();
  });

  it("should render with an Update (non-Create) action", () => {
    const { container } = renderRequestDetails(
      withTaskData({ taskListObjectAction: "Update" })
    );
    expect(container.querySelector(".request-details")).toBeInTheDocument();
  });

  it("should fetch by subscription id for a Create task", () => {
    renderRequestDetails();
    expect(mockGetDataById).toHaveBeenCalledWith("123");
    expect(mockGetDataByCrId).not.toHaveBeenCalled();
  });

  it("should fetch by change request id for a non Create task", () => {
    renderRequestDetails(withTaskData({ taskListObjectAction: "Update" }));
    expect(mockGetDataByCrId).toHaveBeenCalledWith("123");
    expect(mockGetDataById).not.toHaveBeenCalled();
  });

  it("should show the empty state when the subscription details are missing", () => {
    mockState = buildState({
      requestAccess: {
        dataByIdResponse: { dataById: {} },
        businessRequirements: [],
      },
    });
    allowActions();
    renderRequestDetails();
    expect(
      screen.getByText("Subscription details not available")
    ).toBeInTheDocument();
    expect(screen.queryByText("Business Requirements")).not.toBeInTheDocument();
    // nothing to act on => the actions stay disabled even with permissions
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should map the vendor request flag onto a friendly label", () => {
    mockState = buildState({
      requestAccess: {
        dataByIdResponse: {
          dataById: { ...dataById, subscriptionVendorRequest: "Y" },
        },
        businessRequirements: [{ subscriptionType: "Team" }],
      },
    });
    renderRequestDetails();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("should treat an individual subscription as a self subscription", () => {
    mockState = buildState({
      requestAccess: {
        dataByIdResponse: { dataById },
        businessRequirements: [
          { subscriptionType: "Individual Subscription" },
        ],
      },
    });
    const { container } = renderRequestDetails();
    expect(container.querySelector(".request-details")).toBeInTheDocument();
  });

  it("should push the matching catalogue entry into the route state", async () => {
    mockState = buildState({
      catalogueList: {
        catalogueList: [
          { dataFeedId: "F1", datasetId: "D1", dataFeedLongName: "Feed One" },
          { dataFeedId: "F2", datasetId: "D2", dataFeedLongName: "Feed Two" },
        ],
      },
    });
    renderRequestDetails();
    await waitFor(() =>
      expect(mockCatalogueDetailsData).toHaveBeenCalledWith("F1", "D1")
    );
    expect(baseMockProps.history.replace).toHaveBeenCalledWith({
      state: {
        data: { dataFeedId: "F1", datasetId: "D1", dataFeedLongName: "Feed One" },
        myTaskData: baseMockProps.location.state.myTaskData,
      },
    });
  });

  it("should replace the route state with an empty object when nothing matches", () => {
    mockState = buildState({
      catalogueList: {
        catalogueList: [{ dataFeedId: "NOPE", datasetId: "D9" }],
      },
    });
    renderRequestDetails();
    expect(mockCatalogueDetailsData).not.toHaveBeenCalled();
    expect(baseMockProps.history.replace).toHaveBeenCalledWith({
      state: { data: {}, myTaskData: baseMockProps.location.state.myTaskData },
    });
  });

  it("should enable the actions when the approve/reject permission is RW", () => {
    allowActions();
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
  });

  it("should enable the actions from the subscription specific permission", () => {
    getPermissionObject.mockImplementation((page, obj) =>
      obj === APPROVE_REJECT_BTN ? undefined : { permission: "RW" }
    );
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  it("should keep the actions disabled when the subscription permission is read only", () => {
    getPermissionObject.mockImplementation((page, obj) => {
      if (obj === APPROVE_REJECT_BTN) return undefined;
      if (obj === APPROVE_REJECT_BTN_SUBS) return { permission: "R" };
      return { permission: "RW" };
    });
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should keep the actions disabled for a non subscription task", () => {
    getPermissionObject.mockImplementation((page, obj) =>
      obj === APPROVE_REJECT_BTN ? undefined : { permission: "RW" }
    );
    renderRequestDetails(withTaskData({ taskListObject: "Entity" }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should keep the actions disabled for the dataset delegate role", () => {
    localStorage.setItem("entitlementType", "Dataset Delegate");
    allowActions();
    renderRequestDetails();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should keep the actions disabled when submitting is not allowed", () => {
    allowActions();
    renderRequestDetails({ ...baseMockProps, allowSubmit: false });
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should keep the actions disabled for an already approved task", () => {
    allowActions();
    renderRequestDetails(withTaskData({ taskListTaskStatus: "Approved" }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("should keep the actions disabled for an already rejected task", () => {
    allowActions();
    renderRequestDetails(withTaskData({ taskListTaskStatus: "Rejected" }));
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
  });

  it("should open the approve modal with an APPROVED payload", async () => {
    allowActions();
    renderRequestDetails();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Approve Task")).toBeInTheDocument();
  });

  it("should open the reject modal with a REJECTED payload", async () => {
    allowActions();
    renderRequestDetails();
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Reject Task")).toBeInTheDocument();
  });

  it("should mark the task as actioned and go back to My Tasks after approving", async () => {
    allowActions();
    mockDispatch = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: { taskList: [{ id: 1 }] } }));
    renderRequestDetails();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled()
    );
  });

  it("should keep the actions enabled when the approve response has no task list", async () => {
    allowActions();
    mockDispatch = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: { taskList: null } }));
    renderRequestDetails();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve" }));
    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith("/myTasks")
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });
});
