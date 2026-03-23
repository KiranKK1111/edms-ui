import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import ApproveRejectModal from "../../components/Modals/ApproveRejectModal";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const wrapper = shallow(<ApproveRejectModal />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});
