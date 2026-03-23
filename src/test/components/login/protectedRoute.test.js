import { configure, shallow, sleep } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Route } from "react-router-dom";
import { Form } from "antd";
import ProtectedRoute from "../../../components/login/protectedRoute";

configure({ adapter: new Adapter() });

const wrapper = shallow(<ProtectedRoute />);

describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Route);
    expect(element.length).toBe(1);
  });
});