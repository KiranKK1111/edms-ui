import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import LicenseLimitations from "../../../components/license/licenseLimitations/LicenseLimitations";

configure({ adapter: new Adapter() });

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
  useParams: jest.fn(),
}));
const wrapper = shallow(<LicenseLimitations />);

it("wrapper", () => {
  const element = wrapper.find(Form);
  expect(element.length).toBe(1);
});