import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppProviders from "../../../design-system/AppProviders";
import RequestDetails from "../../../components/requestAccess/RequestDetails";

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

jest.mock("../../../store/actions/requestAccessActions", () => ({
  getDataById: jest.fn(() => "getDataById"),
  getDataByCrId: jest.fn(() => "getDataByCrId"),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  catalogueDetailsData: jest.fn(() => "catalogueDetailsData"),
}));

jest.mock("../../../utils/accessObject", () => {
  const fn = jest.fn().mockReturnValue(null);
  return fn;
});

const getPermissionObject = require("../../../utils/accessObject");

const buildState = () => ({
  requestAccess: {
    dataByIdResponse: {
      dataById: {
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
      },
    },
    businessRequirements: [{ subscriptionType: "Team" }],
  },
  catalogueList: { catalogueList: [] },
  datafeedInfo: { congigUi: { vendorRequestConfig: "N" } },
  license: {},
  contract: {},
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

const renderRequestDetails = (props = baseMockProps) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <RequestDetails {...props} />
      </MemoryRouter>
    </AppProviders>
  );

describe("RequestDetails", () => {
  beforeEach(() => {
    mockDispatch = jest.fn().mockReturnValue(Promise.resolve({}));
    mockHistoryPush.mockClear();
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
    const updateProps = {
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
    const { container } = renderRequestDetails(updateProps);
    expect(container.querySelector(".request-details")).toBeInTheDocument();
  });
});
