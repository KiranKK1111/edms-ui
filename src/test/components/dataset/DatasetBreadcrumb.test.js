import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Breadcrumb } from "antd";
import DatasetBreadcrumb from "../../../components/dataset/DatasetBreadcrumb";

configure({ adapter: new Adapter() });

describe("DatasetBreadcrumb", () => {
  it("should render Breadcrumb component", () => {
    const wrapper = shallow(<DatasetBreadcrumb />);
    expect(wrapper.find(Breadcrumb).length).toBe(1);
  });

  it("should render 3 Breadcrumb.Items", () => {
    const wrapper = shallow(<DatasetBreadcrumb title="Test Feed" />);
    expect(wrapper.find(Breadcrumb.Item).length).toBe(3);
  });

  it("should display title when provided", () => {
    const wrapper = shallow(<DatasetBreadcrumb title="My Data Feed" />);
    expect(wrapper.find(Breadcrumb.Item).at(2).prop("children")).toBe("My Data Feed");
  });

  it("should display dash when title is not provided", () => {
    const wrapper = shallow(<DatasetBreadcrumb />);
    expect(wrapper.find(Breadcrumb.Item).at(2).prop("children")).toBe("-");
  });

  it("should display dash when title is empty string", () => {
    const wrapper = shallow(<DatasetBreadcrumb title="" />);
    expect(wrapper.find(Breadcrumb.Item).at(2).prop("children")).toBe("-");
  });

  it("should render Catalogue link text", () => {
    const wrapper = shallow(<DatasetBreadcrumb title="Test" />);
    const secondItem = wrapper.find(Breadcrumb.Item).at(1);
    const link = secondItem.find("Link");
    expect(link.children().text()).toBe("Catalogue");
  });

  it("should have correct className", () => {
    const wrapper = shallow(<DatasetBreadcrumb />);
    expect(wrapper.find(Breadcrumb).prop("className")).toBe(
      "mt-16 ml-24 mr-24"
    );
  });
});
