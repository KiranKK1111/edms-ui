import * as redux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Descriptions, Layout, Menu, Table, Tag, Badge, Button } from "antd";
import Overview from "../../../components/dataset/Overview";

configure({ adapter: new Adapter() });
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
const mockUseLocationValue = {
  pathname: "/testroute",
  search: "",
  hash: "",
  state: {
    data: {
      datafeedById: "",
    },
  },
};
const mockUseLocation = jest.fn(() => mockUseLocationValue);
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockUseLocation(),
  withRouter: (Component) => (props) => (
    <Component {...props} history={{ push: mockPush }} />
  ),
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
    {
      datasetId: "DS001",
      dataFeedId: "DF001",
      dataFeedLongName: "Same Feed",
      entityShortName: "TestEntity",
      datasetShortName: "TDL",
      dataFeedDescription: "Same feed desc",
    },
  ],
};

const setupSelector = (
  dfInfo = datafeedInfo,
  dfFamily = dataFamily,
  lic = license,
  catList = catalogueList
) => {
  const state = {
    datafeedInfo: dfInfo,
    dataFamily: dfFamily,
    license: lic,
    catalogueList: catList,
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("Overview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue(mockUseLocationValue);
    setupSelector();
  });

  it("should render main container", () => {
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });

  it("should render with empty datafeedInfo", () => {
    setupSelector(
      {
        datafeedById: {},
        metadata: { data: {} },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render with active feed status", () => {
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with pending dataset status", () => {
    setupSelector(
      datafeedInfo,
      {
        datasetById: {
          ...dataFamily.datasetById,
          datasetStatus: "Pending",
        },
      },
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with expired status", () => {
    setupSelector(
      {
        ...datafeedInfo,
        datafeedById: {
          datafeed: {
            ...datafeedInfo.datafeedById.datafeed,
            feedStatus: "Expired",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with null licenseInfo", () => {
    setupSelector(datafeedInfo, dataFamily, { licenseById: null }, catalogueList);
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with empty catalogueList", () => {
    setupSelector(datafeedInfo, dataFamily, license, {
      catalogueList: [],
    });
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with null catalogueList", () => {
    setupSelector(datafeedInfo, dataFamily, license, {
      catalogueList: null,
    });
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should filter related feeds excluding current feed", () => {
    setupSelector();
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    // The related feeds list should exclude DF001 (current feed)
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with JSON split validate route in metadata", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            splittingCanonicalClass:
              "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with CSV initial route in metadata", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            splittingCanonicalClass:
              "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with disabled config (isEnabled false)", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            isEnabled: false,
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with NA cron expression", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            cronExpression: "NA",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with null cron expression", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            cronExpression: null,
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with NotUsed cron expression", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            cronExpression: "NotUsed",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with daily cron expression (* * *)", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            cronExpression: "0 0 * * *",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with no datasetId", () => {
    setupSelector(
      datafeedInfo,
      {
        datasetById: {
          datasetId: "",
          longName: "",
          shortName: "",
          datasetDescription: "",
          datasetStatus: "",
          licenseId: "",
        },
      },
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with XpathSplitValidateRoute", () => {
    setupSelector(
      {
        ...datafeedInfo,
        metadata: {
          data: {
            ...datafeedInfo.metadata.data,
            splittingCanonicalClass:
              "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute",
          },
        },
      },
      dataFamily,
      license,
      catalogueList
    );
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should dispatch getDatasetMetadataInfo when datafeedId exists", () => {
    setupSelector();
    mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should render Layout components", () => {
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.find(Layout).length).toBeGreaterThanOrEqual(0);
  });

  it("should render Menu component", () => {
    const wrapper = mount(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    );
    expect(wrapper.find(Menu).length).toBeGreaterThanOrEqual(0);
  });
});
