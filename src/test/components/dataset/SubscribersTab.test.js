import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import SubscribersTab from "../../../components/dataset/SubscribersTab";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({ state: { data: { dataFeedId: "F1" } } }),
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  getSubscribers: jest.fn(),
  deleteSubscriber: jest.fn(),
}));

const {
  getSubscribers,
  deleteSubscriber,
} = require("../../../store/actions/DatasetPageActions");

const makeSubscribers = () => [
  {
    dataFeedId: "F1",
    subscriptionId: "S1",
    requester: "User1",
    subscriptionType: "Individual Subscription",
    subscriber: "SubOne",
    subscriptionStatus: "active",
    createdOn: "2024-02-10T08:00:00",
    licensesSubscribed: 3,
    department: "IT",
    clarityId: "C123",
    projectName: "ProjectX",
    reason: "Research",
  },
  {
    dataFeedId: "F1",
    subscriptionId: "S2",
    requester: "User2",
    subscriptionType: "Application Subscription",
    subscriber: "SubTwo",
    subscriptionStatus: "pending",
    createdOn: null,
    licensesSubscribed: 1,
    department: "Ops",
    clarityId: "C456",
    projectName: "ProjectY",
    reason: "Reporting",
  },
  {
    dataFeedId: "F1",
    subscriptionId: "S3",
    requester: "User3",
    subscriptionType: "Individual Subscription",
    subscriber: "SubThree",
    subscriptionStatus: "Inactive",
    createdOn: "2023-06-01T08:00:00",
    licensesSubscribed: 1,
  },
  {
    dataFeedId: "OTHER-FEED",
    subscriptionId: "S9",
    requester: "Ghost",
  },
];

const buildState = (data = []) => ({
  dataset: { subscribers: { data } },
});

let deleteResult;

const installDispatch = () => {
  getSubscribers.mockReturnValue({ type: "GET_SUBS" });
  deleteSubscriber.mockImplementation((payload) => ({
    type: "DELETE_SUB",
    payload,
  }));
  mockDispatch.mockImplementation((action) => {
    if (action && action.type === "GET_SUBS") {
      return Promise.resolve({ status: 200, data: {} });
    }
    if (action && action.type === "DELETE_SUB") {
      return Promise.resolve(deleteResult);
    }
    return Promise.resolve({});
  });
};

const renderTab = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <SubscribersTab />
      </MemoryRouter>
    </AppProviders>
  );

const getRowFor = async (text) => {
  const cell = await screen.findByText(text);
  return cell.closest("tr");
};

const openDeactivateDialog = async (requester) => {
  const row = await getRowFor(requester);
  fireEvent.click(within(row).getByRole("button", { name: /Deactivate/ }));
  await screen.findByText("Unsubscribe from data feed?");
  return screen.getByRole("dialog");
};

const closeDialogAndWait = async () => {
  await waitFor(() =>
    expect(
      screen.queryByText("Unsubscribe from data feed?")
    ).not.toBeInTheDocument()
  );
};

describe("SubscribersTab", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "tester-psid");
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Catalogue",
          objectName: "Request Access or Unsubscribe and Modify Access Button",
          permission: "RW",
        },
      ])
    );
    deleteResult = { data: { ok: true } };
    installDispatch();
    mockState = buildState(makeSubscribers());
  });

  it("should render a loading card before data is fetched", () => {
    mockState = buildState([]);
    renderTab();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should keep showing the loading card when the fetch fails", async () => {
    mockDispatch.mockImplementation(() => Promise.resolve({ status: 500 }));
    renderTab();
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render the Subscribers heading once data is loaded", async () => {
    renderTab();
    expect(await screen.findByText("Subscribers")).toBeInTheDocument();
  });

  it("should show 'No Subscribers' when the list is empty for this feed", async () => {
    mockState = buildState([{ dataFeedId: "OTHER", subscriptionId: "S2" }]);
    renderTab();
    expect(await screen.findByText("No Subscribers")).toBeInTheDocument();
  });

  it("should only render subscribers of the current data feed", async () => {
    renderTab();
    expect(await screen.findByText("User1")).toBeInTheDocument();
    expect(screen.getByText("User2")).toBeInTheDocument();
    expect(screen.getByText("User3")).toBeInTheDocument();
    expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
  });

  it("should render status chips and the formatted subscription date", async () => {
    renderTab();
    expect(await screen.findByText("active")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("10 Feb 2024")).toBeInTheDocument();
  });

  it("should disable Deactivate for inactive subscriptions", async () => {
    renderTab();
    const inactiveRow = await getRowFor("User3");
    expect(
      within(inactiveRow).getByRole("button", { name: /Deactivate/ })
    ).toBeDisabled();
    const activeRow = await getRowFor("User1");
    expect(
      within(activeRow).getByRole("button", { name: /Deactivate/ })
    ).not.toBeDisabled();
  });

  it("should disable Deactivate when the permission matrix denies it", async () => {
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Catalogue",
          objectName: "Request Access or Unsubscribe and Modify Access Button",
          permission: "R",
        },
      ])
    );
    renderTab();
    const row = await getRowFor("User1");
    expect(
      within(row).getByRole("button", { name: /Deactivate/ })
    ).toBeDisabled();
  });

  it("should expand a row and show the subscription details", async () => {
    renderTab();
    const row = await getRowFor("User1");
    fireEvent.click(within(row).getByRole("button", { name: /Expand/i }));
    expect(
      (await screen.findAllByText("Subscription Details")).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("IT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("C123").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Research").length).toBeGreaterThan(0);
  });

  it("should warn about multiple end users in the deactivation dialog", async () => {
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User1");
    expect(
      within(dialog).getByText(/more than 1 end user/)
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await closeDialogAndWait();
  });

  it("should not warn about end users for single licence subscriptions", async () => {
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User2");
    expect(
      within(dialog).queryByText(/more than 1 end user/)
    ).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await closeDialogAndWait();
  });

  it("should deactivate the subscriber after confirmation", async () => {
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(deleteSubscriber).toHaveBeenCalled());
    const payload = deleteSubscriber.mock.calls[0][0];
    expect(payload.subscriptionId).toBe("S1");
    expect(payload.subscriptionStatus).toBe("Inactive");
    expect(payload.lastUpdatedBy).toBe("tester-psid");
    expect(
      await screen.findByText("Subscriber deactivated successfully!")
    ).toBeInTheDocument();
    // list is refetched after a successful delete
    await waitFor(() =>
      expect(getSubscribers.mock.calls.length).toBeGreaterThan(1)
    );
    await closeDialogAndWait();
  });

  it("should not deactivate when the dialog is cancelled", async () => {
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await closeDialogAndWait();
    expect(deleteSubscriber).not.toHaveBeenCalled();
  });

  it("should surface the API error message when the delete fails", async () => {
    deleteResult = { message: "Deactivation failed" };
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(
      await screen.findByText("Deactivation failed")
    ).toBeInTheDocument();
    await closeDialogAndWait();
  });

  it("should show no snackbar when the delete response is empty", async () => {
    deleteResult = {};
    renderTab();
    await screen.findByText("Subscribers");
    const dialog = await openDeactivateDialog("User1");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(deleteSubscriber).toHaveBeenCalled());
    await closeDialogAndWait();
    expect(
      screen.queryByText("Subscriber deactivated successfully!")
    ).not.toBeInTheDocument();
  });
});
