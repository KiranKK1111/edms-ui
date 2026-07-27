import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppProviders from "../../../design-system/AppProviders";
import Catalog from "../../../components/catalog/Catalog";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

const defaultCatalogueInfo = {
  entityShortName: "TestEntity",
  datasetShortName: "TestDataset",
  dataFeedLongName: "Test Data Feed Long Name",
  dataFeedStatus: "Active",
  dataFeedDescription: "Test description",
  subscription: { subscriptionStatus: "Active" },
};

const renderCatalog = (catalogueInfo) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <Catalog catalogueInfo={catalogueInfo} />
      </MemoryRouter>
    </AppProviders>
  );

describe("Catalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render a Card component", () => {
    const { container } = renderCatalog(defaultCatalogueInfo);
    expect(container.querySelector(".catalog-card")).toBeInTheDocument();
  });

  it("should display entity short name", () => {
    renderCatalog(defaultCatalogueInfo);
    expect(screen.getByText("TestEntity")).toBeInTheDocument();
  });

  it("should display dataset short name", () => {
    renderCatalog(defaultCatalogueInfo);
    expect(screen.getByText("TestDataset")).toBeInTheDocument();
  });

  it("should display data feed long name", () => {
    renderCatalog(defaultCatalogueInfo);
    expect(screen.getByText("Test Data Feed Long Name")).toBeInTheDocument();
  });

  it("should display Subscribed tag for active subscription", () => {
    const { container } = renderCatalog(defaultCatalogueInfo);
    expect(container.querySelectorAll(".MuiChip-root").length).toBe(1);
    expect(screen.getByText("Subscribed")).toBeInTheDocument();
  });

  it("should display Pending tag for pending subscription", () => {
    renderCatalog({
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Pending" },
    });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should display Expired tag for expired subscription", () => {
    renderCatalog({
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Expired" },
    });
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("should display Request Access button for unknown subscription status", () => {
    renderCatalog({
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Unknown" },
    });
    expect(screen.getByText("Request Access")).toBeInTheDocument();
  });

  it("should display Request Access when no subscription", () => {
    renderCatalog({
      ...defaultCatalogueInfo,
      subscription: null,
    });
    expect(screen.getByText("Request Access")).toBeInTheDocument();
  });

  it("should show dash when entityShortName is empty", () => {
    const { container } = renderCatalog({
      ...defaultCatalogueInfo,
      entityShortName: "",
    });
    expect(container.querySelector(".catalog-source-chip").textContent).toContain(
      "-"
    );
  });

  it("should show dash when datasetShortName is empty", () => {
    const { container } = renderCatalog({
      ...defaultCatalogueInfo,
      datasetShortName: "",
    });
    expect(container.querySelector(".catlog-dataset").textContent).toContain("-");
  });

  it("should render for guest role with tooltip", () => {
    localStorage.setItem("guestRole", "guest");
    renderCatalog(defaultCatalogueInfo);
    expect(screen.getByText("Request Access")).toBeInTheDocument();
  });

  it("should render the status tag for inactive feed status", () => {
    renderCatalog({
      ...defaultCatalogueInfo,
      dataFeedStatus: "Inactive",
    });
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.queryByText("Subscribed")).not.toBeInTheDocument();
  });

  it("should have catalog-card className", () => {
    const { container } = renderCatalog(defaultCatalogueInfo);
    expect(
      container.querySelectorAll(".catalog-card").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should dispatch clearStore on mount", () => {
    renderCatalog(defaultCatalogueInfo);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
