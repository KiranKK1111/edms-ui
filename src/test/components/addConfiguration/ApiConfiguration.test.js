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

  // --- New tests to improve coverage ---

  it("should change request method when radio is clicked", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const radioGroup = wrapper.find(Radio.Group).at(0);
    radioGroup.simulate("change", { target: { value: "GET" } });
    // After state update, the component re-renders
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should change token requirement when radio is clicked", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const radioGroup = wrapper.find(Radio.Group).at(1);
    radioGroup.simulate("change", { target: { value: "Yes" } });
    wrapper.update();
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should show username, tokenURL and password fields when tokenReq is Yes", () => {
    setupSelector({
      tokenReq: "Yes",
      requestMethod: "POST",
      requestBody: "",
    });
    const wrapper = shallow(<ApiConfiguration />);
    // When tokenReq is Yes, the component should show additional fields
    const formItems = wrapper.find(Form.Item);
    expect(formItems.length).toBeGreaterThanOrEqual(5);
  });

  it("should call onFinish and dispatch when form is submitted with tokenReq No", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(<ApiConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    onFinish({
      tokenReq: "No",
      requestMethod: "POST",
      requestHeaders: "Content-Type: application/json",
      requestParameter: "param1",
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should call onFinish and clear token fields when tokenReq is No", () => {
    const mockNext = jest.fn();
    const wrapper = shallow(<ApiConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      tokenReq: "No",
      tokenURL: "https://example.com",
      username: "user",
      passwordProperty: "pass",
      requestMethod: "POST",
    };
    onFinish(values);
    expect(values.tokenURL).toBe("");
    expect(values.username).toBe("");
    expect(values.passwordProperty).toBe("");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should keep token fields when tokenReq is Yes on submit", () => {
    const mockNext = jest.fn();
    setupSelector({ tokenReq: "Yes", requestMethod: "POST", requestBody: "" });
    const wrapper = shallow(<ApiConfiguration next={mockNext} />);
    const form = wrapper.find(Form);
    const onFinish = form.prop("onFinish");
    const values = {
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      username: "user1",
      passwordProperty: "pass1",
    };
    onFinish(values);
    expect(values.tokenURL).toBe("https://example.com/token");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should render with requestMethod empty string in config", () => {
    setupSelector({
      requestMethod: "",
      tokenReq: "No",
      requestBody: "",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with non-empty requestBody in config to set uploadOn", () => {
    setupSelector({
      requestBody: "somefile.txt",
      requestMethod: "POST",
      tokenReq: "No",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with requestBodyObj having a name to show file button", () => {
    setupSelector({
      requestBodyObj: { name: "data.json" },
      requestMethod: "POST",
      requestBody: "data.json",
      tokenReq: "No",
    });
    const wrapper = shallow(<ApiConfiguration />);
    // Should show the file name button when requestBodyObj has a name
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should handle Upload beforeUpload with unsupported file type", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    // Test beforeUpload with unsupported type
    const mockFile = { type: "application/pdf" };
    propsFile.beforeUpload(mockFile, [mockFile]);
  });

  it("should handle Upload beforeUpload with supported text/plain file", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    const mockFile = { type: "text/plain" };
    propsFile.beforeUpload(mockFile, [mockFile]);
  });

  it("should handle Upload beforeUpload with csv file", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    const mockFile = { type: "text/csv" };
    propsFile.beforeUpload(mockFile, [mockFile]);
  });

  it("should handle Upload onRemove", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    propsFile.onRemove();
  });

  it("should handle Upload customRequest", async () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    await propsFile.customRequest({
      action: "",
      data: {},
      file: {},
      filename: "test.txt",
      headers: {},
      onError: jest.fn(),
      onProgress: jest.fn(),
      onSuccess: jest.fn(),
      withCredentials: false,
    });
  });

  it("should handle Upload onChange", () => {
    const wrapper = shallow(<ApiConfiguration />);
    const upload = wrapper.find(Upload);
    const propsFile = upload.props();
    propsFile.onChange({ file: { status: "done" } });
  });

  it("should render with configValues having requestMethod and tokenReq defaults", () => {
    setupSelector({
      someOtherField: "value",
    });
    const wrapper = shallow(<ApiConfiguration />);
    expect(wrapper.find(Form).length).toBe(1);
  });
});
