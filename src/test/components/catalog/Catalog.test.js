import { BrowserRouter as Router } from "react-router-dom";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Card, Tag, Button, Tooltip } from "antd";
import Catalog from "../../../components/catalog/Catalog";

configure({ adapter: new Adapter() });

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
  connect: () => (Component) => Component,
}));

const defaultCatalogueInfo = {
  entityShortName: "TestEntity",
  datasetShortName: "TestDataset",
  dataFeedLongName: "Test Data Feed Long Name",
  dataFeedStatus: "Active",
  dataFeedDescription: "Test description",
  subscription: { subscriptionStatus: "Active" },
};

describe("Catalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render a Card component", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.find(Card).length).toBe(1);
  });

  it("should display entity short name", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.text()).toContain("TestEntity");
  });

  it("should display dataset short name", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.text()).toContain("TestDataset");
  });

  it("should display data feed long name", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.text()).toContain("Test Data Feed Long Name");
  });

  it("should display Subscribed tag for active subscription", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.find(Tag).length).toBe(1);
    expect(wrapper.text()).toContain("Subscribed");
  });

  it("should display Pending tag for pending subscription", () => {
    const info = {
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Pending" },
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.text()).toContain("Pending");
  });

  it("should display Expired tag for expired subscription", () => {
    const info = {
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Expired" },
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.text()).toContain("Expired");
  });

  it("should display Request Access button for unknown subscription status", () => {
    const info = {
      ...defaultCatalogueInfo,
      subscription: { subscriptionStatus: "Unknown" },
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.text()).toContain("Request Access");
  });

  it("should display Request Access when no subscription", () => {
    const info = {
      ...defaultCatalogueInfo,
      subscription: null,
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.text()).toContain("Request Access");
  });

  it("should show dash when entityShortName is empty", () => {
    const info = {
      ...defaultCatalogueInfo,
      entityShortName: "",
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.find(".main-title").text()).toContain("-");
  });

  it("should show dash when datasetShortName is empty", () => {
    const info = {
      ...defaultCatalogueInfo,
      datasetShortName: "",
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.find(".catlog-dataset").text()).toContain("-");
  });

  it("should render for guest role with tooltip", () => {
    localStorage.setItem("guestRole", "guest");
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.text()).toContain("Request Access");
  });

  it("should render Request Access button for inactive feed status", () => {
    const info = {
      ...defaultCatalogueInfo,
      dataFeedStatus: "Inactive",
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    expect(wrapper.text()).toContain("Inactive");
  });

  it("should apply opacity for inactive status", () => {
    const info = {
      ...defaultCatalogueInfo,
      dataFeedStatus: "Inactive",
    };
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={info} />
      </Router>
    );
    const card = wrapper.find(Card);
    expect(card.prop("style")).toEqual({ opacity: "0.5" });
  });

  it("should have catalog-card className", () => {
    const wrapper = mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(wrapper.find(".catalog-card").length).toBeGreaterThanOrEqual(1);
  });

  it("should dispatch clearStore on mount", () => {
    mount(
      <Router>
        <Catalog catalogueInfo={defaultCatalogueInfo} />
      </Router>
    );
    expect(mockDispatch).toHaveBeenCalled();
  });
});
