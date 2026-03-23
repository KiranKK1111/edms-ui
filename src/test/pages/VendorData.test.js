import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Table, Button, Input } from "antd";

import VendorData from "../../pages/masterData/VendorData";

configure({ adapter: new Adapter() });
jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
const props = {
  contracts: [
    [
      {
        agreementId: "",
        agreementSignedOn: "",
        agreementReferenceText: "",
        agreementName: "",
        agreementReferenceId: "",
        agreementEdmsEntiryId: "",
        agreementType: "",
        agreementPartyId: "",
        agreementStartDate: "",
        agreementNoExpiryFlag: "",
        agreementExpiryDate: "",
        agreementStatus: "",
        agreementValue: "",
        agreementCcy: null,
        agreementLimitations: null,
        agreementFile: null,
        agreementLink: null,
        agreementScbAgreementMgrBankId: "",
        agreementCreatedBy: "",
        agreementCreatedOn: "",
        agreementLastUpdatedBy: "",
        agreementLastUpdatedOn: null,
        agreementApprovedBy: "",
        agreementApprovedOn: "",
        agreementUpdateFlag: "",
        roleName: null,
      },
    ],
  ],
  licenses: [
    {
      licenseId: "",
      licenseLongName: "",
      licenseShortName: "",
      licenseAgreementId: "",
      licenseNoInheritanceFlag: "",
      licenseExpiryDate: "",
      licenseStatus: "",
      licenseDataProcurementType: "",
      licenseValuePerMonth: "",
      licenseCcy: "",
      licenseType: "",
      licenseNumberOfLicensesPurchaised: null,
      licenseNumberOfLicensesUsed: "",
      licenseLimitations: "",
      licenseCreatedBy: "",
      licenseCreatedOn: "",
      licenseLastUpdatedBy: null,
      licenseLastUpdatedOn: null,
      licenseApprovedBy: "",
      licenseApprovedOn: "",
      licenseUpdateFlag: "",
      roleName: null,
    },
  ],
  vendors: [
    {
      entityId: "",
      longName: "",
      shortName: "",
      entityDescription: "",
      entityType: "",
      entityStatus: "",
      createdBy: "",
      createdOn: "",
      lastUpdatedBy: null,
      lastUpdatedOn: null,
      approvedBy: "",
      approvedOn: "",
      website: null,
      entityUpdateFlag: "",
      roleName: null,
    },
  ],
  datasets: [
    {
      datasetId: "",
      longName: "",
      shortName: "",
      licenseId: "",
      datasetDescription: "",
      datasetStatus: "",
      createdBy: "",
      createdOn: "",
      lastUpdatedBy: "",
      lastUpdatedOn: "",
      approvedBy: "",
      approvedOn: "",
      entityId: "",
      datasetUpdateFlag: "",
      roleName: null,
    },
  ],
};
const wrapper = mount(<VendorData {...props} />);
describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
  it("table", () => {
    const element = wrapper.find(Table);
    expect(element.length).toBe(1);
  });
  it("table props", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element).toHaveLength(6);
  });
  it("table props", () => {
    const arry = [
      {
        ellipsis: false,
        key: "agreementName",
        render: () => {},
        sorter: () => {},
        title: <b>Agreement Name</b>,
        width: "20%",
      },
      {
        dataIndex: "agreementId",
        ellipsis: false,
        key: "agreementId",
        render: () => {},
        sorter: () => {},
        title: <b>Agreement ID</b>,
        width: "25%",
      },
      {
        dataIndex: "licenses",
        ellipsis: false,
        key: "licenses",
        render: () => {},
        sorter: () => {},
        title: <b>Licences</b>,
        width: "12%",
      },
      {
        dataIndex: "agreementExpiryDate",
        ellipsis: false,
        key: "agreementExpiryDate",
        render: () => {},
        sorter: () => {},
        title: (
          <div className="expDate-styling">
            <b>Expiration Date</b>
          </div>
        ),
        width: "17%",
      },
      {
        dataIndex: "agreementStatus",
        key: "agreementStatus",
        render: () => {},
        sorter: () => {},
        title: <b>Status</b>,
        width: "10%",
      },
      {
        key: "actions",
        render: () => {},
        title: <b>Actions</b>,
        width: "15%",
      },
    ];
    const element = wrapper.find(Table).prop("columns");
    expect(element.length).toBe(arry.length);
  });

  it("Button click", () => {
    const mockFn = jest.fn();
    const button = wrapper.find(Button).at(0);
    button.simulate("click");
    expect(mockFn).toBeTruthy();
  });
  it("Button event", () => {
    const mockFn = jest.fn();
    const button = wrapper.find(Button).at(1);
    button.simulate("click");
    expect(mockFn).toBeTruthy();
  });
  it("Input event", () => {
    const mockEvent = { currentTarget: { id: "test" } };
    const element = wrapper.find(Input).at(1);
    element.simulate("blur", mockEvent);
    expect(mockEvent).toBeTruthy();
  });
  it("Table Columns", () => {
    const element = wrapper.find(Table).prop("columns");
    expect(element).toBeTruthy();
  });
});
