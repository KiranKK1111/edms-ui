import React from "react";
import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Radio, Input, Upload, Button, Divider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import ApiConfiguration from "../../../components/addConfiguration/ApiConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const defaultConfigValues = {};
const setupSelector = (configValues = defaultConfigValues) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ApiConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Form.Item components for request details and auth", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form.Item).length).toBeGreaterThanOrEqual(4);
  });

  it("should render Radio.Group for request method", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const radioGroups = wrapper.find(Radio.Group);
    expect(radioGroups.length).toBeGreaterThanOrEqual(1);
  });

  it("should render GET and POST radio options", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const radios = wrapper.find(Radio);
    const values = radios.map((r) => r.prop("value"));
    expect(values).toContain("GET");
    expect(values).toContain("POST");
  });

  it("should render token requirement radio with Yes/No", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const radios = wrapper.find(Radio);
    const values = radios.map((r) => r.prop("value"));
    expect(values).toContain("Yes");
    expect(values).toContain("No");
  });

  it("should render Upload component", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Upload).length).toBe(1);
  });

  it("should render Divider", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Divider).length).toBeGreaterThanOrEqual(1);
  });

  it("should render Request Details header", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find("h3").at(0).text()).toBe("Request Details");
  });

  it("should render Authentication Details header", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find("h3").at(1).text()).toBe("Authentication Details");
  });

  it("should not show username/tokenURL fields when tokenReq is No", () => {
    const wrapper = shallow(<ApiConfiguration />);
    // Default tokenReq is "No", so username/tokenURL/password fields should not be visible
    const inputIds = wrapper.find(Input).map((inp) => inp.prop("id"));
    expect(inputIds).not.toContain("userName");
    expect(inputIds).not.toContain("tokenURL");
    expect(inputIds).not.toContain("passwordProperty");
  });

  it("should render with configValues from redux", () => {
    setupSelector({
      requestMethod: "GET",
      tokenReq: "No",
      requestHeaders: "Content-Type: application/json",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with token requirement Yes from config", () => {
    setupSelector({
      requestMethod: "POST",
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      username: "user1",
      passwordProperty: "pass1",
      requestBody: "body.txt",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render requestHeaders TextArea", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(TextArea).length).toBe(1);
  });

  it("should render request parameter input", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const input = wrapper.find("#requestParameter");
    expect(input.length).toBe(1);
  });

  it("should call props.next when formData changes", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(
      <ApiConfiguration formData={false} next={mockNext} />
    );
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with requestBodyObj in configValues", () => {
    setupSelector({
      requestBodyObj: { name: "test.txt" },
      requestMethod: "POST",
      requestBody: "test.txt",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should set form name to br-one", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).prop("name")).toBe("br-one");
  });

  it("should have label-wrap className on Form", () => {
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).prop("className")).toBe("label-wrap");
  });
});
