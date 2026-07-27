import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import Overview from "../../../components/dataset/Overview";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// DataTable wraps its real implementation in React.lazy + Suspense, which
// makes every table assertion race an async chunk resolution. Swap in the
// implementation directly so the table renders synchronously: the tests then
// wait on actual conditions rather than on elapsed time.
jest.mock("../../../design-system/DataTable", () => ({
  __esModule: true,
  default: require("../../../design-system/DataTableInner").default,
}));

let mockState = {};
let mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
const mockUseLocationValue = {
  pathname: "/testroute",
  search: "",
  hash: "",
  state: { data: { datafeedById: "" } },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockUseLocationValue,
  withRouter: (Component) => (props) =>
    <Component {...props} history={{ push: mockPush }} />,
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  getDatasetMetadataInfo: jest.fn(),
}));

const mockIsButtonObject = jest.fn();
jest.mock("../../../utils/accessButtonCheck", () => ({
  __esModule: true,
  default: (...args) => mockIsButtonObject(...args),
}));

const datafeedInfo = {
  datafeedById: {
    datafeed: {
      feedId: "DF001",
      longName: "Test Feed Long",
      shortName: "TFL",
      protocol: "SFTP",
      feedDescription: "Test feed description",
      dataConfidentiality: "Low",
      documentationLink: "http://docs.test.com",
      documentationFile: "doc.pdf",
      personalData: "No",
      feedStatus: "Active",
    },
  },
  metadata: {
    data: {
      isEnabled: true,
      sourceProcessor: "sftpProcessor",
      splittingCanonicalClass:
        "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      start: "2024-01-01",
      cronExpression: "0 30 6 ? * MON-FRI",
    },
  },
};

const dataFamily = {
  datasetById: {
    datasetId: "DS001",
    longName: "Test Dataset Long",
    shortName: "TDL",
    datasetDescription: "Test dataset description",
    datasetStatus: "Active",
    licenseId: "L001",
  },
};
const license = { licenseById: { licenseShortName: "TestLicense" } };
const relatedFeed = {
  datasetId: "DS001",
  dataFeedId: "DF002",
  dataFeedLongName: "Related Feed",
  entityShortName: "TestEntity",
  datasetShortName: "TDL",
  dataFeedDescription: "Related feed desc",
};
const catalogueList = { catalogueList: [relatedFeed] };

const buildState = (
  dfInfo = datafeedInfo,
  dfFamily = dataFamily,
  lic = license,
  catList = catalogueList
) => ({
  datafeedInfo: dfInfo,
  dataFamily: dfFamily,
  license: lic,
  catalogueList: catList,
});

const withMetadata = (metadata) => ({
  ...datafeedInfo,
  metadata: { data: { ...datafeedInfo.metadata.data, ...metadata } },
});

const withStatus = (datasetStatus) => ({
  datasetById: { ...dataFamily.datasetById, datasetStatus },
});

const renderOverview = () =>
  render(
    <AppProviders>
      <Overview />
    </AppProviders>
  );

const openDatasetDetails = () => {
  // the parent "Dataset details" item only expands, the child selects key 21
  const items = screen.getAllByRole("button", { name: "Dataset details" });
  fireEvent.click(items[items.length - 1]);
};

const openRelatedFeeds = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Related Data Feeds" }));
  await screen.findByRole("table");
};

describe("Overview", () => {
  beforeEach(() => {
    mockDispatch = jest.fn(() => Promise.resolve({}));
    mockPush.mockClear();
    mockIsButtonObject.mockReturnValue(false);
    localStorage.clear();
    mockState = buildState();
  });

  it("should render the main container", () => {
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Overview heading", () => {
    renderOverview();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("should render the side navigation items", () => {
    renderOverview();
    expect(screen.getAllByText("Data Feed details").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dataset details").length).toBeGreaterThanOrEqual(1);
  });

  it("should dispatch metadata fetch when a datafeedId exists", () => {
    renderOverview();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should render with empty datafeedInfo", () => {
    mockState = buildState(
      { datafeedById: {}, metadata: { data: {} } },
      dataFamily,
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should render with null licenseInfo", () => {
    mockState = buildState(datafeedInfo, dataFamily, { licenseById: null }, catalogueList);
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with null catalogueList", () => {
    mockState = buildState(datafeedInfo, dataFamily, license, { catalogueList: null });
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with a NA cron expression", () => {
    mockState = buildState(
      withMetadata({ cronExpression: "NA" }),
      dataFamily,
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with a pending dataset status", () => {
    mockState = buildState(datafeedInfo, withStatus("Pending"), license, catalogueList);
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the data feed details by default", () => {
    renderOverview();
    expect(screen.getByText("Data Feed ID")).toBeInTheDocument();
    expect(screen.getByText("DF001")).toBeInTheDocument();
    expect(screen.getByText("Test feed description")).toBeInTheDocument();
    expect(screen.getByText("SFTP")).toBeInTheDocument();
    expect(screen.getByText("xml")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should show HTTPS for a non sftp source processor", () => {
    mockState = buildState(
      withMetadata({ sourceProcessor: "httpProcessor" }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getByText("HTTPS")).toBeInTheDocument();
  });

  it("should map a json canonical class onto the json format", () => {
    mockState = buildState(
      withMetadata({ splittingCanonicalClass: "routes.JSONLValidateRoute" }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getByText("json")).toBeInTheDocument();
  });

  it("should map a csv canonical class onto the csv format", () => {
    mockState = buildState(
      withMetadata({ splittingCanonicalClass: "routes.CSVInitialRoute" }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getByText("csv")).toBeInTheDocument();
  });

  it("should fall back to NA for an unknown canonical class", () => {
    mockState = buildState(
      withMetadata({ splittingCanonicalClass: "routes.MysteryRoute" }),
      dataFamily,
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.textContent).toContain("NA");
  });

  it("should render a live streaming schedule as is", () => {
    mockState = buildState(
      withMetadata({ cronExpression: "livestreaming" }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getAllByText("livestreaming").length).toBe(2);
  });

  it("should render an interval cron as the frequency", () => {
    mockState = buildState(
      withMetadata({ cronExpression: "*/5 * * * *" }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getAllByText(/Every 5 minutes/i).length).toBeGreaterThan(0);
  });

  it("should render NA when there is no metadata at all", () => {
    mockState = buildState(
      { ...datafeedInfo, metadata: { data: null } },
      dataFamily,
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.textContent).toContain("NA");
  });

  it("should render an inactive configuration chip", () => {
    mockState = buildState(
      withMetadata({ isEnabled: false }),
      dataFamily,
      license,
      catalogueList
    );
    renderOverview();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should switch to the dataset details pane", () => {
    renderOverview();
    openDatasetDetails();
    expect(screen.getByText("Dataset ID")).toBeInTheDocument();
    expect(screen.getByText("DS001")).toBeInTheDocument();
    expect(screen.getByText("Test Dataset Long")).toBeInTheDocument();
    expect(screen.getByText("TestLicense")).toBeInTheDocument();
    expect(screen.queryByText("Related Data Feeds", { selector: "h3" })).toBeNull();
  });

  it("should render an expired dataset status chip", () => {
    mockState = buildState(datafeedInfo, withStatus("Expired"), license, catalogueList);
    renderOverview();
    openDatasetDetails();
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("should render NA for an unrecognised dataset status", () => {
    mockState = buildState(datafeedInfo, withStatus("Archived"), license, catalogueList);
    renderOverview();
    openDatasetDetails();
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });

  it("should render NA when the dataset has no status", () => {
    mockState = buildState(datafeedInfo, withStatus(undefined), license, catalogueList);
    renderOverview();
    openDatasetDetails();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render the related data feeds table", async () => {
    renderOverview();
    await openRelatedFeeds();
    expect(
      screen.getByRole("button", { name: "Related Feed" })
    ).toBeInTheDocument();
    expect(screen.getByText("TestEntity")).toBeInTheDocument();
    expect(screen.getByText("Related feed desc")).toBeInTheDocument();
  });

  it("should navigate to the related data feed detail page", async () => {
    renderOverview();
    await openRelatedFeeds();
    fireEvent.click(screen.getByRole("button", { name: "Related Feed" }));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/catalog/details",
      state: { data: relatedFeed },
    });
  });

  it("should navigate to the subscription form from Request Access", async () => {
    renderOverview();
    await openRelatedFeeds();
    const requestAccess = screen.getByRole("button", { name: "Request Access" });
    expect(requestAccess).toBeEnabled();
    fireEvent.click(requestAccess);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/catalog/subscription",
      state: { data: mockUseLocationValue.state.data },
    });
  });

  it("should disable Request Access for a guest user", async () => {
    localStorage.setItem("guestRole", "guest");
    renderOverview();
    await openRelatedFeeds();
    expect(screen.getByRole("button", { name: "Request Access" })).toBeDisabled();
  });

  it("should disable Request Access when the button permission is missing", async () => {
    mockIsButtonObject.mockReturnValue(true);
    renderOverview();
    await openRelatedFeeds();
    expect(screen.getByRole("button", { name: "Request Access" })).toBeDisabled();
  });

  it("should show a Subscribed chip for an active subscription", async () => {
    mockState = buildState(datafeedInfo, dataFamily, license, {
      catalogueList: [
        {
          ...relatedFeed,
          subscription: { subscriptionStatus: "Active" },
        },
      ],
    });
    renderOverview();
    await openRelatedFeeds();
    expect(screen.getByText("Subscribed")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Request Access" })
    ).not.toBeInTheDocument();
  });

  it("should show the raw status for a non active subscription", async () => {
    mockState = buildState(datafeedInfo, dataFamily, license, {
      catalogueList: [
        {
          ...relatedFeed,
          subscription: { subscriptionStatus: "Pending" },
        },
      ],
    });
    renderOverview();
    await openRelatedFeeds();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should offer Request Access again for an inactive subscription", async () => {
    mockState = buildState(datafeedInfo, dataFamily, license, {
      catalogueList: [
        {
          ...relatedFeed,
          subscription: { subscriptionStatus: "Inactive" },
        },
      ],
    });
    renderOverview();
    await openRelatedFeeds();
    expect(
      screen.getByRole("button", { name: "Request Access" })
    ).toBeInTheDocument();
  });

  it("should render an empty related feeds table when the dataset has no siblings", async () => {
    mockState = buildState(datafeedInfo, dataFamily, license, {
      catalogueList: [{ ...relatedFeed, dataFeedId: "DF001" }],
    });
    const { container } = renderOverview();
    await openRelatedFeeds();
    expect(
      screen.queryByRole("button", { name: "Related Feed" })
    ).not.toBeInTheDocument();
    // side-nav entry plus the content header
    expect(within(container).getAllByText("Related Data Feeds")).toHaveLength(2);
  });

  it("should clear the related feeds when the dataset has no id", async () => {
    mockState = buildState(
      datafeedInfo,
      { datasetById: { ...dataFamily.datasetById, datasetId: undefined } },
      license,
      catalogueList
    );
    renderOverview();
    await openRelatedFeeds();
    expect(
      screen.queryByRole("button", { name: "Related Feed" })
    ).not.toBeInTheDocument();
  });
});
