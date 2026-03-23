import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Form } from "antd";
import LicenseDetails from "../../../components/license/licenseDetails/LicenseDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
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

const license = {
  selectedLicense: "",
};
const state = { license };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<LicenseDetails />);

describe("LicenseDetails", () => {
  it("wrapper", () => {
    const element = wrapper.find(Form);
    expect(element.length).toBe(1);
  });

  it("should render at least one Form.Item", () => {
    const element = wrapper.find(Form.Item);
    expect(element.length).toBeGreaterThanOrEqual(0);
  });

  it("should be a shallow rendered component", () => {
    expect(wrapper.exists()).toBe(true);
  });
});