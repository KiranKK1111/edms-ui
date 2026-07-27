import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import SubscriptionManagement, {
  updateSubscription,
  getData,
} from "../../pages/subscriptionManagement/SubscriptionManagement";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useHistory: () => ({ push: jest.fn() }),
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock("../../store/actions/SubscriptionDataActions", () => ({
  getAllSubscriptionDataList: jest.fn(),
  getAllDataOwner: jest.fn(),
}));

jest.mock("../../store/actions/requestAccessActions", () => ({
  unsubscribe: jest.fn(),
}));

const {
  getAllSubscriptionDataList,
  getAllDataOwner,
} = require("../../store/actions/SubscriptionDataActions");
const { unsubscribe } = require("../../store/actions/requestAccessActions");

const makeSubscriptions = () => [
  {
    subscriptionId: "S1",
    requester: "alice",
    subscriptionType: "Individual Subscription",
    subscriber: "app-alpha",
    dataFeedId: "DF1",
    licensesSubscribed: 2,
    subscriptionStatus: "Active",
    createdOn: "2024-01-15T10:00:00",
    subscriptionUpdateFlag: "N",
  },
  {
    subscriptionId: "S2",
    requester: "bob",
    subscriptionType: "Application Subscription",
    subscriber: "app-beta",
    dataFeedId: "DF2",
    licensesSubscribed: 1,
    subscriptionStatus: "Pending",
    createdOn: null,
    subscriptionUpdateFlag: "Y",
  },
  {
    subscriptionId: "S3",
    requester: "carol",
    subscriptionType: "Individual Subscription",
    subscriber: "app-gamma",
    dataFeedId: "DF3",
    licensesSubscribed: 3,
    subscriptionStatus: "Rejected",
    createdOn: "2023-05-01T10:00:00",
    subscriptionUpdateFlag: "N",
  },
];

const owners = {
  agreementMgrBankIds: [
    {
      feedId: "DF1",
      agreementScbAgreementMgrBankId: "1111",
      datafeedShortName: "Feed One",
    },
  ],
};

const installDispatch = (subscriptions = makeSubscriptions(), dataOwners = owners) => {
  getAllSubscriptionDataList.mockReturnValue({ type: "GET_SUBS" });
  getAllDataOwner.mockReturnValue({ type: "GET_OWNERS" });
  mockDispatch.mockImplementation((action) => {
    if (action && action.type === "GET_SUBS") {
      return Promise.resolve(
        subscriptions ? { subscriptions } : subscriptions
      );
    }
    if (action && action.type === "GET_OWNERS") {
      return Promise.resolve(dataOwners);
    }
    return Promise.resolve();
  });
};

const renderPage = () =>
  render(
    <AppProviders>
      <SubscriptionManagement />
    </AppProviders>
  );

const getRowFor = async (text) => {
  const cell = await screen.findByText(text);
  return cell.closest("tr");
};

const openRowMenu = async (rowText) => {
  const row = await getRowFor(rowText);
  fireEvent.click(within(row).getByRole("button", { name: /More/ }));
  return await screen.findByRole("menu");
};

describe("SubscriptionManagement component", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    localStorage.setItem("currentUserRole", "Dataset Delegate");
    installDispatch();
    unsubscribe.mockResolvedValue({ data: { statusMessage: { code: 200 } } });
  });

  it("should render the subscriptions page", () => {
    const { container } = render(
      <AppProviders>
        <SubscriptionManagement />
      </AppProviders>
    );
    expect(container.querySelector(".subscriptions-page")).toBeInTheDocument();
  });

  it("should render the subscription count and enriched row data", async () => {
    renderPage();
    expect(
      await screen.findByText("Subscriptions (3)")
    ).toBeInTheDocument();
    expect(await screen.findByText("alice")).toBeInTheDocument();
    // data owner + feed name resolved from the owners list
    expect(screen.getByText("1111")).toBeInTheDocument();
    expect(screen.getByText("Feed One")).toBeInTheDocument();
    // formatted date and the No Expiry fallback
    expect(screen.getByText("15 Jan 2024")).toBeInTheDocument();
    expect(screen.getByText("No Expiry")).toBeInTheDocument();
  });

  it("should render status chips for green, pending and error statuses", async () => {
    renderPage();
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("should show the loader while subscriptions are being fetched", async () => {
    mockDispatch.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("should show the empty state when the response has no subscriptions", async () => {
    installDispatch([]);
    renderPage();
    expect(await screen.findByText("No Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Subscriptions (0)")).toBeInTheDocument();
  });

  it("should show the empty state when the fetch returns nothing", async () => {
    installDispatch(null);
    renderPage();
    expect(await screen.findByText("No Subscriptions")).toBeInTheDocument();
  });

  it("should disable the row actions for non dataset delegates", async () => {
    localStorage.setItem("currentUserRole", "Subscriber");
    renderPage();
    const row = await getRowFor("alice");
    expect(within(row).getByRole("button", { name: /More/ })).toBeDisabled();
  });

  it("should close the menu when Edit is clicked", async () => {
    renderPage();
    const menu = await openRowMenu("alice");
    fireEvent.click(within(menu).getByText("Edit"));
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    );
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it("should disable Unsubscribe for rejected subscriptions", async () => {
    renderPage();
    const menu = await openRowMenu("carol");
    expect(
      within(menu).getByText("Unsubscribe").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should unsubscribe after confirmation and show the success snackbar", async () => {
    renderPage();
    const menu = await openRowMenu("alice");
    fireEvent.click(within(menu).getByText("Unsubscribe"));
    expect(
      await screen.findByText("Unsubscribe from Data Feed?")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Unsubscribe" })
    );
    await waitFor(() => expect(unsubscribe).toHaveBeenCalled());
    const payload = unsubscribe.mock.calls[0][0];
    expect(payload.subscriptionStatus).toBe("Inactive");
    expect(payload.lastUpdatedBy).toBe("1234567");
    expect(payload.roleName).toBe("Dataset Delegate");
    expect(payload).not.toHaveProperty("dataOwner");
    expect(payload).not.toHaveProperty("datafeedName");
    expect(
      await screen.findByText("Unsubscribe request submitted successfully")
    ).toBeInTheDocument();
  });

  it("should not unsubscribe when the confirmation is cancelled", async () => {
    renderPage();
    const menu = await openRowMenu("alice");
    fireEvent.click(within(menu).getByText("Unsubscribe"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unsubscribe from Data Feed?")
      ).not.toBeInTheDocument()
    );
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it("should not show the success snackbar when the unsubscribe call fails", async () => {
    unsubscribe.mockResolvedValue({ data: {} });
    renderPage();
    const menu = await openRowMenu("alice");
    fireEvent.click(within(menu).getByText("Unsubscribe"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Unsubscribe" })
    );
    await waitFor(() => expect(unsubscribe).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.queryByText("Unsubscribe from Data Feed?")
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByText("Unsubscribe request submitted successfully")
    ).not.toBeInTheDocument();
  });

  it("should show the pending info dialog when an unsubscribe request already exists", async () => {
    renderPage();
    const menu = await openRowMenu("bob");
    fireEvent.click(within(menu).getByText("Unsubscribe"));
    expect(
      await screen.findByText(
        "An unsubscribe request for this Data Feed is already pending approval"
      )
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(unsubscribe).not.toHaveBeenCalled();
  });
});

describe("getData utility function", () => {
  const list = [
    {
      feedId: "DF202223021927841000",
      agreementScbAgreementMgrBankId: "1135744",
      datafeedShortName: "/UVT test feed /R4/",
    },
    {
      feedId: "DF202223021927841001",
      agreementScbAgreementMgrBankId: "1135756",
      datafeedShortName: "/UVT test feed /R5/",
    },
  ];

  it("should return correct datafeedShortName for matching feedId", () => {
    expect(getData(list, "DF202223021927841000", "datafeedShortName")).toBe(
      "/UVT test feed /R4/"
    );
  });

  it("should return correct agreementScbAgreementMgrBankId for matching feedId", () => {
    expect(
      getData(list, "DF202223021927841000", "agreementScbAgreementMgrBankId")
    ).toBe("1135744");
  });

  it("should return null for non-matching feedId", () => {
    expect(getData(list, "DF_NONEXISTENT", "datafeedShortName")).toBe(null);
  });

  it("should handle empty list", () => {
    expect(getData([], "DF202223021927841000", "datafeedShortName")).toBeFalsy();
  });

  it("should return null for non-existent type property", () => {
    expect(getData(list, "DF202223021927841000", "nonExistentField")).toBe(null);
  });

  it("should return correct value for second item", () => {
    expect(getData(list, "DF202223021927841001", "datafeedShortName")).toBe(
      "/UVT test feed /R5/"
    );
  });

  it("should return correct value for second item bankId", () => {
    expect(
      getData(list, "DF202223021927841001", "agreementScbAgreementMgrBankId")
    ).toBe("1135756");
  });
});

describe("updateSubscription utility function", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    localStorage.setItem("currentUserRole", "Admin");
  });

  it("should set subscriptionStatus to Inactive", () => {
    expect(updateSubscription({ subscriptionStatus: "Active" }).subscriptionStatus).toBe(
      "Inactive"
    );
  });

  it("should set lastUpdatedBy from localStorage", () => {
    expect(updateSubscription({ subscriptionStatus: "Active" }).lastUpdatedBy).toBe(
      "1234567"
    );
  });

  it("should set roleName from localStorage", () => {
    expect(updateSubscription({ subscriptionStatus: "Active" }).roleName).toBe("Admin");
  });

  it("should delete dataOwner property", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      dataOwner: "owner1",
    });
    expect(result.dataOwner).toBeUndefined();
  });

  it("should delete datafeedName property", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      datafeedName: "Feed1",
    });
    expect(result.datafeedName).toBeUndefined();
  });

  it("should return the modified subscription object", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      subscriptionId: "SUB001",
      dataOwner: "owner",
      datafeedName: "feed",
    });
    expect(result.subscriptionId).toBe("SUB001");
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });

  it("should handle subscription with Pending status", () => {
    expect(
      updateSubscription({ subscriptionStatus: "Pending" }).subscriptionStatus
    ).toBe("Inactive");
  });

  it("should handle subscription with all properties", () => {
    const result = updateSubscription({
      subscriptionStatus: "Active",
      subscriptionId: "SUB002",
      requester: "user1",
      subscriber: "sub1",
      dataFeedId: "DF001",
      dataOwner: "owner1",
      datafeedName: "feed1",
    });
    expect(result.subscriptionStatus).toBe("Inactive");
    expect(result.requester).toBe("user1");
    expect(result.subscriber).toBe("sub1");
    expect(result).not.toHaveProperty("dataOwner");
    expect(result).not.toHaveProperty("datafeedName");
  });
});
