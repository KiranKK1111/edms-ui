import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { TCApplicationSubscription } from "../../../components/termsAndConditions/tcApplicationSubscription";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const wrapper = shallow(<TCApplicationSubscription />);

it("wrapper", () => {
  const element = wrapper.find(".terms-conditions");
  expect(element.length).toBe(1);
});
