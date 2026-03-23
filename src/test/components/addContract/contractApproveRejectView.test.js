import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { Breadcrumb } from "antd";
import ContractApproveRejectView from "../../../components/addContract/contractApproveRejectView";

configure({ adapter: new Adapter() });

const history = createMemoryHistory();
const state = { myTaskData: {} };

history.push("/", state);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useHistory: jest.fn(),
}));
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

const wrapper = shallow(
  <Router history={history}>
    <ContractApproveRejectView />{" "}
  </Router>
);

it("wrapper", () => {
  // console.log(wrapper.debug());
  // const element = wrapper.find("#h-panel");
  //expect(element.length).toBe(1);
});