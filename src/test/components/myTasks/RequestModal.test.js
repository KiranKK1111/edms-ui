import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Modal } from "antd";
import RequestModal from "../../../components/myTasks/RequestModal";

configure({ adapter: new Adapter() });

const props = {
  title: "Approve Task",
};
const wrapper = shallow(<RequestModal {...props} />);

it("wrapper", () => {
  const element = wrapper.find(Modal);
  expect(element.length).toBe(1);
});