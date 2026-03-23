import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import { createMemoryHistory } from "history";
import Adapter from "enzyme-adapter-react-16";

import ReviewSubmit from "../../../components/addContract/ReviewSubmit";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const contract = {
  contractDetails: [{}],
  vendorContacts: [{}],
  upload: {},
};
const state = { contract };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

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
const wrapper = shallow(<ReviewSubmit />);

it("wrapper", () => {
  const element = wrapper.find("#main");
  expect(element.length).toBe(1);
});