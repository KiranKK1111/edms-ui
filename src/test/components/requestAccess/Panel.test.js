import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import Panel from "../../../components/requestAccess/Panel";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: () => <div />,
  withRouter: (x) => x,
  useHistory: jest.fn(),
  __esModule: true,
  useLocation: jest.fn().mockReturnValue({
    pathname: "/another-route",
    search: "",
    hash: "",
    state: { data: { dataFeedLongName: "" } },
    key: "5nvxpbdafa",
  }),
}));

const dataset = { subscriptionInfo: {} };
const requestAccess = { businessRequirements: {}, tableInfo: {} };
const state = { dataset, requestAccess };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<Panel />);

it("wrapper", () => {
  const element = wrapper.find(".panel");
  expect(element.length).toBe(1);
});