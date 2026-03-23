import { configure, shallow, sleep } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import LoginForm from "../../../components/login/LoginForm";

configure({ adapter: new Adapter() });
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
const wrapper = shallow(<LoginForm />);

describe("Parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });
});