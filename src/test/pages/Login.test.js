import { configure, shallow } from "enzyme";

import Adapter from "enzyme-adapter-react-16";
import { Tooltip } from "antd";

import Login from "../../pages/Login";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn().mockResolvedValue(undefined);
jest.mock("react-redux", () => {
  return {
    useSelector: jest.fn(),
    useDispatch: () => mockDispatch,
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => ({
      mapStateToProps,
      mapDispatchToProps,
      Component,
    }),
    Provider: ({ children }) => children,
  };
});

jest.mock("../../store/services/AuthService", () => ({
  fetchUserMatrix: jest.fn().mockResolvedValue({
    data: { objectMatrix: {} },
  }),
}));

jest.mock("../../store/actions/loginActions", () => ({
  startUserLogin: jest.fn(),
  startUserLoginForgerock: jest.fn(),
}));

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockResolvedValue(undefined);
    localStorage.clear();
    delete window.location;
    window.location = {
      href: "http://localhost:3000",
      host: "localhost:3000",
      assign: jest.fn(),
      search: "",
    };
  });

  it("should render the login page", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.exists()).toBe(true);
  });

  it("should have a main container", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find("#main").exists()).toBe(true);
  });

  it("should render the login-wrapper div", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".login-wrapper").length).toBe(1);
  });

  it("should render the login-panel div", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".login-panel").length).toBe(1);
  });

  it("should render the login-box div", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".login-box").length).toBe(1);
  });

  it("should render Welcome to External Data Platform heading", () => {
    const wrapped = shallow(<Login />);
    const h3 = wrapped.find("h3");
    expect(h3.length).toBe(1);
    expect(h3.text()).toContain("Welcome to");
    expect(h3.text()).toContain("External Data Platform");
  });

  it("should render Continue to Catalogue button", () => {
    const wrapped = shallow(<Login />);
    const btn = wrapped.find("#btn-forgeRock");
    expect(btn.length).toBe(1);
    expect(btn.text()).toContain("Continue to Catalogue");
  });

  it("should render Contact us button", () => {
    const wrapped = shallow(<Login />);
    const contactBtn = wrapped.find(".btn-link.need-help");
    expect(contactBtn.length).toBe(1);
  });

  it("should render Tooltip with contact information", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(Tooltip).length).toBeGreaterThanOrEqual(1);
  });

  it("should render logo elements", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".logo-bg").length).toBe(1);
    expect(wrapped.find(".logo-right").length).toBe(1);
  });

  it("should render login quote", () => {
    const wrapped = shallow(<Login />);
    const quote = wrapped.find(".login-quote");
    expect(quote.text()).toBe("One-stop shop for all external data feeds.");
  });

  it("should show env info for non-edp environments", () => {
    const wrapped = shallow(<Login />);
    const envInfo = wrapped.find(".env-info");
    expect(envInfo.length).toBe(1);
  });

  it("should render without crashing when history prop is provided", () => {
    const mockHistory = { push: jest.fn() };
    const wrapped = shallow(<Login history={mockHistory} />);
    expect(wrapped.exists()).toBe(true);
  });

  it("should render login-container with logo and quote", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".login-container").length).toBe(1);
    expect(wrapped.find(".logo-left").length).toBe(1);
  });

  it("should render env-left-logo section", () => {
    const wrapped = shallow(<Login />);
    expect(wrapped.find(".env-left-logo").length).toBe(1);
  });

  it("should call window.location.assign with Entra URL when Continue to Catalogue button is clicked", () => {
    const wrapped = shallow(<Login />);
    const btn = wrapped.find("#btn-forgeRock");
    btn.simulate("click");
    expect(window.location.assign).toHaveBeenCalledTimes(1);
    const assignedUrl = window.location.assign.mock.calls[0][0];
    expect(assignedUrl).toContain("/authorize?client_id=");
    expect(assignedUrl).toContain("response_type=code");
    expect(assignedUrl).toContain("redirect_uri=https://localhost:3000");
    expect(assignedUrl).toContain("response_mode=query");
    expect(assignedUrl).toContain("scope=openid+profile+offline_access");
  });
});
