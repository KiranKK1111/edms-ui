import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import ReviewSubmit from "../../../components/vendors/AddVendor/ReviewSubmit";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
const vendor = {
  data: [{}],
};
const state = { vendor };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));
const wrapper = shallow(<ReviewSubmit />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});