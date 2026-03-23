import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import UserProfile from "../../pages/userProfile/UserProfile";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
const wrapper = shallow(<UserProfile />);

it("wrapper", () => {
  const element = wrapper.find(".profile-container");
  expect(element.length).toBe(1);
});
