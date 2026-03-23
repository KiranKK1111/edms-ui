import { configure, shallow, sleep } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import MyTasksDashboardNew from "../../pages/myTasks/MyTasksDashboardNew";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
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

describe("Parent", () => {
  const wrapped = shallow(<MyTasksDashboardNew />);
  it("Header panel", () => {
    const element = wrapped.find("#header-panel");
    expect(element.length).toBe(1);
  });
  it("Radio buttion simulation", () => {
    setTimeout(() => {
      const setState = jest.fn();
      const useStateSpy = jest.spyOn(React, "useState");
      useStateSpy.mockImplementation((init) => [init, setState]);
      const button = wrapped.find("#btn-pending");
      button.simulate("click");
      expect(setState).toHaveBeenCalledWith(1);
    }, 500);
  });
  it("Simulate popup", () => {
    setTimeout(() => {
      const spy = jest.fn();
      wrapped.find(".link-button").at(0).simulate("click");
      expect(spy).toHaveBeenCalled();
    }, 500);
  });

  it("main", () => {
    setTimeout(() => {
      const element = wrapped.find("#main");
      expect(element.length).toBe(1);
    }, 500);
  });
});
