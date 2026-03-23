import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import DisplayTC from "../../../components/requestAccess/DisplayTC";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const wrapper = shallow(<DisplayTC />);

it("wrapper", () => {
  const element = wrapper.find(".display-terms-and-conditions");
  expect(element.length).toBe(1);
});