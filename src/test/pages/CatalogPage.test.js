import React from "react";
import * as redux from "react-redux";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

const { startGetVendors } = require("../../store/actions/VendorActions");

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

const buildState = (items, loading = false) => ({
  catalogueList: {
    loading,
    catalogueList: items,
  },
});

let state;

const mockMatchMedia = (matches) => {
  window.matchMedia = (query) => ({
    matches,
    media: query || "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
};

const renderPage = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </AppProviders>
  );

const openInlineFilters = (container) => {
  fireEvent.click(container.querySelector("#btn-filter"));
  return screen.getByRole("button", { name: "Apply" });
};

const chooseSelectOption = (comboboxName, optionText) => {
  fireEvent.mouseDown(screen.getByRole("combobox", { name: comboboxName }));
  const listbox = screen.getByRole("listbox");
  fireEvent.click(within(listbox).getByText(optionText));
};

describe("CatalogPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Catalogue",
          objectName: "Filters button",
          permission: "RW",
        },
      ])
    );
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn() },
      configurable: true,
    });
    state = buildState([catalogueItem1, catalogueItem2]);
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(state));
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

  it("should fetch vendors for privileged entitlement types", () => {
    localStorage.setItem("entitlementType", "Dataset Owner");
    startGetVendors.mockImplementation(() => ({ type: "GET_VENDORS" }));
    renderPage();
    expect(startGetVendors).toHaveBeenCalledWith(true);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "GET_VENDORS" });
  });

  it("should not fetch vendors for subscriber entitlement", () => {
    localStorage.setItem("entitlementType", "Subscriber");
    renderPage();
    expect(startGetVendors).not.toHaveBeenCalled();
  });

  it("should show the loading spinner while the catalogue is loading", () => {
    state = buildState([], true);
    renderPage();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should show a spinner while the catalogue list is not yet available", async () => {
    // slice exists but the list has not arrived yet
    state = { catalogueList: { loading: false } };
    renderPage();
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });

  it("should show the empty state when there are no data feeds", () => {
    state = buildState([]);
    renderPage();
    expect(screen.getByText("No data feeds found")).toBeInTheDocument();
  });

  it("should exclude deleted feeds from the count", () => {
    state = buildState([
      catalogueItem1,
      { ...catalogueItem2, dataFeedId: "F3", dataFeedStatus: "Deleted" },
    ]);
    renderPage();
    expect(screen.getByText(/All Data Feeds \(1\)/)).toBeInTheDocument();
  });

  it("should filter feeds when searching and restore the list when cleared", async () => {
    renderPage();
    const input = screen.getByPlaceholderText(
      "Search data feeds, datasets, or data sources..."
    );
    fireEvent.change(input, { target: { value: "feed one" } });
    expect(
      await screen.findByText(/All Data Feeds \(1\)/, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(
      await screen.findByText(/All Data Feeds \(2\)/)
    ).toBeInTheDocument();
  });

  it("should show the empty state when the search has no matches", async () => {
    renderPage();
    const input = screen.getByPlaceholderText(
      "Search data feeds, datasets, or data sources..."
    );
    fireEvent.change(input, { target: { value: "zzz-nothing" } });
    expect(
      await screen.findByText(/All Data Feeds \(0\)/, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.getByText("No data feeds found")).toBeInTheDocument();
  });

  it("should search across dataset and feed id fields", async () => {
    renderPage();
    const input = screen.getByPlaceholderText(
      "Search data feeds, datasets, or data sources..."
    );
    fireEvent.change(input, { target: { value: "f2" } });
    expect(
      await screen.findByText(/All Data Feeds \(1\)/, {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it("should apply the subscribed toggle, datasource and status filters", async () => {
    const { container } = renderPage();
    openInlineFilters(container);
    fireEvent.click(screen.getByRole("button", { name: "Subscribed" }));
    chooseSelectOption("Data Source", "Entity1");
    chooseSelectOption("Data Feed Status", "Active");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(
      await screen.findByText(/All Data Feeds \(1\)/)
    ).toBeInTheDocument();
    // reset restores everything
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(
      await screen.findByText(/All Data Feeds \(2\)/)
    ).toBeInTheDocument();
  });

  it("should filter to unsubscribed feeds", async () => {
    const { container } = renderPage();
    openInlineFilters(container);
    fireEvent.click(screen.getByRole("button", { name: "Unsubscribed" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(
      await screen.findByText(/All Data Feeds \(1\)/)
    ).toBeInTheDocument();
  });

  it("should filter by status only and handle feeds without a status", async () => {
    state = buildState([
      catalogueItem1,
      catalogueItem2,
      { ...catalogueItem1, dataFeedId: "F9", dataFeedStatus: undefined },
    ]);
    const { container } = renderPage();
    openInlineFilters(container);
    chooseSelectOption("Data Feed Status", "Inactive");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    // item2 matches Inactive, item F9 has no status so the status check is skipped
    // and it falls through to the no-datafeeds branch
    expect(
      await screen.findByText(/All Data Feeds \(1\)/)
    ).toBeInTheDocument();
  });

  it("should paginate large lists and change the page size", async () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      ...catalogueItem1,
      dataFeedId: `FEED${i}`,
      dataFeedShortName: `DF${i}`,
    }));
    state = buildState(many);
    renderPage();
    expect(screen.getByText(/All Data Feeds \(15\)/)).toBeInTheDocument();
    // 12 cards on page 1
    expect(screen.getAllByTestId("mock-catalog").length).toBe(12);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    await waitFor(() =>
      expect(screen.getAllByTestId("mock-catalog").length).toBe(3)
    );
    // increase page size -> pagination disappears
    chooseSelectOption("Page size", "24");
    await waitFor(() =>
      expect(screen.getAllByTestId("mock-catalog").length).toBe(15)
    );
    expect(
      screen.queryByRole("button", { name: "Go to page 2" })
    ).not.toBeInTheDocument();
  });

  it("should open the access token dialog, copy the token and close it", async () => {
    localStorage.setItem("entitlementType", "Subscriber");
    localStorage.setItem("access_token", "fake-value-for-tests");
    renderPage();
    const tokenBtn = screen.getByRole("button", { name: "Access Token" });
    expect(tokenBtn).not.toBeDisabled();
    fireEvent.click(tokenBtn);
    expect(await screen.findByText("fake-value-for-tests")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy Token" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("fake-value-for-tests");
    expect(
      await screen.findByText("Access Token Copied Successfully!")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByText("fake-value-for-tests")).not.toBeInTheDocument()
    );
  });

  it("should close the access token dialog with the escape key", async () => {
    localStorage.setItem("entitlementType", "Subscriber");
    localStorage.setItem("access_token", "fake-value-esc");
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Access Token" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByText("fake-value-esc")).not.toBeInTheDocument()
    );
  });

  it("should disable the access token button for non subscribers", () => {
    localStorage.setItem("entitlementType", "Read Only");
    localStorage.setItem("guestRole", "guest");
    renderPage();
    expect(screen.getByRole("button", { name: "Access Token" })).toBeDisabled();
  });

  it("should open the mobile filter drawer and close it on apply", async () => {
    mockMatchMedia(true);
    const { container } = renderPage();
    fireEvent.click(container.querySelector("#btn-filter"));
    const applyBtn = await screen.findByRole("button", { name: "Apply" });
    fireEvent.click(applyBtn);
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Apply" })
      ).not.toBeInTheDocument()
    );
  });

  it("should close the mobile filter drawer with the close icon", async () => {
    mockMatchMedia(true);
    const { container } = renderPage();
    fireEvent.click(container.querySelector("#btn-filter"));
    await screen.findByRole("button", { name: "Apply" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Apply" })
      ).not.toBeInTheDocument()
    );
  });

  it("should close the mobile filter drawer with the escape key", async () => {
    mockMatchMedia(true);
    const { container } = renderPage();
    fireEvent.click(container.querySelector("#btn-filter"));
    const applyBtn = await screen.findByRole("button", { name: "Apply" });
    fireEvent.keyDown(applyBtn, { key: "Escape" });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Apply" })
      ).not.toBeInTheDocument()
    );
  });
});
