import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Form, Input, Select, Row, Col } from "antd";
import DatafeedDetails from "../../../components/datafeed/DatafeedDetails";

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
  useLocation: jest
    .fn()
    .mockReturnValue({
      state: { dataset: { datasetId: "DS001" }, isUpdate: false },
    }),
}));

const setupSelector = (formData = {}, datafeedsData = []) => {
  const state = {
    datafeedInfo: { formData, datafeedsData },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("DatafeedDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render main container", () => {
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render Form component", () => {
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render Form.Item components", () => {
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find(Form.Item).length).toBeGreaterThanOrEqual(6);
  });

  it("should render disabled Data Feed ID input", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const dfIdInput = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("name") === "datafeedId");
    expect(dfIdInput.prop("disabled")).toBe(true);
  });

  it("should render disabled Status input", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const statusInput = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("name") === "status");
    expect(statusInput.prop("disabled")).toBe(true);
  });

  it("should render disabled Dataset Short Name input", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const dsNameInput = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("name") === "dataSetName");
    expect(dsNameInput.prop("disabled")).toBe(true);
  });

  it("should render Data Confidentiality Select", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const selects = wrapper
      .find(Select)
      .filterWhere((s) => s.prop("name") === "dataConfidentiality");
    expect(selects.length).toBe(1);
  });

  it("should render Personal Data Type Select", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const selects = wrapper
      .find(Select)
      .filterWhere((s) => s.prop("name") === "personalDataType");
    expect(selects.length).toBe(1);
  });

  it("should render Long Name input", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const input = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("name") === "longName");
    expect(input.length).toBe(1);
  });

  it("should render Short Name input", () => {
    const wrapper = shallow(<DatafeedDetails />);
    const input = wrapper
      .find(Input)
      .filterWhere((inp) => inp.prop("name") === "shortName");
    expect(input.length).toBe(1);
  });

  it("should render Description TextArea", () => {
    const { Input: AntInput } = require("antd");
    const { TextArea } = AntInput;
    const wrapper = shallow(<DatafeedDetails />);
    const textarea = wrapper.find(TextArea);
    expect(textarea.length).toBe(1);
    expect(textarea.prop("maxLength")).toBe(1000);
  });

  it("should render Row components", () => {
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find(Row).length).toBeGreaterThanOrEqual(4);
  });

  it("should render with existing form data", () => {
    setupSelector({
      feedId: "DF001",
      feedStatus: "Active",
      longName: "Test Feed",
      shortName: "TF",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "A test feed",
      documentationLink: "http://example.com",
    });
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find(Form).length).toBe(1);
  });

  it("should render with options for data confidentiality", () => {
    const { Select: AntSelect } = require("antd");
    const { Option: SelectOption } = AntSelect;
    const wrapper = shallow(<DatafeedDetails />);
    const options = wrapper
      .find(Select)
      .filterWhere((s) => s.prop("name") === "dataConfidentiality")
      .find(SelectOption);
    expect(options.length).toBe(4);
  });

  it("should render with options for personal data type", () => {
    const { Select: AntSelect } = require("antd");
    const { Option: SelectOption } = AntSelect;
    const wrapper = shallow(<DatafeedDetails />);
    const options = wrapper
      .find(Select)
      .filterWhere((s) => s.prop("name") === "personalDataType")
      .find(SelectOption);
    expect(options.length).toBe(3);
  });

  it("should set form name to br-one", () => {
    const wrapper = shallow(<DatafeedDetails />);
    expect(wrapper.find(Form).prop("name")).toBe("br-one");
  });
});
