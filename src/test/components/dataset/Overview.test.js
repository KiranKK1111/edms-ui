import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import Overview from "../../../components/dataset/Overview";

let mockState = {};
const mockDispatch = jest.fn(() => Promise.resolve({}));
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
const catalogueList = {
  catalogueList: [
    {
      datasetId: "DS001",
      dataFeedId: "DF002",
      dataFeedLongName: "Related Feed",
      entityShortName: "TestEntity",
      datasetShortName: "TDL",
      dataFeedDescription: "Related feed desc",
    },
  ],
};

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

const renderOverview = () =>
  render(
    <AppProviders>
      <Overview />
    </AppProviders>
  );

describe("Overview", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
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
      {
        ...datafeedInfo,
        metadata: { data: { ...datafeedInfo.metadata.data, cronExpression: "NA" } },
      },
      dataFamily,
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render with a pending dataset status", () => {
    mockState = buildState(
      datafeedInfo,
      { datasetById: { ...dataFamily.datasetById, datasetStatus: "Pending" } },
      license,
      catalogueList
    );
    const { container } = renderOverview();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });
});
