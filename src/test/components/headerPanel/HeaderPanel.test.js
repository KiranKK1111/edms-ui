import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Descriptions, Badge } from "antd";
import HeaderPanel from "../../../components/headerPanel/HeaderPanel";

configure({ adapter: new Adapter() });

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/catalog/details",
    search: "",
    hash: "",
    state: {
      data: {
        dataFeedStatus: "Active",
        entityShortName: "TestEntity",
      },
    },
    key: "test",
  }),
  withRouter: (component) => component,
  useHistory: jest.fn(),
}));

const setupSelector = (licenseInfo = {}, agreementInfo = {}) => {
  const state = {
    license: { licenseById: licenseInfo },
    contract: { agreementById: agreementInfo },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("HeaderPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/catalog/details",
      search: "",
      hash: "",
      state: {
        data: {
          dataFeedStatus: "Active",
          entityShortName: "TestEntity",
        },
      },
      key: "test",
    });
    setupSelector();
  });

  it("should render Descriptions component", () => {
    const wrapper = shallow(<HeaderPanel />);
    expect(wrapper.find(Descriptions).length).toBe(1);
  });

  it("should render 5 Description.Items", () => {
    const wrapper = shallow(<HeaderPanel />);
    expect(wrapper.find(Descriptions.Item).length).toBe(5);
  });

  it("should display entity short name as data source", () => {
    const wrapper = shallow(<HeaderPanel />);
    const dataSourceItem = wrapper.find(Descriptions.Item).at(2);
    expect(dataSourceItem.children().text()).toBe("TestEntity");
  });

  it("should display NA when entityShortName is empty", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/catalog/details",
      state: { data: { dataFeedStatus: "Active", entityShortName: "" } },
    });
    const wrapper = shallow(<HeaderPanel />);
    const dataSourceItem = wrapper.find(Descriptions.Item).at(2);
    expect(dataSourceItem.children().text()).toBe("NA");
  });

  it("should display success badge for active status", () => {
    const wrapper = shallow(<HeaderPanel />);
    const statusItem = wrapper.find(Descriptions.Item).at(3);
    expect(statusItem.find(Badge).prop("status")).toBe("success");
  });

  it("should display warning badge for pending status", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/catalog/details",
      state: { data: { dataFeedStatus: "Pending", entityShortName: "Test" } },
    });
    const wrapper = shallow(<HeaderPanel />);
    const statusItem = wrapper.find(Descriptions.Item).at(3);
    expect(statusItem.find(Badge).prop("status")).toBe("warning");
  });

  it("should display error badge for inactive status", () => {
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      pathname: "/catalog/details",
      state: {
        data: { dataFeedStatus: "Inactive", entityShortName: "Test" },
      },
    });
    const wrapper = shallow(<HeaderPanel />);
    const statusItem = wrapper.find(Descriptions.Item).at(3);
    expect(statusItem.find(Badge).prop("status")).toBe("error");
  });

  it("should display Unlimited licenses for enterprise license type", () => {
    setupSelector(
      {
        licenseType: "Enterprise License",
        licenseNumberOfLicensesPurchaised: "100",
        licenseNumberOfLicensesUsed: "50",
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    const wrapper = shallow(<HeaderPanel />);
    const licensesItem = wrapper.find(Descriptions.Item).at(0);
    expect(licensesItem.children().text()).toBe("Unlimited");
  });

  it("should calculate available licenses for non-enterprise type", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNumberOfLicensesPurchaised: "100",
        licenseNumberOfLicensesUsed: "30",
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    const wrapper = shallow(<HeaderPanel />);
    const licensesItem = wrapper.find(Descriptions.Item).at(0);
    expect(licensesItem.children().text()).toBe("70");
  });

  it("should display license expiry date when inheritance flag is true", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNoInheritanceFlag: "true",
        licenseExpiryDate: "2025-12-31",
      },
      {}
    );
    const wrapper = shallow(<HeaderPanel />);
    const expiryItem = wrapper.find(Descriptions.Item).at(1);
    expect(expiryItem.children().text()).toBe("31 Dec 2025");
  });

  it("should display agreement expiry date when inheritance flag is false", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNoInheritanceFlag: "false",
      },
      { agreementExpiryDate: "2026-06-30" }
    );
    const wrapper = shallow(<HeaderPanel />);
    const expiryItem = wrapper.find(Descriptions.Item).at(1);
    expect(expiryItem.children().text()).toBe("30 Jun 2026");
  });

  it("should display default date 31 Dec 2099 when no agreement expiry", () => {
    setupSelector(
      { licenseNoInheritanceFlag: "false" },
      { agreementExpiryDate: null }
    );
    const wrapper = shallow(<HeaderPanel />);
    const expiryItem = wrapper.find(Descriptions.Item).at(1);
    expect(expiryItem.children().text()).toBe("31 Dec 2099");
  });

  it("should display NA for SCB Data Owner when not set", () => {
    setupSelector({}, {});
    const wrapper = shallow(<HeaderPanel />);
    const ownerItem = wrapper.find(Descriptions.Item).at(4);
    expect(ownerItem.children().text()).toBe("NA");
  });

  it("should display SCB Data Owner when set", () => {
    setupSelector({}, { agreementScbAgreementMgrBankId: "1234567" });
    const wrapper = shallow(<HeaderPanel />);
    const ownerItem = wrapper.find(Descriptions.Item).at(4);
    expect(ownerItem.children().text()).toBe("1234567");
  });

  it("should handle null licenseInfo gracefully", () => {
    const state = {
      license: { licenseById: null },
      contract: { agreementById: null },
    };
    redux.useSelector.mockImplementation((cb) => cb(state));
    const wrapper = shallow(<HeaderPanel />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should handle null used licenses", () => {
    setupSelector(
      {
        licenseType: "Named User",
        licenseNumberOfLicensesPurchaised: "50",
        licenseNumberOfLicensesUsed: null,
        licenseNoInheritanceFlag: "false",
      },
      {}
    );
    const wrapper = shallow(<HeaderPanel />);
    const licensesItem = wrapper.find(Descriptions.Item).at(0);
    expect(licensesItem.children().text()).toBe("50");
  });
});
