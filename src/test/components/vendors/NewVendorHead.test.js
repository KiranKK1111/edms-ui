import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Breadcrumb, Button, PageHeader, Modal, Table } from "antd";
import { Link } from "react-router-dom";
import NewVendorHead from "../../../components/vendors/AddVendor/NewVendorHead";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: jest.fn().mockReturnValue({}),
  useHistory: () => ({ push: mockPush }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe("NewVendorHead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useParams } = require("react-router-dom");
    useParams.mockReturnValue({});
  });

  it("should render header-one container", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(".header-one").length).toBe(1);
  });

  it("should render Breadcrumb component", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(Breadcrumb).length).toBe(1);
  });

  it("should render Breadcrumb.Items", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(Breadcrumb.Item).length).toBe(3);
  });

  it("should show Add entity when no id param", () => {
    const wrapper = shallow(<NewVendorHead />);
    const itemChildren = wrapper.find(Breadcrumb.Item).at(2).prop("children");
    const text = []
      .concat(itemChildren)
      .filter((c) => typeof c === "string")
      .join("");
    expect(text).toContain("Add entity");
  });

  it("should show Edit entity when id param exists", () => {
    const { useParams } = require("react-router-dom");
    useParams.mockReturnValue({ id: "123" });
    const wrapper = shallow(<NewVendorHead />);
    const itemChildren = wrapper.find(Breadcrumb.Item).at(2).prop("children");
    const text = []
      .concat(itemChildren)
      .filter((c) => typeof c === "string")
      .join("");
    expect(text).toContain("Edit entity");
  });

  it("should render Cancel button", () => {
    const wrapper = shallow(<NewVendorHead />);
    const buttons = wrapper.find(Button);
    const cancelBtn = buttons.filterWhere(
      (b) => b.prop("type") === "default"
    );
    expect(cancelBtn.length).toBe(1);
    expect(cancelBtn.children().text()).toBe("Cancel");
  });

  it("should render Submit button", () => {
    const wrapper = shallow(<NewVendorHead />);
    const buttons = wrapper.find(Button);
    const submitBtn = buttons.filterWhere(
      (b) => b.prop("type") === "primary"
    );
    expect(submitBtn.length).toBe(1);
    expect(submitBtn.children().text()).toBe("Submit");
  });

  it("should disable Submit when activeSubmit is true", () => {
    const wrapper = shallow(<NewVendorHead activeSubmit={true} />);
    const submitBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.prop("type") === "primary");
    expect(submitBtn.prop("disabled")).toBe(true);
  });

  it("should disable Submit when isSubmitted is true", () => {
    const wrapper = shallow(<NewVendorHead isSubmitted={true} />);
    const submitBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.prop("type") === "primary");
    expect(submitBtn.prop("disabled")).toBe(true);
  });

  it("should render PageHeader", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  it("should show Add Entity title when no id", () => {
    const { useParams } = require("react-router-dom");
    useParams.mockReturnValue({});
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(PageHeader).prop("title")).toBe("Add Entity");
  });

  it("should show Edit Entity title when id exists", () => {
    const { useParams } = require("react-router-dom");
    useParams.mockReturnValue({ id: "456" });
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(PageHeader).prop("title")).toBe("Edit Entity");
  });

  it("should render Audit Log Modal", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(Modal).length).toBe(1);
    expect(wrapper.find(Modal).prop("title")).toBe("Audit Log");
  });

  it("should render Table inside Modal", () => {
    const wrapper = shallow(<NewVendorHead />);
    expect(wrapper.find(Table).length).toBe(1);
  });

  it("should call handleSubmitSuccess on Submit click", () => {
    const mockSubmit = jest.fn();
    const wrapper = shallow(
      <NewVendorHead handleSubmitSuccess={mockSubmit} />
    );
    const submitBtn = wrapper
      .find(Button)
      .filterWhere((b) => b.prop("type") === "primary");
    submitBtn.simulate("click");
    expect(mockSubmit).toHaveBeenCalled();
  });
});
