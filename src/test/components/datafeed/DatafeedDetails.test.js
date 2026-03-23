import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import DatafeedDetails from "../../../components/datafeed/DatafeedDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));

const wrapper = shallow(<DatafeedDetails />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
});