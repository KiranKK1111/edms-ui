import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import BreadcrumbComponent from "../../../components/breadcrumb/Breadcrumb";

configure({ adapter: new Adapter() });

describe("BreadcrumbComponent", () => {
  it("should render a Breadcrumb component", () => {
    const wrapper = shallow(<BreadcrumbComponent />);
    expect(wrapper.find(Breadcrumb).length).toBe(1);
  });

  it("should render home icon link to /catalog", () => {
    const wrapper = shallow(<BreadcrumbComponent />);
    const homeLink = wrapper.find(Link).first();
    expect(homeLink.prop("to")).toBe("/catalog");
  });

  it("should render breadcrumb items from props", () => {
    const breadcrumb = [
      { name: "Datasets", url: "/datasets" },
      { name: "Details" },
    ];
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={breadcrumb} />);
    const items = wrapper.find(Breadcrumb.Item);
    // 1 home + 2 breadcrumb items
    expect(items.length).toBe(3);
  });

  it("should render Link for items with url", () => {
    const breadcrumb = [{ name: "Datasets", url: "/datasets" }];
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={breadcrumb} />);
    const links = wrapper.find(Link);
    expect(links.length).toBe(2);
    expect(links.at(1).prop("to")).toBe("/datasets");
    expect(links.at(1).children().text()).toBe("Datasets");
  });

  it("should render text only for items without url", () => {
    const breadcrumb = [{ name: "Details" }];
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={breadcrumb} />);
    const items = wrapper.find(Breadcrumb.Item);
    expect(items.at(1).children().text()).toBe("Details");
  });

  it("should handle empty breadcrumb array", () => {
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={[]} />);
    const items = wrapper.find(Breadcrumb.Item);
    expect(items.length).toBe(1);
  });

  it("should handle undefined breadcrumb", () => {
    const wrapper = shallow(<BreadcrumbComponent />);
    const items = wrapper.find(Breadcrumb.Item);
    expect(items.length).toBe(1);
  });

  it("should render multiple breadcrumb items in order", () => {
    const breadcrumb = [
      { name: "Master Data", url: "/masterdata" },
      { name: "Vendors", url: "/vendors" },
      { name: "Details" },
    ];
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={breadcrumb} />);
    const items = wrapper.find(Breadcrumb.Item);
    expect(items.length).toBe(4);
  });

  it("should have truncate-text class on links", () => {
    const breadcrumb = [{ name: "Test", url: "/test" }];
    const wrapper = shallow(<BreadcrumbComponent breadcrumb={breadcrumb} />);
    const link = wrapper.find(Link).at(1);
    expect(link.hasClass("truncate-text")).toBe(true);
  });
});
