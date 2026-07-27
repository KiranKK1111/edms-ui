import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import SubscribersTab from "../../../components/dataset/SubscribersTab";

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

const buildState = (data = []) => ({
  dataset: { subscribers: { data } },
});

const renderTab = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <SubscribersTab />
      </MemoryRouter>
    </AppProviders>
  );

describe("SubscribersTab", () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() =>
      Promise.resolve({ status: 200, data: {} })
    );
  });

  it("should render a loading card before data is fetched", () => {
    mockState = buildState([]);
    renderTab();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render the Subscribers heading once data is loaded", async () => {
    mockState = buildState([
      {
        dataFeedId: "F1",
        requester: "User1",
        subscriptionType: "Team",
        subscriber: "Sub1",
        subscriptionStatus: "active",
        subscriptionId: "S1",
      },
    ]);
    renderTab();
    expect(await screen.findByText("Subscribers")).toBeInTheDocument();
  });

  it("should show 'No Subscribers' when the list is empty for this feed", async () => {
    mockState = buildState([
      { dataFeedId: "OTHER", subscriptionId: "S2" },
    ]);
    renderTab();
    expect(await screen.findByText("No Subscribers")).toBeInTheDocument();
  });
});
