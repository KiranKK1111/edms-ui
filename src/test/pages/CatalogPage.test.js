import { Button } from "antd";
import { configure, shallow } from "enzyme";

import Adapter from "enzyme-adapter-react-16";

import CatalogPage from "../../pages/catalogPage/CatalogPage";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

const wrapped = shallow(<CatalogPage />);
describe("Parent", () => {
  it("Logo presenting", () => {
    const element = wrapped.find("#main");
    expect(element.length).toBe(1);
  });
  it("Button filter", () => {
    const e = { preventDefault: () => {} };
    jest.spyOn(e, "preventDefault");
    wrapped.find("#btn-filter").simulate("click", e);
    expect(e.preventDefault).toBeCalled();
  });

  it("should render the main container div", () => {
    expect(wrapped.find("#main").exists()).toBe(true);
  });

  it("should have filter button", () => {
    expect(wrapped.find("#btn-filter").exists()).toBe(true);
  });
});
