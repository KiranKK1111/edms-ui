import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import TermsConditions from "../../../components/requestAccess/TermsConditions";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const wrapper = shallow(<TermsConditions />);

it("wrapper", () => {
  const element = wrapper.find(".terms-and-conditions");
  expect(element.length).toBe(1);
});