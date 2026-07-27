import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import SubscriptionsTab from "../../../components/dataset/SubscriptionsTab";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

let mockLocation = { state: { data: { subscription: null } } };
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockLocation,
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  subscriptionTabInfo: jest.fn(),
}));

jest.mock("../../../components/stringConversion", () => ({
  normalText: (text) =>
    text
      ? text.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
      : "",
}));

jest.mock("../../../components/requestAccess/DisplayTC", () => () => (
  <div data-testid="display-tc" />
));

const buildState = (subscriptionStatus = "active") => ({
  requestAccess: {
    businessRequirements: [
      { subscriptionType: "individual subscription", subscriptionVendorRequest: "yes" },
    ],
  },
  dataset: {
    subscriptionInfo: {
      data: {
        subscriptionStatus,
        subscriptionId: "SUB1",
        department: "IT",
        clarityId: "C1",
        licensesSubscribed: 5,
        subscriber: "User1",
        reason: "Need data",
        projectName: "Proj1",
        subscriptionType: "Annual",
      },
    },
  },
});

const renderTab = () =>
  render(
    <AppProviders>
      <SubscriptionsTab />
    </AppProviders>
  );

describe("SubscriptionsTab - no subscription", () => {
  beforeEach(() => {
    mockLocation = { state: { data: { subscription: null } } };
    mockState = buildState("active");
  });

  it("should render without crashing", () => {
    const { container } = renderTab();
    expect(container).toBeInTheDocument();
  });

  it("should show the not-subscribed message when no subscriptionId", () => {
    renderTab();
    expect(
      screen.getByText("You are not currently subscribed")
    ).toBeInTheDocument();
  });

  it("should NOT show the subscription details heading", () => {
    renderTab();
    expect(screen.queryByText("Subscription Details")).not.toBeInTheDocument();
  });
});

describe("SubscriptionsTab - with subscription", () => {
  beforeEach(() => {
    mockLocation = { state: { data: { subscription: { subscriptionId: "SUB1" } } } };
    mockState = buildState("active");
  });

  it("should render the Subscription Details heading", () => {
    renderTab();
    expect(screen.getByText("Subscription Details")).toBeInTheDocument();
  });

  it("should render the Business Requirements heading", () => {
    renderTab();
    expect(screen.getByText("Business Requirements")).toBeInTheDocument();
  });

  it("should render the DisplayTC component", () => {
    renderTab();
    expect(screen.getByTestId("display-tc")).toBeInTheDocument();
  });

  it("should NOT show the not-subscribed message", () => {
    renderTab();
    expect(
      screen.queryByText("You are not currently subscribed")
    ).not.toBeInTheDocument();
  });
});

describe("SubscriptionsTab - pending alert", () => {
  beforeEach(() => {
    mockLocation = { state: { data: { subscription: { subscriptionId: "SUB1" } } } };
  });

  it("should show a warning alert when status is pending", () => {
    mockState = buildState("pending");
    renderTab();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should NOT show an alert when status is active", () => {
    mockState = buildState("active");
    renderTab();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
