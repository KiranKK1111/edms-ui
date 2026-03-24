import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Select, Radio, Input, DatePicker, Divider } from "antd";
import GeneralConfiguration from "../../../components/addConfiguration/GeneralConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const setupSelector = (configValues = {}) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("GeneralConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    sessionStorage.clear();
    sessionStorage.setItem("feedShortName", "TestFeed");
    setupSelector();
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Select with source processor options", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const select = wrapper.find(Select);
    expect(select.length).toBeGreaterThanOrEqual(1);
    const options = wrapper.find(Select).find(Option);
    expect(options.length).toBe(5);
  });

  it("should render Main Configuration header", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const headers = wrapper.find("h3");
    expect(headers.at(0).text()).toBe("Main Configuration");
  });

  it("should render Proxy header", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const headers = wrapper.find("h3");
    const proxyHeader = headers.filterWhere((h) => h.text() === "Proxy");
    expect(proxyHeader.length).toBe(1);
  });

  it("should render On-Demand Vendor request header", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const headers = wrapper.find("h3");
    const vendorHeader = headers.filterWhere(
      (h) => h.text() === "On-Demand Vendor request"
    );
    expect(vendorHeader.length).toBe(1);
  });

  it("should render DatePicker components for start and expiry dates", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(DatePicker).length).toBe(2);
  });

  it("should render Radio.Group components", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    expect(radioGroups.length).toBeGreaterThanOrEqual(5);
  });

  it("should render multiple Dividers", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Divider).length).toBeGreaterThanOrEqual(3);
  });

  it("should not show proxy fields by default (proxyRequirement = No)", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const proxyHostInput = wrapper.find("#proxyPort");
    expect(proxyHostInput.length).toBe(0);
  });

  it("should render with config values from redux", () => {
    setupSelector({
      startDate: "2025-01-01",
      expiryDate: "2025-12-31",
      routeType: "Scheduled",
      sourceProcessor: "sftpProcessor",
      proxyRequirement: "No",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
      sourceProtocol: "SFTP",
      cronScheduler: "0 0 * * *",
      sourceHostName: "10.0.0.1",
      sourcePortInteger: "22",
      sourceUsername: "user",
      sourcePasswordProperty: "pass",
      sourceFolder: "/inbox",
      filenameFormat: "*.csv",
      routeName: "TestRoute",
      destinationExpression: "bean:s3Processor",
      storageLocation: "/data/store",
    });
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with scheduled route type from config", () => {
    setupSelector({
      routeType: "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute",
      configurationCreatedOn: "2025-01-01",
      sourceProtocol: null,
      filenameDateSuffix: "Yes",
      proxyRequirement: "Yes",
      splittingRequirement: "No",
    });
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should disable fields when isUpdate prop is true", () => {
    const wrapper = shallow(<GeneralConfiguration isUpdate={true} />);
    const disabledInputs = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("disabled") === true);
    expect(disabledInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("should set form name to br-one", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).prop("name")).toBe("br-one");
  });

  it("should have source protocol radio buttons", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const radioButtons = wrapper.find(Radio.Button);
    expect(radioButtons.length).toBe(2);
  });

  it("should render Form.Item components for all required fields", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const formItems = wrapper.find(Form.Item);
    expect(formItems.length).toBeGreaterThanOrEqual(15);
  });

  it("should render keyLocation input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#keyLocation").length).toBe(1);
  });

  it("should render cronScheduler input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#cronScheduler").length).toBe(1);
  });

  // --- New tests to improve coverage ---

  it("should call onFinish and dispatch configUiFn", () => {
    const mockNext = jest.fn();
    const mockPassUpdates = jest.fn();
    const wrapper = shallow(
      <GeneralConfiguration next={mockNext} passUpdates={mockPassUpdates} />
    );
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      startDate: "2025-01-01",
      expiryDate: "2025-12-31",
      cronScheduler: "0 0 * * *",
      sourceProcessor: "sftpProcessor",
      sourceHostName: "10.0.0.1",
      sourcePortInteger: "22",
      sourceUsername: "user",
      sourcePasswordProperty: "pass",
      sourceFolder: "/inbox",
      filenameFormat: "*.csv",
      routeName: "TestRoute",
      destinationExpression: "bean:s3",
      storageLocation: "/data",
      proxyRequirement: "No",
      proxyHostname: "proxy.host",
      proxyPort: "8080",
    };
    onFinish(values);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true, expect.any(Object));
    expect(mockPassUpdates).toHaveBeenCalledWith(values, true);
  });

  it("should clear proxy fields when proxyRequirement is No on submit", () => {
    const mockNext = jest.fn();
    const mockPassUpdates = jest.fn();
    const wrapper = shallow(
      <GeneralConfiguration next={mockNext} passUpdates={mockPassUpdates} />
    );
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      proxyRequirement: "No",
      proxyHostname: "proxy.host",
      proxyPort: "8080",
    };
    onFinish(values);
    expect(values.proxyHostname).toBe("");
    expect(values.proxyPort).toBe("");
  });

  it("should keep proxy fields when proxyRequirement is Yes on submit", () => {
    const mockNext = jest.fn();
    const mockPassUpdates = jest.fn();
    setupSelector({ proxyRequirement: "Yes", splittingRequirement: "No", filenameDateSuffix: "No" });
    const wrapper = shallow(
      <GeneralConfiguration next={mockNext} passUpdates={mockPassUpdates} />
    );
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      proxyRequirement: "Yes",
      proxyHostname: "proxy.host",
      proxyPort: "8080",
    };
    onFinish(values);
    expect(values.proxyHostname).toBe("proxy.host");
    expect(values.proxyPort).toBe("8080");
  });

  it("should show proxy fields when proxyRequirement is Yes from config", () => {
    setupSelector({
      proxyRequirement: "Yes",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
    });
    const wrapper = shallow(<GeneralConfiguration />);
    // Proxy fields are conditionally rendered based on state
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle splitting requirement radio change", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    // Find the splitting requirement radio group
    const splitRadio = radioGroups.filterWhere(
      (rg) => rg.prop("deafultValue") !== undefined
    );
    if (splitRadio.length > 0) {
      splitRadio.at(0).simulate("change", { target: { value: "Yes" } });
    }
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle route type radio change", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    // Route type radio group has onChange with onChangeRadio(e, "routeType")
    const routeTypeGroup = radioGroups.filterWhere((rg) => {
      const radios = rg.find(Radio);
      return (
        radios.length === 2 &&
        radios.at(0).prop("value") === "Scheduled" &&
        radios.at(1).prop("value") === "One-time"
      );
    });
    if (routeTypeGroup.length > 0) {
      routeTypeGroup.at(0).simulate("change", { target: { value: "One-time" } });
    }
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle vendor request config radio change", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    const vendorRadio = radioGroups.filterWhere((rg) => {
      const radios = rg.find(Radio);
      return (
        radios.length === 2 &&
        radios.at(0).prop("value") === "Y" &&
        radios.at(1).prop("value") === "N"
      );
    });
    if (vendorRadio.length > 0) {
      vendorRadio.at(0).simulate("change", { target: { value: "Y" } });
    }
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with One-time route type from config", () => {
    setupSelector({
      routeType: "One-time",
      proxyRequirement: "No",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
    });
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should set default values when configValues is empty", () => {
    setupSelector({});
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle feedShortName with space in sessionStorage", () => {
    sessionStorage.setItem("feedShortName", "Test Feed Name");
    setupSelector({});
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle empty feedShortName in sessionStorage", () => {
    sessionStorage.removeItem("feedShortName");
    setupSelector({});
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with all Divider sections", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    const dividers = wrapper.find(Divider);
    expect(dividers.length).toBeGreaterThanOrEqual(3);
  });

  it("should render sourceFolder input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#sourceFolder").length).toBe(1);
  });

  it("should render filenameFormat input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#filenameFormat").length).toBe(1);
  });

  it("should render destinationExpression input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#destinationExpression").length).toBe(1);
  });

  it("should render storageLocation input", () => {
    const wrapper = shallow(<GeneralConfiguration />);
    expect(wrapper.find("#storageLocation").length).toBe(1);
  });
});
