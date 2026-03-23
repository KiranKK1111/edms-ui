import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import BreadcrumbComponent from "../../../components/breadcrumb/Breadcrumb";

configure({ adapter: new Adapter() });

const wrapper = shallow(<BreadcrumbComponent />);

it("wrapper", () => {
  const element = wrapper.find(Breadcrumb);
  expect(element.length).toBe(1);
});