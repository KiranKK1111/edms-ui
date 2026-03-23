import { configure, shallow } from "enzyme";

import Adapter from "enzyme-adapter-react-16";

import Login from "../../pages/Login";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
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
const wrapped = shallow(<Login />);

describe("Login Page", () => {
  it("Logo presenting", () => {
    const element = wrapped.find("#main");
    expect(element.length).toBe(1);
  });

  it("should render the login page", () => {
    expect(wrapped.exists()).toBe(true);
  });

  it("should have a main container", () => {
    expect(wrapped.find("#main").exists()).toBe(true);
  });
});
