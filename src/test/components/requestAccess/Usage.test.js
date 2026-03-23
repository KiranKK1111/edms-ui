import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form } from "antd";

import Usage from "../../../components/requestAccess/Usage";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));
const requestAccess = {
  tableInfo: {
    contractExpDate: "",
    licenseStatus: "",
  },
  businessRequirements: [{ subscriptionId: "" }],
};
const state = { requestAccess };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<Usage />);

it("wrapper", () => {
  const element = wrapper.find(Form);
  expect(element.length).toBe(1);
});
