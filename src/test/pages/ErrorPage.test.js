import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Result, Button } from "antd";
import ErrorPage from "../../pages/error/ErrorPage";

configure({ adapter: new Adapter() });

describe("ErrorPage", () => {
  const mockHistory = { replace: jest.fn() };
  let wrapper;

  beforeEach(() => {
    mockHistory.replace.mockClear();
    wrapper = shallow(<ErrorPage history={mockHistory} />);
  });

  it("should render a Result component", () => {
    expect(wrapper.find(Result).length).toBe(1);
  });

  it("should display 404 status", () => {
    expect(wrapper.find(Result).prop("status")).toBe("404");
  });

  it("should display 404 title", () => {
    expect(wrapper.find(Result).prop("title")).toBe("404");
  });

  it("should display correct subtitle", () => {
    expect(wrapper.find(Result).prop("subTitle")).toBe(
      "Sorry, the page you visited does not exist."
    );
  });

  it("should have an extra prop with a Button", () => {
    const extraProp = wrapper.find(Result).prop("extra");
    expect(extraProp).toBeTruthy();
    expect(extraProp.type).toBe(Button);
  });

  it("should call history.replace with /catalog when button onClick is triggered", () => {
    const extraProp = wrapper.find(Result).prop("extra");
    // Call the onClick handler directly
    extraProp.props.onClick();
    expect(mockHistory.replace).toHaveBeenCalledWith("/catalog");
  });

  it("should render Button with type primary", () => {
    const extraProp = wrapper.find(Result).prop("extra");
    expect(extraProp.props.type).toBe("primary");
  });

  it("should render Button with text Back Home", () => {
    const extraProp = wrapper.find(Result).prop("extra");
    expect(extraProp.props.children).toBe("Back Home");
  });

  it("should call history.replace only once per click", () => {
    const extraProp = wrapper.find(Result).prop("extra");
    extraProp.props.onClick();
    extraProp.props.onClick();
    expect(mockHistory.replace).toHaveBeenCalledTimes(2);
  });
});
