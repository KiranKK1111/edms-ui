import * as redux from "react-redux";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Row, Col } from "antd";
import ReviewSubmit from "../../../components/vendors/AddVendor/ReviewSubmit";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const setupSelector = (vendorData = {}) => {
  const state = { vendor: { data: vendorData } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ReviewSubmit (Vendor)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render main container", () => {
    setupSelector({
      longName: "Test Vendor",
      shortName: "TV",
      entityDescription: "A test vendor",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find("#main").length).toBe(1);
  });

  it("should render Row component", () => {
    setupSelector({
      longName: "Test Vendor",
      shortName: "TV",
      entityDescription: "Description",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Row).length).toBe(1);
  });

  it("should render Col for each data field", () => {
    setupSelector({
      longName: "Test Vendor",
      shortName: "TV",
      entityType: "Vendor",
      entityDescription: "A test vendor",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(Col).length).toBe(4);
  });

  it("should give entityDescription col span 16", () => {
    setupSelector({
      longName: "Test",
      entityDescription: "Description",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const descCol = wrapper
      .find(Col)
      .filterWhere((c) => c.prop("span") === 16);
    expect(descCol.length).toBe(1);
  });

  it("should give non-description cols span 8", () => {
    setupSelector({
      longName: "Test",
      shortName: "T",
      entityDescription: "Description",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const normalCols = wrapper
      .find(Col)
      .filterWhere((c) => c.prop("span") === 8);
    expect(normalCols.length).toBe(2);
  });

  it("should display dash for empty values", () => {
    setupSelector({
      longName: "",
      shortName: "TV",
      entityDescription: "Description",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.text()).toContain("-");
  });

  it("should render website as a link", () => {
    setupSelector({
      website: "www.example.com",
      entityDescription: "Test",
    });
    const wrapper = shallow(<ReviewSubmit />);
    const link = wrapper.find("a");
    expect(link.length).toBe(1);
    expect(link.prop("href")).toBe("https://www.example.com");
  });

  it("should display label-review spans", () => {
    setupSelector({
      longName: "Test",
      entityDescription: "Description",
    });
    const wrapper = shallow(<ReviewSubmit />);
    expect(wrapper.find(".label-review").length).toBeGreaterThanOrEqual(1);
  });
});
