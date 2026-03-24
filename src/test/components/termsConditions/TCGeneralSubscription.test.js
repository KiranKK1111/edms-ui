import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { CheckCircleFilled } from "@ant-design/icons";
import { TCGeneralSubscription } from "../../../components/termsAndConditions/tcGeneralSubscription";

configure({ adapter: new Adapter() });

describe("TCGeneralSubscription", () => {
  it("should render the component", () => {
    const wrapper = shallow(<TCGeneralSubscription />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the header text", () => {
    const wrapper = shallow(<TCGeneralSubscription />);
    expect(wrapper.find("h3").text()).toBe(
      "Terms & Conditions general Subscription"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find(".terms-conditions").length).toBe(1);
  });

  it("should not render terms-conditions div when view is rd", () => {
    const wrapper = shallow(<TCGeneralSubscription view="rd" />);
    expect(wrapper.find(".terms-conditions").length).toBe(0);
  });

  it("should show Accepted text when view is not tc", () => {
    const wrapper = shallow(<TCGeneralSubscription view="review" />);
    expect(wrapper.find("span").text()).toContain("Accepted");
  });

  it("should not show Accepted text when view is tc", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    const spans = wrapper.find(".accepted-parent").find("span");
    expect(spans.length).toBe(0);
  });

  it("should show CheckCircleFilled icon when view is not tc", () => {
    const wrapper = shallow(<TCGeneralSubscription view="review" />);
    expect(wrapper.find(CheckCircleFilled).length).toBe(1);
  });

  it("should render multiple h4 headings for sections", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    const headings = wrapper.find("h4");
    expect(headings.length).toBe(4); // General, Licence, Usage, Storage
  });

  it("should render General heading", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find("h4").at(0).text()).toBe("General");
  });

  it("should render Licence and Restrictions heading", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find("h4").at(1).text()).toBe("Licence and Restrictions");
  });

  it("should render Usage heading", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find("h4").at(2).text()).toBe("Usage");
  });

  it("should render Storage heading", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find("h4").at(3).text()).toBe("Storage");
  });

  it("should render paragraph elements with terms text", () => {
    const wrapper = shallow(<TCGeneralSubscription view="tc" />);
    expect(wrapper.find("p").length).toBeGreaterThanOrEqual(5);
  });
});
