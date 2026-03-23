import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { TCVendorRequestSubscription } from "../../../components/termsAndConditions/tcVendorRequestSubscription";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const wrapper = shallow(<TCVendorRequestSubscription />);

it("wrapper", () => {
  const element = wrapper.find(".terms-conditions");
  expect(element.length).toBe(1);
});