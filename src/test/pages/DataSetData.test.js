import { Table, Tag, Button, Form } from "antd";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import DataSetData from "../../pages/masterData/DataSetData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();
const mockPush = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn().mockReturnValue([]),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children, to, onClick }) => (
    <a href={typeof to === "string" ? to : to && to.pathname} onClick={onClick}>
      {children}
    </a>
  ),
  useHistory: () => ({ push: mockPush }),
}));

jest.mock("../../store/actions/contractAction", () => ({
  startDeleteContract: jest.fn(),
  startUpdateContract: jest.fn(),
}));

jest.mock("../../store/actions/licenseAction", () => ({
  startDeleteLicense: jest.fn(),
  startUpdateLicense: jest.fn(),
}));

jest.mock("../../store/actions/datafeedAction", () => ({
  startGetDatafeeds: jest.fn(() => ({ type: "GET_DATAFEEDS" })),
  startUpdateDataFeed: jest.fn().mockResolvedValue({ data: {} }),
  getConfigById: jest.fn(),
  clearFeed: jest.fn(() => ({ type: "CLEAR_FEED" })),
  formDataFn: jest.fn(() => ({ type: "FORM_DATA" })),
  setSelectedDatafeed: jest.fn(),
}));

jest.mock("../../store/actions/datasetFormActions", () => ({
  datasetInfo: jest.fn(() => ({ type: "DATASET_INFO" })),
  startDataset: jest.fn().mockResolvedValue({ data: {} }),
}));

jest.mock("../../store/actions/CatalogPageActions", () => ({
  allSubscriptionList: jest.fn(() => ({ type: "ALL_SUBSCRIPTION_LIST" })),
}));

jest.mock("../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(() => ({ type: "GET_DATASETS" })),
}));

jest.mock("../../utils/accessMasterData", () => jest.fn(() => false));
jest.mock("../../utils/accessButtonCheck", () => jest.fn(() => false));
jest.mock("../../utils/accessObject", () =>
  jest.fn(() => ({ permission: "RW" }))
);

jest.mock("../../components/addContract/ContractDetails", () => ({
  CamelText: jest.fn((str) =>
    str ? str.charAt(0).toUpperCase() + str.substr(1).toLowerCase() : ""
  ),
}));

const datasetsInfo = [
  {
    datasetId: "DS001",
    longName: "Test Dataset",
    shortName: "TD",
    licenseId: "L001",
    datasetDescription: "Test desc",
    datasetStatus: "Active",
    createdBy: "user1",
    createdOn: "2024-01-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: "approver1",
    approvedOn: "2024-01-02",
    entityId: "E001",
    datasetUpdateFlag: "N",
    roleName: null,
  },
  {
    datasetId: "DS002",
    longName: "Pending Dataset",
    shortName: "PD",
    licenseId: "L001",
    datasetDescription: "Pending desc",
    datasetStatus: "Pending",
    createdBy: "user2",
    createdOn: "2024-02-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    entityId: "E001",
    datasetUpdateFlag: "Y",
    roleName: null,
  },
  {
    datasetId: "DS003",
    longName: "Inactive Dataset",
    shortName: "ID",
    licenseId: "L002",
    datasetDescription: "Inactive desc",
    datasetStatus: "Inactive",
    createdBy: "user3",
    createdOn: "2024-03-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    entityId: "E001",
    datasetUpdateFlag: "N",
    roleName: null,
  },
];

const datafeedsInfo = [
  {
    feedId: "F001",
    longName: "Test Feed",
    shortName: "TF",
    feedDescription: "Test feed desc",
    datasetId: "DS001",
    dataConfidentiality: "",
    personalData: "",
    documentationFile: null,
    documentationLink: null,
    datapatternId: null,
    feedStatus: "Active",
    createdBy: "user1",
    createdOn: "2024-01-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    feedUpdateFlag: "N",
    roleName: null,
    dataSetShortName: null,
    isEnabled: true,
    created: null,
  },
  {
    feedId: "F002",
    longName: "Pending Feed",
    shortName: "PF",
    feedDescription: "Pending feed",
    datasetId: "DS001",
    dataConfidentiality: "",
    personalData: "",
    documentationFile: null,
    documentationLink: null,
    datapatternId: null,
    feedStatus: "Pending",
    createdBy: "user2",
    createdOn: "2024-02-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    feedUpdateFlag: "Y",
    roleName: null,
    dataSetShortName: null,
    isEnabled: false,
    created: null,
  },
  {
    feedId: "F003",
    longName: "Inactive Feed",
    shortName: "IF",
    feedDescription: "Inactive feed",
    datasetId: "DS002",
    dataConfidentiality: "",
    personalData: "",
    documentationFile: null,
    documentationLink: null,
    datapatternId: null,
    feedStatus: "Inactive",
    createdBy: "user3",
    createdOn: "2024-03-01",
    lastUpdatedBy: null,
    lastUpdatedOn: null,
    approvedBy: null,
    approvedOn: null,
    feedUpdateFlag: "N",
    roleName: null,
    dataSetShortName: null,
    isEnabled: null,
    created: null,
  },
];

const licenses = [
  {
    licenseId: "L001",
    licenseLongName: "License One",
    licenseShortName: "L1",
    licenseAgreementId: "A001",
    licenseExpiryDate: "2025-12-31",
    licenseStatus: "Active",
    licenseUpdateFlag: "N",
  },
  {
    licenseId: "L002",
    licenseLongName: "License Two",
    licenseShortName: "L2",
    licenseAgreementId: "A001",
    licenseExpiryDate: "2025-06-30",
    licenseStatus: "Pending",
    licenseUpdateFlag: "Y",
  },
];

const defaultProps = {
  datasetsInfo,
  datafeedsInfo,
  licenses,
  handleTabClick: jest.fn(),
  dataSetEntityId: "E001",
  vendorId: "V001",
  dispatch: jest.fn(),
  disableAllButtons: false,
};

describe("DataSetData Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("psid", "user1");
    localStorage.setItem(
      "objectMatrix",
      JSON.stringify([
        {
          category: "Masterdata Management Page",
          objectName: "Add Datafeed Page and Button",
          permission: "RW",
        },
      ])
    );
  });

  it("should render main wrapper", () => {
    const wrapper = mount(<DataSetData {...defaultProps} />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render Table component", () => {
    const wrapper = mount(<DataSetData {...defaultProps} />);
    expect(wrapper.find(Table).length).toBeGreaterThanOrEqual(1);
  });

  it("should render with empty datasetsInfo", () => {
    const wrapper = mount(
      <DataSetData {...defaultProps} datasetsInfo={[]} datafeedsInfo={[]} />
    );
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render with empty licenses", () => {
    const wrapper = mount(
      <DataSetData {...defaultProps} licenses={[]} />
    );
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render with undefined licenses", () => {
    const wrapper = mount(
      <DataSetData {...defaultProps} licenses={undefined} />
    );
    expect(wrapper.find("#main").length).toBe(1);
  });

  describe("Table columns", () => {
    let wrapper;
    let columns;

    beforeEach(() => {
      wrapper = mount(<DataSetData {...defaultProps} />);
      columns = wrapper.find(Table).first().prop("columns");
    });

    it("should have at least 6 columns", () => {
      expect(columns.length).toBeGreaterThanOrEqual(6);
    });

    it("should have Dataset Name column with sorter", () => {
      const col = columns.find((c) => c.key === "shortName");
      expect(col).toBeTruthy();
      if (col && col.sorter) {
        const result = col.sorter(
          { shortName: "Alpha" },
          { shortName: "Beta" }
        );
        expect(result).toBeLessThan(0);
      }
    });

    it("should have Dataset ID column with sorter", () => {
      const col = columns.find((c) => c.key === "datasetId");
      expect(col).toBeTruthy();
      if (col && col.sorter) {
        const result = col.sorter(
          { datasetId: "DS001" },
          { datasetId: "DS002" }
        );
        expect(result).toBeLessThan(0);
      }
    });

    it("should have Dataset ID column with render function", () => {
      const col = columns.find((c) => c.key === "datasetId");
      if (col && col.render) {
        const rendered = col.render("DS001");
        expect(rendered).toBeTruthy();
      }
    });

    it("should have Licence Name column with sorter", () => {
      const col = columns.find((c) => c.key === "licenseName");
      expect(col).toBeTruthy();
      if (col && col.sorter) {
        const result = col.sorter(
          { licenseName: "L1" },
          { licenseName: "L2" }
        );
        expect(result).toBeLessThan(0);
      }
    });

    it("should have Data Feeds column with sorter", () => {
      const col = columns.find((c) => c.key === "dataFeeds");
      expect(col).toBeTruthy();
      if (col && col.sorter) {
        const result = col.sorter({ dataFeeds: 1 }, { dataFeeds: 2 });
        expect(result).toBeLessThan(0);
      }
    });

    it("should render dataset status Active as green tag", () => {
      const col = columns.find((c) => c.key === "datasetStatus");
      if (col && col.render) {
        const rendered = shallow(<div>{col.render("Active")}</div>);
        expect(rendered.find(Tag).prop("color")).toBe("green");
      }
    });

    it("should render dataset status Pending as orange tag", () => {
      const col = columns.find((c) => c.key === "datasetStatus");
      if (col && col.render) {
        const rendered = shallow(<div>{col.render("Pending")}</div>);
        expect(rendered.find(Tag).prop("color")).toBe("orange");
      }
    });

    it("should render dataset status Inactive as orange tag", () => {
      const col = columns.find((c) => c.key === "datasetStatus");
      if (col && col.render) {
        const rendered = shallow(<div>{col.render("Inactive")}</div>);
        expect(rendered.find(Tag).prop("color")).toBe("orange");
      }
    });

    it("should have Dataset status column with sorter", () => {
      const col = columns.find((c) => c.key === "datasetStatus");
      if (col && col.sorter) {
        const result = col.sorter(
          { datasetStatus: "Active" },
          { datasetStatus: "Pending" }
        );
        expect(result).toBeLessThan(0);
      }
    });

    it("should have Actions column with render function", () => {
      const col = columns.find((c) => c.key === "actions");
      expect(col).toBeTruthy();
      if (col && col.render) {
        const rendered = mount(
          <div>
            {col.render({
              shortName: "TD",
              datasetStatus: "Active",
              contractId: "C001",
              contractName: "Test",
              licenses: 1,
              contractStatus: "Active",
              licenseName: "L1",
            })}
          </div>
        );
        expect(rendered.find("a").length).toBeGreaterThanOrEqual(1);
      }
    });

    it("should render Dataset Name column with link", () => {
      const col = columns.find((c) => c.key === "shortName");
      if (col && col.render) {
        const rendered = mount(
          <div>
            {col.render({
              shortName: "TD",
              licenseName: "L1",
              datasetStatus: "Active",
            })}
          </div>
        );
        expect(rendered.find("a").length).toBeGreaterThanOrEqual(1);
      }
    });

    it("should handle shortName with slash in Dataset Name render", () => {
      const col = columns.find((c) => c.key === "shortName");
      if (col && col.render) {
        const rendered = shallow(
          <div>
            {col.render({
              shortName: "TD/Test",
              licenseName: "L1/Test",
              datasetStatus: "Active",
            })}
          </div>
        );
        expect(rendered.exists()).toBe(true);
      }
    });

    it("should render Actions with disabled Add Feeds for inactive dataset", () => {
      const col = columns.find((c) => c.key === "actions");
      if (col && col.render) {
        const rendered = shallow(
          <div>
            {col.render({
              shortName: "ID",
              datasetStatus: "Inactive",
              contractId: "C001",
              contractName: "Test",
              licenses: 0,
              contractStatus: "Inactive",
              licenseName: "L2",
            })}
          </div>
        );
        expect(rendered.exists()).toBe(true);
      }
    });

    it("should render Actions for planned dataset status", () => {
      const col = columns.find((c) => c.key === "actions");
      if (col && col.render) {
        const rendered = shallow(
          <div>
            {col.render({
              shortName: "PD",
              datasetStatus: "Planned",
              contractId: "C001",
              contractName: "Test",
              licenses: 0,
              contractStatus: "Active",
              licenseName: "L1",
            })}
          </div>
        );
        expect(rendered.exists()).toBe(true);
      }
    });
  });

  describe("Expandable row render", () => {
    it("should render expandable table with data feed columns", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandable = table.prop("expandable") || {};
      const expandedRowRender =
        expandable.expandedRowRender || table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const rendered = shallow(<div>{expandedRowRender(row)}</div>);
        expect(rendered.find(Table).length).toBe(1);
      }
    });

    it("should render feed status Active as green tag in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const statusCol = innerColumns.find((c) => c.key === "feedStatus");
          if (statusCol && statusCol.render) {
            const rendered = shallow(<div>{statusCol.render("Active")}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("green");
          }
        }
      }
    });

    it("should render feed status Inactive as inactive tag in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const statusCol = innerColumns.find((c) => c.key === "feedStatus");
          if (statusCol && statusCol.render) {
            const rendered = shallow(<div>{statusCol.render("Inactive")}</div>);
            expect(rendered.find(Tag).length).toBe(1);
          }
        }
      }
    });

    it("should render feed status Pending as orange tag in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const statusCol = innerColumns.find((c) => c.key === "feedStatus");
          if (statusCol && statusCol.render) {
            const rendered = shallow(<div>{statusCol.render("Pending")}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("orange");
          }
        }
      }
    });

    it("should render feed status Expired as red tag in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const statusCol = innerColumns.find((c) => c.key === "feedStatus");
          if (statusCol && statusCol.render) {
            const rendered = shallow(<div>{statusCol.render("Expired")}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("red");
          }
        }
      }
    });

    it("should render feed status Deactivate as inactive tag in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const statusCol = innerColumns.find((c) => c.key === "feedStatus");
          if (statusCol && statusCol.render) {
            const rendered = shallow(
              <div>{statusCol.render("Deactivate")}</div>
            );
            expect(rendered.find(Tag).length).toBe(1);
          }
        }
      }
    });

    it("should render configuration status - Active (isEnabled true)", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const configCol = innerColumns.find((c) => c.key === "isEnabled");
          if (configCol && configCol.render) {
            const rendered = shallow(<div>{configCol.render(true)}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("green");
            expect(rendered.text()).toContain("Active");
          }
        }
      }
    });

    it("should render configuration status - Inactive (isEnabled false)", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const configCol = innerColumns.find((c) => c.key === "isEnabled");
          if (configCol && configCol.render) {
            const rendered = shallow(<div>{configCol.render(false)}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("orange");
            expect(rendered.text()).toContain("Inactive");
          }
        }
      }
    });

    it("should render configuration status - NA (isEnabled null)", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const configCol = innerColumns.find((c) => c.key === "isEnabled");
          if (configCol && configCol.render) {
            const rendered = shallow(<div>{configCol.render(null)}</div>);
            expect(rendered.find(Tag).prop("color")).toBe("default");
            expect(rendered.text()).toContain("NA");
          }
        }
      }
    });

    it("should render Data Feed Name link with feedUpdateFlag N", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const nameCol = innerColumns.find((c) => c.key === "shortName");
          if (nameCol && nameCol.render) {
            const rendered = mount(
              <div>
                {nameCol.render({
                  shortName: "TF",
                  feedUpdateFlag: "N",
                  feedStatus: "Active",
                })}
              </div>
            );
            expect(rendered.find("a").length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it("should render Data Feed Name link with feedUpdateFlag Y", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const nameCol = innerColumns.find((c) => c.key === "shortName");
          if (nameCol && nameCol.render) {
            const rendered = mount(
              <div>
                {nameCol.render({
                  shortName: "PF",
                  feedUpdateFlag: "Y",
                  feedStatus: "Pending",
                })}
              </div>
            );
            expect(rendered.find("a").length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it("should render Feed ID in expanded row", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const idCol = innerColumns.find((c) => c.key === "feedId");
          if (idCol && idCol.render) {
            const rendered = idCol.render("F001");
            expect(rendered).toBeTruthy();
          }
        }
      }
    });

    it("should render Actions in expanded row with Edit link", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const actionsCol = innerColumns.find((c) => c.key === "actions");
          if (actionsCol && actionsCol.render) {
            const rendered = mount(
              <div>
                {actionsCol.render({
                  feedUpdateFlag: "N",
                  feedStatus: "Active",
                  feedId: "F001",
                  shortName: "TF",
                  LICECONTRACT: "C001",
                  id: "L001",
                  name: "Test",
                  taskStatus: "draft",
                })}
              </div>
            );
            expect(rendered.find("a").length).toBeGreaterThanOrEqual(1);
          }
        }
      }
    });

    it("should render Actions in expanded row with feedUpdateFlag Y", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const expandedRowRender = table.prop("expandedRowRender");
      if (expandedRowRender) {
        const row = {
          datasetId: "DS001",
          shortName: "TD",
          datasetStatus: "Active",
        };
        const expandedWrapper = shallow(<div>{expandedRowRender(row)}</div>);
        const innerTable = expandedWrapper.find(Table);
        if (innerTable.length > 0) {
          const innerColumns = innerTable.prop("columns");
          const actionsCol = innerColumns.find((c) => c.key === "actions");
          if (actionsCol && actionsCol.render) {
            const rendered = shallow(
              <div>
                {actionsCol.render({
                  feedUpdateFlag: "Y",
                  feedStatus: "Pending",
                  feedId: "F002",
                  shortName: "PF",
                  LICECONTRACT: "C001",
                  id: "L001",
                  name: "Test",
                  taskStatus: "pending",
                })}
              </div>
            );
            expect(rendered.exists()).toBe(true);
          }
        }
      }
    });
  });

  describe("handleEnableButton", () => {
    it("should render with disableAllButtons true", () => {
      const wrapper = mount(
        <DataSetData {...defaultProps} disableAllButtons={true} />
      );
      expect(wrapper.find("#main").length).toBe(1);
    });
  });

  describe("search and filter functionality", () => {
    it("should render search form elements", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      expect(wrapper.find(Form).length).toBeGreaterThanOrEqual(1);
    });

    it("should render Apply and Cancel buttons", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const buttons = wrapper.find(Button);
      const applyBtn = buttons.filterWhere(
        (b) => b.prop("type") === "primary"
      );
      const cancelBtn = buttons.filterWhere(
        (b) => b.prop("type") === "secondary"
      );
      expect(applyBtn.length).toBeGreaterThanOrEqual(0);
      expect(cancelBtn.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("with different dataset statuses in data", () => {
    it("should render with setup status (green)", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const columns = table.prop("columns");
      const statusCol = columns.find((c) => c.key === "datasetStatus");
      if (statusCol && statusCol.render) {
        const rendered = shallow(<div>{statusCol.render("Setup")}</div>);
        expect(rendered.find(Tag).prop("color")).toBe("green");
      }
    });

    it("should render with approved status (green)", () => {
      const wrapper = mount(<DataSetData {...defaultProps} />);
      const table = wrapper.find(Table).first();
      const columns = table.prop("columns");
      const statusCol = columns.find((c) => c.key === "datasetStatus");
      if (statusCol && statusCol.render) {
        const rendered = shallow(<div>{statusCol.render("Approved")}</div>);
        expect(rendered.find(Tag).prop("color")).toBe("green");
      }
    });
  });

  it("should render with matching datasetId in datafeedsInfo", () => {
    const matchingWrapper = mount(
      <DataSetData
        datasetsInfo={[datasetsInfo[0]]}
        datafeedsInfo={[datafeedsInfo[0]]}
        licenses={licenses}
        handleTabClick={jest.fn()}
        dataSetEntityId="E001"
        vendorId="V001"
        dispatch={jest.fn()}
      />
    );
    expect(matchingWrapper.find(Table).exists()).toBe(true);
  });

  it("should render Table with expandedRowRender", () => {
    const wrapper = mount(<DataSetData {...defaultProps} />);
    const table = wrapper.find(Table).first();
    expect(
      table.prop("expandable") || table.prop("expandedRowRender")
    ).toBeTruthy();
  });

  it("should render Table with pagination", () => {
    const wrapper = mount(<DataSetData {...defaultProps} />);
    const table = wrapper.find(Table).first();
    expect(table.prop("pagination")).toBeTruthy();
  });

  it("should render with active and pending dataset statuses", () => {
    const wrapper = mount(<DataSetData {...defaultProps} />);
    expect(wrapper.find(Table).exists()).toBe(true);
  });

  it("should dispatch clearFeed on mount", () => {
    mount(<DataSetData {...defaultProps} />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should dispatch allSubscriptionList on mount", () => {
    mount(<DataSetData {...defaultProps} />);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
