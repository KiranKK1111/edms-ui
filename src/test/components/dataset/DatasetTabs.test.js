import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import DatasetTabs from "../../../components/dataset/DatasetTabs";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// Mock the tab content children — DatasetTabs only owns the tab strip + alert.
jest.mock("../../../components/dataset/Overview", () => () => (
  <div data-testid="overview" />
));
jest.mock("../../../components/dataset/LicenceScope", () => () => (
  <div data-testid="licence-scope" />
));
jest.mock("../../../components/dataset/SubscribersTab", () => () => (
  <div data-testid="subscribers" />
));
jest.mock("../../../components/dataset/SubscriptionsTab", () => () => (
  <div data-testid="subscriptions" />
));
jest.mock("../../../components/dataset/DocumentationTab", () => () => (
  <div data-testid="documentation" />
));
jest.mock("../../../components/dataset/MetadataTab", () => () => (
  <div data-testid="metadata" />
));

const mockIsButtonObject = jest.fn();
const mockGetPermissionObject = jest.fn();
jest.mock("../../../utils/accessButtonCheck", () => (...args) =>
  mockIsButtonObject(...args)
);
jest.mock("../../../utils/accessObject", () => (...args) =>
  mockGetPermissionObject(...args)
);

const baseProps = {
  dataFamily: { loading: false },
  license: { loading: false, data: {} },
  contract: { loading: false },
  vendor: { loading: false, data: {} },
  sourceConfig: { loading: false },
  datafeedStatus: "Active",
  catalogueObj: {},
};

describe("DatasetTabs", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("entitlementType", "Admin");
    mockIsButtonObject.mockReturnValue(false);
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
  });

  it("should render a skeleton when dataFamily is loading", () => {
    const { container } = renderWithProviders(
      <DatasetTabs {...baseProps} dataFamily={{ loading: true }} />
    );
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Overview" })).not.toBeInTheDocument();
  });

  it("should render the default tabs when nothing is loading", () => {
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Licence scope" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Schema" })).toBeInTheDocument();
  });

  it("should disable the Overview tab when isButtonObject returns false", () => {
    mockIsButtonObject.mockReturnValue(false);
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeDisabled();
  });

  it("should enable the Overview tab when isButtonObject returns true", () => {
    mockIsButtonObject.mockReturnValue(true);
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(screen.getByRole("tab", { name: "Overview" })).not.toBeDisabled();
  });

  it("should show a warning alert when datafeedStatus is pending", () => {
    renderWithProviders(<DatasetTabs {...baseProps} datafeedStatus="pending" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should NOT show an alert when datafeedStatus is Active", () => {
    renderWithProviders(<DatasetTabs {...baseProps} datafeedStatus="Active" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should render My Subscriptions tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(
      screen.getByRole("tab", { name: "My Subscriptions" })
    ).toBeInTheDocument();
  });

  it("should NOT render My Subscriptions tab when permission object is null", () => {
    mockGetPermissionObject.mockReturnValue(null);
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(
      screen.queryByRole("tab", { name: "My Subscriptions" })
    ).not.toBeInTheDocument();
  });

  it("should render Subscribers tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(screen.getByRole("tab", { name: "Subscribers" })).toBeInTheDocument();
  });

  it("should NOT render Subscribers tab when permission is RW", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "RW" });
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(
      screen.queryByRole("tab", { name: "Subscribers" })
    ).not.toBeInTheDocument();
  });

  it("should render Documentation tab when permission is R", () => {
    mockGetPermissionObject.mockReturnValue({ permission: "R" });
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(
      screen.getByRole("tab", { name: "Documentation" })
    ).toBeInTheDocument();
  });

  it("should render Documentation tab for a guest role with no entitlement", () => {
    localStorage.removeItem("entitlementType");
    localStorage.setItem("guestRole", "Guest");
    mockGetPermissionObject.mockReturnValue(null);
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(
      screen.getByRole("tab", { name: "Documentation" })
    ).toBeInTheDocument();
  });

  it("should render the active Overview tab content", () => {
    renderWithProviders(<DatasetTabs {...baseProps} />);
    expect(screen.getByTestId("overview")).toBeInTheDocument();
  });
});
