import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import ViewDatafeed from "../../pages/datafeed/ViewDatafeed";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: jest.fn(),
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: { datafeedRecord: {}, dataset: { shortName: "" } },
    key: "5nvxpbdafa",
  }),
}));
const datafeedInfo = {
  formData: { feedId: "" },
};
const state = { datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<ViewDatafeed />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});
