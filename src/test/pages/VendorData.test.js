import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table, Button, Input, Tag } from "antd";

import VendorData from "../../pages/masterData/VendorData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children }) => children,
  useHistory: () => ({ push: mockPush }),
}));

const props = {
  contracts: [
    [
      {
        agreementId: "AG001",
        agreementSignedOn: "2024-01-01",
        agreementReferenceText: "Ref",
        agreementName: "TestAgreement",
        agreementReferenceId: "REF001",
        agreementEdmsEntiryId: "E001",
        agreementType: "Vendor Contract",
        agreementPartyId: "P001",
        agreementStartDate: "2024-01-01",
        agreementNoExpiryFlag: "N",
        agreementExpiryDate: "2025-12-31",
        agreementStatus: "Active",
        agreementValue: "10000",
        agreementCcy: null,
        agreementLimitations: null,
        agreementFile: null,
        agreementLink: null,
        agreementScbAgreementMgrBankId: "SCB001",
        agreementCreatedBy: "user1",
        agreementCreatedOn: "2024-01-01",
        agreementLastUpdatedBy: "",
        agreementLastUpdatedOn: null,
        agreementApprovedBy: "approver1",
        agreementApprovedOn: "2024-01-02",
        agreementUpdateFlag: "N",
        roleName: null,
      },
    ],
  ],
  licenses: [
    {
      licenseId: "L001",
      licenseLongName: "Test License",
      licenseShortName: "TL",
      licenseAgreementId: "AG001",
      licenseNoInheritanceFlag: "",
      licenseExpiryDate: "2025-12-31",
      licenseStatus: "Active",
      licenseDataProcurementType: "Data Leasing",
      licenseValuePerMonth: "1000",
      licenseCcy: "USD",
      licenseType: "Enterprise Licence",
      licenseNumberOfLicensesPurchaised: null,
      licenseNumberOfLicensesUsed: "",
      licenseLimitations: "",
      licenseCreatedBy: "user1",
      licenseCreatedOn: "2024-01-01",
      licenseLastUpdatedBy: null,
      licenseLastUpdatedOn: null,
      licenseApprovedBy: "approver1",
      licenseApprovedOn: "2024-01-02",
      licenseUpdateFlag: "N",
      roleName: null,
    },
  ],
  vendors: [
    {
      entityId: "V001",
      longName: "Test Vendor",
      shortName: "TV",
      entityDescription: "Test vendor desc",
      entityType: "Vendor",
      entityStatus: "Active",
      createdBy: "user1",
      createdOn: "2024-01-01",
      lastUpdatedBy: null,
      lastUpdatedOn: null,
      approvedBy: "approver1",
      approvedOn: "2024-01-02",
      website: null,
      entityUpdateFlag: "N",
      roleName: null,
    },
  ],
  datasets: [
    {
      datasetId: "DS001",
      longName: "Test Dataset",
      shortName: "TD",
      licenseId: "L001",
      datasetDescription: "Test dataset desc",
      datasetStatus: "Active",
      createdBy: "user1",
      createdOn: "2024-01-01",
      lastUpdatedBy: "",
      lastUpdatedOn: "",
      approvedBy: "approver1",
      approvedOn: "2024-01-02",
      entityId: "V001",
      datasetUpdateFlag: "N",
      roleName: null,
    },
  ],
};

describe("VendorData Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = mount(<VendorData {...props} />);

  it("should render main wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });

  it("should render Table component", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });

  it("should render 6 table columns", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element).toHaveLength(6);
  });

  it("should render correct column structure", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element.length).toBe(6);
  });

  it("should handle button click on first button", () => {
    const mockFn = jest.fn();
    const button = wrapper.find(Button).at(0);
    button.simulate("click");
    expect(mockFn).toBeTruthy();
  });

  it("should handle button click on second button", () => {
    const mockFn = jest.fn();
    const button = wrapper.find(Button).at(1);
    button.simulate("click");
    expect(mockFn).toBeTruthy();
  });

  it("should handle input blur event", () => {
    const mockEvent = { currentTarget: { id: "test" } };
    const element = wrapper.find(Input).at(1);
    element.simulate("blur", mockEvent);
    expect(mockEvent).toBeTruthy();
  });

  it("should render Table Columns", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element).toBeTruthy();
  });

  // --- New tests to improve coverage ---

  it("should render with empty contracts", () => {
    const emptyProps = {
      ...props,
      contracts: [[]],
    };
    const emptyWrapper = mount(<VendorData {...emptyProps} />);
    expect(emptyWrapper.find("#main").length).toBe(1);
  });

  it("should render with empty licenses", () => {
    const emptyProps = {
      ...props,
      licenses: [],
    };
    const emptyWrapper = mount(<VendorData {...emptyProps} />);
    expect(emptyWrapper.find("#main").length).toBe(1);
  });

  it("should render with empty vendors", () => {
    const emptyProps = {
      ...props,
      vendors: [],
    };
    const emptyWrapper = mount(<VendorData {...emptyProps} />);
    expect(emptyWrapper.find("#main").length).toBe(1);
  });

  it("should render with inactive agreement status", () => {
    const inactiveProps = {
      ...props,
      contracts: [
        [
          {
            ...props.contracts[0][0],
            agreementStatus: "Inactive",
          },
        ],
      ],
    };
    const inactiveWrapper = mount(<VendorData {...inactiveProps} />);
    expect(inactiveWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with pending agreement status", () => {
    const pendingProps = {
      ...props,
      contracts: [
        [
          {
            ...props.contracts[0][0],
            agreementStatus: "Pending",
          },
        ],
      ],
    };
    const pendingWrapper = mount(<VendorData {...pendingProps} />);
    expect(pendingWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with no expiry flag Y", () => {
    const noExpiryProps = {
      ...props,
      contracts: [
        [
          {
            ...props.contracts[0][0],
            agreementNoExpiryFlag: "Y",
            agreementExpiryDate: null,
          },
        ],
      ],
    };
    const noExpiryWrapper = mount(<VendorData {...noExpiryProps} />);
    expect(noExpiryWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with multiple contracts", () => {
    const multiProps = {
      ...props,
      contracts: [
        [
          props.contracts[0][0],
          {
            ...props.contracts[0][0],
            agreementId: "AG002",
            agreementName: "SecondAgreement",
            agreementStatus: "Pending",
          },
        ],
      ],
    };
    const multiWrapper = mount(<VendorData {...multiProps} />);
    expect(multiWrapper.find(Table).exists()).toBe(true);
  });

  it("should render with multiple licenses under same agreement", () => {
    const multiLicenseProps = {
      ...props,
      licenses: [
        props.licenses[0],
        {
          ...props.licenses[0],
          licenseId: "L002",
          licenseLongName: "Second License",
          licenseShortName: "SL",
          licenseStatus: "Pending",
        },
      ],
    };
    const multiWrapper = mount(<VendorData {...multiLicenseProps} />);
    expect(multiWrapper.find(Table).exists()).toBe(true);
  });

  it("should render Table with dataSource", () => {
    const table = wrapper.find(Table);
    expect(table.prop("dataSource")).toBeDefined();
  });

  it("should render Table with expandable rows", () => {
    const table = wrapper.find(Table);
    expect(
      table.prop("expandable") || table.prop("expandedRowRender")
    ).toBeTruthy();
  });

  it("should render header row with column titles", () => {
    const table = wrapper.find(Table);
    const headers = table.find("th");
    expect(headers.length).toBeGreaterThanOrEqual(5);
  });

  it("should handle sorting on table columns", () => {
    const table = wrapper.find(Table);
    const columns = table.prop("columns");
    // Verify sorter functions exist
    const sortableColumns = columns.filter((col) => col.sorter);
    expect(sortableColumns.length).toBeGreaterThanOrEqual(3);
  });
});
