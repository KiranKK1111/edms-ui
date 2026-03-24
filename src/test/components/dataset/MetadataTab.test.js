import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Card } from "antd";
import MetadataTab from "../../../components/dataset/MetadataTab";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const setupSelector = (metadatadetail = {}) => {
  const state = {
    datafeedInfo: {
      metadatadetail: metadatadetail,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("MetadataTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render Card component", () => {
    setupSelector({ data: { schemaString: "", type: "" } });
    const wrapper = shallow(<MetadataTab />);
    expect(wrapper.find(Card).length).toBe(1);
  });

  it("should render with schema data", () => {
    setupSelector({
      data: {
        schemaString: '{"type":"object","properties":{}}',
        type: "json",
      },
    });
    const wrapper = shallow(<MetadataTab />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with empty schema string", () => {
    setupSelector({ data: { schemaString: "", type: "" } });
    const wrapper = shallow(<MetadataTab />);
    expect(wrapper.find(Card).length).toBe(1);
  });

  it("should render with null metadata", () => {
    setupSelector({ data: null });
    const wrapper = shallow(<MetadataTab />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render with undefined metadata", () => {
    setupSelector({});
    const wrapper = shallow(<MetadataTab />);
    expect(wrapper.exists()).toBe(true);
  });
});
