import * as redux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { PageHeader, Tag } from "antd";
import DatasetPageHeader from "../../../components/dataset/DatasetPageHeader";

configure({ adapter: new Adapter() });

const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  withRouter: (component) => component,
}));

describe("DatasetPageHeader", () => {
  it("should render PageHeader component", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test Feed"
        history={{ push: mockPush }}
      />
    );
    expect(wrapper.find(PageHeader).length).toBe(1);
  });

  it("should display datafeed long name", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="My Data Feed"
        history={{ push: mockPush }}
      />
    );
    const title = wrapper.find(PageHeader).prop("title");
    const titleWrapper = shallow(title);
    expect(titleWrapper.text()).toContain("My Data Feed");
  });

  it("should display dash when datafeedLongName is not provided", () => {
    const wrapper = shallow(
      <DatasetPageHeader history={{ push: mockPush }} />
    );
    const title = wrapper.find(PageHeader).prop("title");
    const titleWrapper = shallow(title);
    expect(titleWrapper.text()).toContain("-");
  });

  it("should show Subscribed tag when subscription is active", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test"
        subscription={{ subscriptionStatus: "Active" }}
        history={{ push: mockPush }}
      />
    );
    const title = wrapper.find(PageHeader).prop("title");
    const titleWrapper = shallow(title);
    expect(titleWrapper.find(Tag).length).toBe(1);
    expect(titleWrapper.find(Tag).children().text()).toContain("Subscribed");
  });

  it("should not show Subscribed tag when subscription is not active", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test"
        subscription={{ subscriptionStatus: "Pending" }}
        history={{ push: mockPush }}
      />
    );
    const title = wrapper.find(PageHeader).prop("title");
    const titleWrapper = shallow(title);
    expect(titleWrapper.find(Tag).length).toBe(0);
  });

  it("should not show Subscribed tag when no subscription", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test"
        history={{ push: mockPush }}
      />
    );
    const title = wrapper.find(PageHeader).prop("title");
    const titleWrapper = shallow(title);
    expect(titleWrapper.find(Tag).length).toBe(0);
  });

  it("should have ghost false on PageHeader", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test"
        history={{ push: mockPush }}
      />
    );
    expect(wrapper.find(PageHeader).prop("ghost")).toBe(false);
  });

  it("should have correct className", () => {
    const wrapper = shallow(
      <DatasetPageHeader
        datafeedLongName="Test"
        history={{ push: mockPush }}
      />
    );
    expect(wrapper.find(PageHeader).prop("className")).toBe("pt-0 pb-0");
  });
});
