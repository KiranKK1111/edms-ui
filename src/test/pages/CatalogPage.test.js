import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import CatalogPage from "../../pages/catalogPage/CatalogPage";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("../../store/actions/CatalogPageActions", () => ({
  newCataloguePageData: jest.fn(),
}));

jest.mock("../../store/actions/VendorActions", () => ({
  startGetVendors: jest.fn(),
}));

jest.mock("../../components/catalog/Catalog", () => () => (
  <div data-testid="mock-catalog" />
));

const catalogueItem1 = {
  entityShortName: "Entity1",
  datasetShortName: "Dataset1",
  dataFeedLongName: "Feed One",
  dataFeedDescription: "Description of Feed One",
  dataFeedId: "F1",
  dataFeedShortName: "DF1",
  dataFeedStatus: "Active",
  subscription: true,
};

const catalogueItem2 = {
  entityShortName: "Entity2",
  datasetShortName: "Dataset2",
  dataFeedLongName: "Feed Two",
  dataFeedDescription: "Description of Feed Two",
  dataFeedId: "F2",
  dataFeedShortName: "DF2",
  dataFeedStatus: "Inactive",
  subscription: false,
};

const populatedState = {
  catalogueList: {
    loading: false,
    catalogueList: [catalogueItem1, catalogueItem2],
  },
};

const renderPage = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </AppProviders>
  );

describe("CatalogPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(populatedState));
  });

  it("should render the main container", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the catalog page", () => {
    const { container } = renderPage();
    expect(container.querySelector(".catalog-page")).toBeInTheDocument();
  });

  it("should render the filter button", () => {
    const { container } = renderPage();
    expect(container.querySelector("#btn-filter")).toBeInTheDocument();
  });

  it("should render the feed count title", () => {
    renderPage();
    expect(screen.getByText(/All Data Feeds \(2\)/)).toBeInTheDocument();
  });

  it("should render the data feed cards", () => {
    renderPage();
    expect(screen.getAllByTestId("mock-catalog").length).toBe(2);
  });

  it("should toggle the inline filters when the filter button is clicked", () => {
    localStorage.setItem("guestRole", "guest");
    const { container } = renderPage();
    fireEvent.click(container.querySelector("#btn-filter"));
    expect(screen.getByRole("button", { name: /Apply/i })).toBeInTheDocument();
  });
});
