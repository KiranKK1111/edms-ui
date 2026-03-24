import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Input, Button } from "antd";
import LoginForm from "../../../components/login/LoginForm";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render a Form component", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render form with name normal_login", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Form).prop("name")).toBe("normal_login");
  });

  it("should render Form.Item components", () => {
    const wrapper = shallow(<LoginForm />);
    const formItems = wrapper.find(Form.Item);
    expect(formItems.length).toBeGreaterThanOrEqual(2);
  });

  it("should render Input.Password for password field", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Input.Password).length).toBe(1);
  });

  it("should render login button", () => {
    const wrapper = shallow(<LoginForm />);
    const button = wrapper.find(Button);
    expect(button.length).toBe(1);
    expect(button.prop("htmlType")).toBe("submit");
  });

  it("should render login button with text Log in", () => {
    const wrapper = shallow(<LoginForm />);
    const button = wrapper.find(Button);
    expect(button.children().text()).toBe("Log in");
  });

  it("should have login-form className", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Form).prop("className")).toBe("login-form");
  });

  it("should clear localStorage on render", () => {
    localStorage.setItem("testKey", "testValue");
    shallow(<LoginForm />);
    expect(localStorage.getItem("testKey")).toBeNull();
  });

  it("should render PSID placeholder for username", () => {
    const wrapper = shallow(<LoginForm />);
    const usernameInput = wrapper.find(Input).first();
    expect(usernameInput.prop("placeholder")).toBe("PSID");
  });

  it("should render Password placeholder", () => {
    const wrapper = shallow(<LoginForm />);
    const passwordInput = wrapper.find(Input.Password);
    expect(passwordInput.prop("placeholder")).toBe("Password");
  });

  it("should not show error alert initially", () => {
    const wrapper = shallow(<LoginForm />);
    const errorAlert = wrapper.find("ErrorAlert");
    expect(errorAlert.length).toBe(0);
  });

  it("should render button with primary type", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Button).prop("type")).toBe("primary");
  });

  it("should render button with large size", () => {
    const wrapper = shallow(<LoginForm />);
    expect(wrapper.find(Button).prop("size")).toBe("large");
  });
});
