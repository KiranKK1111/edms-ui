import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import ReviewSubmit from "../../../components/license/reviewSubmit/ReviewSubmit";

configure({ adapter: new Adapter() });

jest.spyOn(console, "warn").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: null,
    key: "5nvxpbdafa",
  }),
}));

const licenseReq = {
  licenseDetailsRequirements: [{ expirationDate: "" }],
  support: [{}],
};
const state = { licenseReq };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<ReviewSubmit stepsdata={{ licenseName: "" }} />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});