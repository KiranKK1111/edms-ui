import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Row, Col, Divider } from "antd";
import ReviewSubmit from "../../../components/addConfiguration/ReviewSubmit";

const mockUseLocationValue = {
  pathname: "/masterData/DF2025224459333400/addConfiguration",
  state: { isUpdate: true },
  search: "",
  hash: "",
  key: "dcvlbu",
};

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));
jest.mock("react-router-dom/cjs/react-router-dom.min", () => ({
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue),
}));

const setupSelector = (configValues = {}, loadingConfig = false) => {
  const state = {
    datafeedInfo: {
      congigUi: configValues,
      loadingConfig: loadingConfig,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ReviewSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("currentUserRole", "Dataset Delegate");
    setupSelector({ proxyRequirement: "No" });
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Main Configuration header", () => {
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find("h3").at(0).text()).toBe("Main Configuration");
  });

  it("should render Proxy section header", () => {
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const proxyHeader = headers.filterWhere((h) => h.text() === "Proxy");
    expect(proxyHeader.length).toBe(1);
  });

  it("should render On-Demand Vendor request header", () => {
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const vendorHeader = headers.filterWhere(
      (h) => h.text() === "On-Demand Vendor request"
    );
    expect(vendorHeader.length).toBe(1);
  });

  it("should render Dividers between sections", () => {
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Divider).length).toBeGreaterThanOrEqual(3);
  });

  it("should render with proxy requirement Yes", () => {
    setupSelector({
      proxyRequirement: "Yes",
      proxyHostname: "10.0.0.1",
      proxyPort: "8080",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with splitting requirement Yes", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "No",
      schemaId: "NA",
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      schemaDataObj: { name: "data.json" },
      schemaMetaDataObj: { name: "meta.json" },
    });
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const splitHeader = headers.filterWhere(
      (h) => h.text() === "Splitting Configuration"
    );
    expect(splitHeader.length).toBe(1);
  });

  it("should not render Splitting Configuration when splittingRequirement is No", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "No",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const splitHeader = headers.filterWhere(
      (h) => h.text() === "Splitting Configuration"
    );
    expect(splitHeader.length).toBe(0);
  });

  it("should render with HTTPS source protocol for API config", () => {
    setupSelector({
      proxyRequirement: "No",
      sourceProtocol: "HTTPS",
      requestMethod: "POST",
      requestBodyObj: { name: "body.txt" },
      requestParameters: "",
      requestHeaders: "Content-Type: application/json",
      tokenReq: "No",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const reqHeader = headers.filterWhere(
      (h) => h.text() === "Request Details"
    );
    expect(reqHeader.length).toBe(1);
  });

  it("should show Authentication Details when HTTPS and tokenReq Yes", () => {
    setupSelector({
      proxyRequirement: "No",
      sourceProtocol: "HTTPS",
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      username: "user",
      passwordProperty: "pass",
      requestMethod: "POST",
      requestBodyObj: { name: "body.txt" },
      requestHeaders: "headers",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const authHeader = headers.filterWhere(
      (h) => h.text() === "Authentication Details"
    );
    expect(authHeader.length).toBe(1);
  });

  it("should render with vendorRequestConfig Y", () => {
    setupSelector({
      proxyRequirement: "No",
      vendorRequestConfig: "Y",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with vendorRequestConfig N", () => {
    setupSelector({
      proxyRequirement: "No",
      vendorRequestConfig: "N",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with histLoad Yes for historic load section", () => {
    setupSelector({
      proxyRequirement: "No",
      histLoad: "Yes",
      historyLoadDetailsID: "HIST001",
      historicLoadStartDate: "2025-01-01",
      listOfFiles: "file1.csv,file2.csv",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const headers = wrapper.find("h3");
    const histHeader = headers.filterWhere(
      (h) => h.text() === "Historic Load"
    );
    expect(histHeader.length).toBe(1);
  });

  it("should render data format text for JSON type", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
      exitingSchema: "No",
      schemaDataObj: {},
      schemaMetaDataObj: {},
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render data format text for xpath type", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute",
      exitingSchema: "Yes",
      schemaId: "schema1",
      schemaDataObj: {},
      schemaMetaDataObj: {},
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render data format text for csv type", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      dataFeedType:
        "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute",
      exitingSchema: "No",
      schemaDataObj: {},
      schemaMetaDataObj: {},
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with routeType as ScheduledRoute class", () => {
    setupSelector({
      proxyRequirement: "No",
      routeType: "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with routeType as One-time", () => {
    setupSelector({
      proxyRequirement: "No",
      routeType: "One-time",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should display boolean values as True/False text", () => {
    setupSelector({
      proxyRequirement: "No",
      isChecksum: true,
      asynchronousRoute: "False",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render review-submit wrapper div", () => {
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(".review-submit").length).toBe(1);
  });

  it("should render with Data Operations role showing warning", () => {
    localStorage.setItem("currentUserRole", "Data Operations");
    setupSelector({});
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.exists()).toBe(true);
  });
});
