import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import NewVendorHead from "../../../components/vendors/AddVendor/NewVendorHead";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: jest.fn(),
}));

const wrapper = shallow(<NewVendorHead />);

it("wrapper", () => {
  const element = wrapper.find(".header-one");
  expect(element.length).toBe(1);
});
