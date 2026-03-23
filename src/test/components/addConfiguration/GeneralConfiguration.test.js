import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form, Select } from "antd";
import GeneralConfiguration from "../../../components/addConfiguration/GeneralConfiguration";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

const wrapper = shallow(<GeneralConfiguration />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });

  it("wrapper", () => {
    const element = wrapper.find(Select).find(Option);
    expect(element.length).toBe(5);
  });
});