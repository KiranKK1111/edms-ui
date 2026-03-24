import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Route, Redirect } from "react-router-dom";
import ProtectedRoute from "../../../components/login/protectedRoute";

configure({ adapter: new Adapter() });

jest.mock("../../../store/services/AuthService", () => ({
  isAuthenticated: jest.fn(),
}));

const { isAuthenticated } = require("../../../store/services/AuthService");

const DummyComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should render a Route component", () => {
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/test" />
    );
    expect(wrapper.find(Route).length).toBe(1);
  });

  it("should pass path prop to Route", () => {
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/dashboard" />
    );
    expect(wrapper.find(Route).prop("path")).toBe("/dashboard");
  });

  it("should render component when guestRole is set", () => {
    localStorage.setItem("guestRole", "guest");
    isAuthenticated.mockReturnValue(false);
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/test" />
    );
    const route = wrapper.find(Route);
    const renderProp = route.prop("render");
    const result = renderProp({ location: { pathname: "/test" } });
    expect(result.type).toBe(DummyComponent);
  });

  it("should render component when code is set in localStorage", () => {
    localStorage.setItem("code", "auth-code-123");
    isAuthenticated.mockReturnValue(false);
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/test" />
    );
    const route = wrapper.find(Route);
    const renderProp = route.prop("render");
    const result = renderProp({ location: { pathname: "/test" } });
    expect(result.type).toBe(DummyComponent);
  });

  it("should render component when isAuthenticated returns true", () => {
    isAuthenticated.mockReturnValue(true);
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/test" />
    );
    const route = wrapper.find(Route);
    const renderProp = route.prop("render");
    const result = renderProp({ location: { pathname: "/test" } });
    expect(result.type).toBe(DummyComponent);
  });

  it("should redirect to / when not authenticated", () => {
    isAuthenticated.mockReturnValue(false);
    const wrapper = shallow(
      <ProtectedRoute component={DummyComponent} path="/test" />
    );
    const route = wrapper.find(Route);
    const renderProp = route.prop("render");
    const result = renderProp({ location: { pathname: "/test" } });
    expect(result.type).toBe(Redirect);
    expect(result.props.to).toEqual({ pathname: "/" });
  });

  it("should pass extra props to the component", () => {
    localStorage.setItem("guestRole", "guest");
    const wrapper = shallow(
      <ProtectedRoute
        component={DummyComponent}
        path="/test"
        extraProp="value"
      />
    );
    const route = wrapper.find(Route);
    const renderProp = route.prop("render");
    const result = renderProp({ location: { pathname: "/test" } });
    expect(result.type).toBe(DummyComponent);
    expect(result.props.extraProp).toBe("value");
  });
});
