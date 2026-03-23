import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import DatasetBreadcrumb from "../../../components/dataset/DatasetBreadcrumb";

configure({ adapter: new Adapter() });

const wrapper = shallow(<DatasetBreadcrumb />);

it("wrapper", () => {
  const element = wrapper.find(Breadcrumb);
  expect(element.length).toBe(1);
});