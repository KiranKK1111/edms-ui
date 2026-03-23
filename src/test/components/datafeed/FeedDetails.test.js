import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import FeedDetails from "../../../components/datafeed/FeedDetails";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: "123" }),
  useHistory: jest.fn(),
}));

const history = createMemoryHistory({
  initialEntries: [
    "/one",
    {
      pathname: "https://URL/",
      state: {
        myTaskData: {
          taskListObjectAction: "",
          taskListTaskStatus: "",
          taskListCreatedBy: "",
        },
      },
    },
  ],
});

const wrapper = shallow(
  <Router history={history}>
    <FeedDetails />
  </Router>
);

describe("parent", () => {
  it("wrapper", () => {
    // const element = wrapper.find("#main");
    // expect(element.length).toBe(1);
    //console.log(wrapper.debug());
  });
});