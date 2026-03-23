import * as redux from "react-redux";
import { configure, shallow, sleep, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import ReviewSubmit from "../../../components/datafeed/ReviewSubmit";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));

const datafeedInfo = {
  formData: {
    dataFeedId: "",
    url: "",
    status: "",
    dataFeedConfiguration: "",
    longName: "",
    shortName: "",
    dataConfidentiality: "",
    personalDataType: "",
    description: "",
  },
};

const state = { datafeedInfo };

jest
  .spyOn(redux, "useSelector")
  .mockImplementation((callback) => callback(state));

const wrapper = shallow(<ReviewSubmit />);

describe("parent", () => {
  it("wrapper", () => {
    const element = wrapper.find("#main");
    expect(element.length).toBe(1);
  });
});