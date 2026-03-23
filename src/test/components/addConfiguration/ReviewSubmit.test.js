import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import ReviewSubmit from "../../../components/addConfiguration/ReviewSubmit";

const mockUseLocationValue = {
  pathname: "/masterData/DF2025224459333400/addConfiguration",
  state: {
      isUpdate: true
  },
  search: "",
  hash: "",
  key: "dcvlbu"
}

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: jest.fn().mockImplementation(() => {
    return mockUseLocationValue;
  }),
}));

const datafeedInfo = {
  congigUi: {
    proxyRequirement: true,
  },
};

const state = { datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state))

const wrapper = shallow(<ReviewSubmit />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });
});