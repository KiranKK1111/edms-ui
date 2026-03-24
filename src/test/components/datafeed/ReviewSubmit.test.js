import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Row, Col, Descriptions } from "antd";
import ReviewSubmit from "../../../components/datafeed/ReviewSubmit";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn().mockReturnValue({
    state: { dataset: { datasetId: "DS001" }, isUpdate: false },
  }),
}));

const setupSelector = (formData = {}) => {
  const state = { datafeedInfo: { formData } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ReviewSubmit (Datafeed)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useLocation } = require("react-router-dom");
    useLocation.mockReturnValue({
      state: { dataset: { datasetId: "DS001" }, isUpdate: false },
    });
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    localStorage.setItem("entitlementType", "Dataset Owner");
  });

  it("should render main container", () => {
    setupSelector({
      dataFeedId: "DF001",
      url: "",
      status: "Pending",
      dataFeedConfiguration: "",
      longName: "Test Feed",
      shortName: "TF",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "Test",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render General Details heading", () => {
    setupSelector({
      dataFeedId: "",
      url: "",
      status: "",
      dataFeedConfiguration: "",
      longName: "",
      shortName: "",
      dataConfidentiality: "",
      personalData: "",
      feedDescription: "",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find("h3").text()).toBe("General Details");
  });

  it("should render review-submit class", () => {
    setupSelector({
      dataFeedId: "",
      url: "",
      status: "",
      dataFeedConfiguration: "",
      longName: "",
      shortName: "",
      dataConfidentiality: "",
      personalData: "",
      feedDescription: "",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(".review-submit").length).toBe(1);
  });

  it("should render Row component", () => {
    setupSelector({
      dataFeedId: "",
      url: "",
      status: "",
      dataFeedConfiguration: "",
      longName: "",
      shortName: "",
      dataConfidentiality: "",
      personalData: "",
      feedDescription: "",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Row).length).toBe(1);
  });

  it("should render Descriptions for non-url and non-personalDataType fields", () => {
    setupSelector({
      dataFeedId: "DF001",
      url: "",
      status: "Pending",
      longName: "Test",
      shortName: "T",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "Desc",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
      dataFeedConfiguration: "",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Descriptions).length).toBeGreaterThanOrEqual(1);
  });

  it("should dispatch formDataFn on mount", () => {
    const mockUseEffect = jest.spyOn(require("react"), "useEffect");
    mockUseEffect.mockImplementation((cb) => cb());
    setupSelector({
      dataFeedId: "",
      url: "",
      status: "",
      dataFeedConfiguration: "",
      longName: "",
      shortName: "",
      dataConfidentiality: "",
      personalData: "",
      feedDescription: "",
      feedId: "",
      feedStatus: "",
      documentationLink: "",
    });
    shallow(<ReviewSubmit />);
    expect(mockDispatch).toHaveBeenCalled();
    mockUseEffect.mockRestore();
  });
});
