import React from "react";
import * as redux from "react-redux";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import DataSetData from "../../pages/masterData/DataSetData";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(),
  startUpdateDataFeed: jest.fn(),
  clearFeed: jest.fn(),
  formDataFn: jest.fn(),
}));
jest.mock("../../store/actions/datasetFormActions", () => ({
  datasetInfo: jest.fn(),
  startDataset: jest.fn(),
}));
jest.mock("../../store/actions/CatalogPageActions", () => ({
  allSubscriptionList: jest.fn(),
}));
jest.mock("../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(),
}));

const {
  startGetDatafeeds,
  startUpdateDataFeed,
  clearFeed,
  formDataFn,
} = require("../../store/actions/datafeedAction");
const {
  datasetInfo,
  startDataset,
} = require("../../store/actions/datasetFormActions");
const { allSubscriptionList } = require("../../store/actions/CatalogPageActions");
const { startGetDatasets } = require("../../store/actions/DatasetPageActions");

const makeDataset = (over = {}) => ({
  datasetId: "DS001",
  longName: "Test Dataset",
  shortName: "TD",
  licenseId: "L001",
  datasetStatus: "Active",
  entityId: "E001",
  datasetUpdateFlag: "N",
  ...over,
});

const makeFeed = (over = {}) => ({
  feedId: "F001",
  shortName: "TF",
  datasetId: "DS001",
  feedStatus: "Active",
  feedUpdateFlag: "N",
  isEnabled: true,
  ...over,
});

const datasetsInfo = [
  makeDataset(),
  makeDataset({
    datasetId: "DS002",
    longName: "Pending Dataset",
    shortName: "PD",
    datasetStatus: "Pending",
    datasetUpdateFlag: "Y",
  }),
];

const datafeedsInfo = [makeFeed()];

const licenses = [
  {
    licenseId: "L001",
    licenseLongName: "License One",
    licenseShortName: "L1",
    licenseStatus: "Active",
    licenseUpdateFlag: "N",
  },
];

const defaultProps = {
  datasetsInfo,
  datafeedsInfo,
  licenses,
  handleTabClick: jest.fn(),
  dataSetEntityId: "E001",
  vendorId: "V001",
  disableAllButtons: false,
};

let state;

// Probe that surfaces the current router location + state so tests can assert
// what a clicked Link put into history state.
const LocationProbe = () => {
  const location = useLocation();
  return (
    <div data-testid="location-probe" data-pathname={location.pathname}>
      {JSON.stringify(location.state || null)}
    </div>
  );
};

const renderPage = (props = {}) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <DataSetData {...defaultProps} {...props} />
        <LocationProbe />
      </MemoryRouter>
    </AppProviders>
  );

const openFirstMenu = async () => {
  const buttons = await screen.findAllByRole("button", { name: "More" });
  fireEvent.click(buttons[0]);
  return await screen.findByRole("menu");
};

const expandFirstRow = async () => {
  const buttons = await screen.findAllByRole("button", { name: "Expand" });
  fireEvent.click(buttons[0]);
  await screen.findByText("Data Feed Name");
};

const openFeedMenu = async () => {
  await expandFirstRow();
  const buttons = await screen.findAllByRole("button", { name: "More" });
  fireEvent.click(buttons[buttons.length - 1]);
  return await screen.findByRole("menu");
};

describe("DataSetData", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("psid", "user1");
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Masterdata",
          objectName: "Add Datafeed Button and Datafeed Pages",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Dataset Button and Dataset Pages",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Data feed Update and Edit/Deactivate button",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Dataset Deactivate/Delete button",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Documents For Dataset",
          permission: "RW",
        },
        {
          category: "Masterdata",
          objectName: "Add Documents For Datafeed",
          permission: "RW",
        },
      ])
    );
    state = { allSubscriptionList: { allSubscriptionList: [] } };
    mockDispatch.mockImplementation(() => Promise.resolve({ data: {} }));
    startUpdateDataFeed.mockImplementation(() =>
      Promise.resolve({ data: { ok: true } })
    );
    startGetDatafeeds.mockImplementation(() => ({ type: "GET_DATAFEEDS" }));
    clearFeed.mockImplementation(() => ({ type: "CLEAR_FEED" }));
    formDataFn.mockImplementation((p) => ({ type: "FORM_DATA", payload: p }));
    datasetInfo.mockImplementation((p) => ({ type: "DATASET_INFO", payload: p }));
    startDataset.mockImplementation((p) => ({ type: "START_DATASET", payload: p }));
    allSubscriptionList.mockImplementation(() => ({ type: "ALL_SUBS" }));
    startGetDatasets.mockImplementation(() => ({ type: "GET_DATASETS" }));
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((callback) => callback(state));
  });

  it("should render the main wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Dataset Name column header", () => {
    renderPage();
    expect(screen.getByText("Dataset Name")).toBeInTheDocument();
  });

  it("should render with empty datasetsInfo", () => {
    const { container } = renderPage({ datasetsInfo: [], datafeedsInfo: [] });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with undefined licenses", () => {
    const { container } = renderPage({ licenses: undefined });
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should dispatch clearFeed and allSubscriptionList on mount", () => {
    renderPage();
    expect(clearFeed).toHaveBeenCalled();
    expect(allSubscriptionList).toHaveBeenCalled();
  });

  it("should only show datasets for the current entity with matching licences", async () => {
    renderPage({
      datasetsInfo: [
        makeDataset(),
        makeDataset({
          datasetId: "DS777",
          shortName: "OtherEntityDS",
          entityId: "E999",
        }),
        makeDataset({
          datasetId: "DS888",
          shortName: "NoLicenceDS",
          licenseId: "L999",
        }),
      ],
    });
    expect(await screen.findByText("TD")).toBeInTheDocument();
    expect(screen.queryByText("OtherEntityDS")).not.toBeInTheDocument();
    expect(screen.queryByText("NoLicenceDS")).not.toBeInTheDocument();
    // licence short name shown in the Licence Name column
    expect(screen.getByText("L1")).toBeInTheDocument();
  });

  it("should render dataset status chips for green and warning statuses", async () => {
    renderPage();
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should navigate with isUpdate router state when the dataset name is clicked", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    fireEvent.click(await screen.findByText("TD"));
    expect(datasetInfo).toHaveBeenCalledWith(
      expect.objectContaining({ datasetId: "DS001" })
    );
    const probe = screen.getByTestId("location-probe");
    expect(probe).toHaveAttribute("data-pathname", "/masterData/L1/dataset");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isUpdate).toBe(true);
    expect(routerState.licence.datasetId).toBe("DS001");
  });

  it("should pass isUpdate and the record in state via the Edit menu item", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("Edit"));
    expect(datasetInfo).toHaveBeenCalledWith(
      expect.objectContaining({ datasetId: "DS001" })
    );
    const probe = screen.getByTestId("location-probe");
    expect(probe).toHaveAttribute("data-pathname", "/masterData/L1/dataset");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isUpdate).toBe(true);
    expect(routerState.licence.datasetId).toBe("DS001");
  });

  it("should pass isView state via the View menu item", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("View"));
    const probe = screen.getByTestId("location-probe");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isView).toBe(true);
    expect(routerState.licence.datasetId).toBe("DS001");
  });

  it("should link Documents to the dataset addDocuments page", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFirstMenu();
    expect(within(menu).getByText("Documents").closest("a")).toHaveAttribute(
      "href",
      "/masterData/DS001/addDocuments"
    );
  });

  it("should disable Documents when a pending dataset has no update flag", async () => {
    renderPage({
      datasetsInfo: [makeDataset({ datasetStatus: "Pending" })],
    });
    const menu = await openFirstMenu();
    expect(
      within(menu).getByText("Documents").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      within(menu).getByText("Deactivate").closest('[role="menuitem"]')
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should block dataset deactivation while feeds are active", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Unable to Deactivate Dataset!")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unable to Deactivate Dataset!")
      ).not.toBeInTheDocument()
    );
    expect(startDataset).not.toHaveBeenCalled();
  });

  it("should deactivate the dataset after confirmation", async () => {
    renderPage({ datasetsInfo: [makeDataset()], datafeedsInfo: [] });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(await screen.findByText("Deactivate Dataset?")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(startDataset).toHaveBeenCalled());
    const payload = startDataset.mock.calls[0][0];
    expect(payload.datasetStatus).toBe("Deactivate");
    expect(payload.datasetUpdateFlag).toBe("N");
    expect(payload.isUpdate).toBe(true);
    expect(payload.lastUpdatedBy).toBe("user1");
    expect(payload).not.toHaveProperty("licenseName");
    expect(payload).not.toHaveProperty("dataFeeds");
    expect(
      await screen.findByText("Dataset deactivated successfully.")
    ).toBeInTheDocument();
    expect(startGetDatasets).toHaveBeenCalled();
  });

  it("should not deactivate the dataset when cancelled", async () => {
    renderPage({ datasetsInfo: [makeDataset()], datafeedsInfo: [] });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Deactivate Dataset?")).not.toBeInTheDocument()
    );
    expect(startDataset).not.toHaveBeenCalled();
  });

  it("should show the pending-change notice when deactivating a dataset with update flag Y", async () => {
    renderPage({
      datasetsInfo: [makeDataset({ datasetUpdateFlag: "Y" })],
      datafeedsInfo: [],
    });
    const menu = await openFirstMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("This is already submitted")
    ).toBeInTheDocument();
    expect(startDataset).not.toHaveBeenCalled();
  });

  it("should enable Add Feeds for active datasets and carry the dataset in state", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const addFeeds = await screen.findByRole("link", { name: "Add Feeds" });
    expect(addFeeds).toHaveAttribute("href", "/masterData/TD/datafeed");
    fireEvent.click(addFeeds);
    const probe = screen.getByTestId("location-probe");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isUpdate).toBe(false);
    expect(routerState.dataset.datasetId).toBe("DS001");
  });

  it("should disable Add Feeds for pending datasets", async () => {
    renderPage({
      datasetsInfo: [makeDataset({ datasetStatus: "Pending" })],
    });
    await screen.findByText("TD");
    const addFeeds = screen.getByText("Add Feeds").closest("a,button");
    expect(addFeeds).toHaveAttribute("aria-disabled", "true");
  });

  it("should render the data feed sub-table with feed details", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    await expandFirstRow();
    // header column "Data Feeds" plus the sub-table heading
    expect(screen.getAllByText("Data Feeds").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("F001")).toBeInTheDocument();
    const feedLink = screen.getByText("TF");
    expect(feedLink.closest("a")).toHaveAttribute(
      "href",
      "/masterData/TD/viewDatafeed"
    );
    fireEvent.click(feedLink);
    expect(formDataFn).toHaveBeenCalledWith(
      expect.objectContaining({ feedId: "F001" })
    );
    const probe = screen.getByTestId("location-probe");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isView).toBe(true);
    expect(routerState.datafeedRecord.feedId).toBe("F001");
  });

  it("should warn when clicking a feed name with a pending change", async () => {
    renderPage({
      datasetsInfo: [makeDataset()],
      datafeedsInfo: [makeFeed({ feedUpdateFlag: "Y" })],
    });
    await expandFirstRow();
    fireEvent.click(screen.getByText("TF"));
    expect(
      await screen.findByText("This is already submitted")
    ).toBeInTheDocument();
  });

  it("should render feed status and configuration chips across variants", async () => {
    renderPage({
      datasetsInfo: [makeDataset()],
      datafeedsInfo: [
        makeFeed(),
        makeFeed({
          feedId: "F002",
          shortName: "TF2",
          feedStatus: "Inactive",
          isEnabled: false,
        }),
        makeFeed({
          feedId: "F003",
          shortName: "TF3",
          feedStatus: "Expired",
          isEnabled: undefined,
        }),
        makeFeed({
          feedId: "F004",
          shortName: "TF4",
          feedStatus: "Pending",
        }),
        makeFeed({
          feedId: "F005",
          shortName: "TF5",
          feedStatus: "Suspended",
        }),
      ],
    });
    await expandFirstRow();
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
    expect(screen.getByText("NA")).toBeInTheDocument();
    expect(screen.getAllByText("Inactive").length).toBeGreaterThanOrEqual(2);
  });

  it("should open the feed edit page with update state from the Edit button", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    await expandFirstRow();
    const edit = screen.getByRole("link", { name: "Edit" });
    expect(edit).toHaveAttribute("href", "/masterData/TD/datafeed");
    fireEvent.click(edit);
    expect(formDataFn).toHaveBeenCalledWith(
      expect.objectContaining({ feedId: "F001" })
    );
    const probe = screen.getByTestId("location-probe");
    const routerState = JSON.parse(probe.textContent);
    expect(routerState.isUpdate).toBe(true);
    expect(routerState.fromLink).toBe("updatePage");
    expect(routerState.dataset.datasetId).toBe("DS001");
  });

  it("should warn from the feed Edit button when a change is pending", async () => {
    renderPage({
      datasetsInfo: [makeDataset()],
      datafeedsInfo: [makeFeed({ feedUpdateFlag: "Y" })],
    });
    await expandFirstRow();
    fireEvent.click(screen.getByRole("link", { name: "Edit" }));
    expect(
      await screen.findByText("This is already submitted")
    ).toBeInTheDocument();
  });

  it("should block feed deactivation when subscriptions are active", async () => {
    state = {
      allSubscriptionList: {
        allSubscriptionList: [
          { dataFeedId: "F001", subscriptionStatus: "Active" },
        ],
      },
    };
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFeedMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Unable to deactivate Data Feed!")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Ok" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Unable to deactivate Data Feed!")
      ).not.toBeInTheDocument()
    );
    expect(startUpdateDataFeed).not.toHaveBeenCalled();
  });

  it("should deactivate the data feed after confirmation", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFeedMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("Deactivate Data Feed?")
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(startUpdateDataFeed).toHaveBeenCalled());
    const payload = startUpdateDataFeed.mock.calls[0][0];
    expect(payload.feedStatus).toBe("Deactivate");
    expect(payload.feedUpdateFlag).toBe("Y");
    expect(payload.lastUpdatedBy).toBe("user1");
    expect(payload).not.toHaveProperty("key");
    expect(
      await screen.findByText(
        "Data Feed deactivation request submitted successfully."
      )
    ).toBeInTheDocument();
    expect(startGetDatafeeds).toHaveBeenCalled();
  });

  it("should not deactivate the data feed when cancelled", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFeedMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Deactivate Data Feed?")
      ).not.toBeInTheDocument()
    );
    expect(startUpdateDataFeed).not.toHaveBeenCalled();
  });

  it("should show the pending notice when deactivating a feed with update flag Y", async () => {
    renderPage({
      datasetsInfo: [makeDataset()],
      datafeedsInfo: [makeFeed({ feedUpdateFlag: "Y" })],
    });
    const menu = await openFeedMenu();
    fireEvent.click(within(menu).getByText("Deactivate"));
    expect(
      await screen.findByText("This is already submitted")
    ).toBeInTheDocument();
    expect(startUpdateDataFeed).not.toHaveBeenCalled();
  });

  it("should disable feed Deactivate, Documents and Configuration for inactive feeds", async () => {
    renderPage({
      datasetsInfo: [makeDataset()],
      datafeedsInfo: [makeFeed({ feedStatus: "Inactive" })],
    });
    const menu = await openFeedMenu();
    ["Deactivate", "Documents", "Configuration"].forEach((label) => {
      expect(
        within(menu).getByText(label).closest('[role="menuitem"]')
      ).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("should store feed details in sessionStorage from the Configuration menu item", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFeedMenu();
    const config = within(menu).getByText("Configuration");
    expect(config.closest("a")).toHaveAttribute(
      "href",
      "/masterData/F001/addConfiguration"
    );
    fireEvent.click(config);
    expect(sessionStorage.getItem("feedShortName")).toBe("TF");
    expect(sessionStorage.getItem("feedStatus")).toBe("Active");
  });

  it("should link feed Documents to the addDocuments page", async () => {
    renderPage({ datasetsInfo: [makeDataset()] });
    const menu = await openFeedMenu();
    expect(within(menu).getByText("Documents").closest("a")).toHaveAttribute(
      "href",
      "/masterData/F001/addDocuments"
    );
  });
});
