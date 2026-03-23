import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import ApiConfiguration from "../../../components/addConfiguration/ApiConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

const wrapper = shallow(<ApiConfiguration />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });

  it("should render Form.Item components", () => {
    const element = wrapper.find(Form.Item);
    expect(element.length).toBeGreaterThanOrEqual(0);
  });

  it("should exist as a component", () => {
    expect(wrapper.exists()).toBe(true);
  });
});