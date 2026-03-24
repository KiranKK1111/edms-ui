import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { CheckCircleFilled } from "@ant-design/icons";
import { TCApplicationSubscription } from "../../../components/termsAndConditions/tcApplicationSubscription";

configure({ adapter: new Adapter() });

describe("TCApplicationSubscription", () => {
  it("should render the component", () => {
    const wrapper = shallow(<TCApplicationSubscription />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the header text", () => {
    const wrapper = shallow(<TCApplicationSubscription />);
    expect(wrapper.find("h3").text()).toBe(
      "Terms & Conditions Application Subscription"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const wrapper = shallow(<TCApplicationSubscription view="tc" />);
    expect(wrapper.find(".terms-conditions").length).toBe(1);
  });

  it("should not render terms-conditions div when view is rd", () => {
    const wrapper = shallow(<TCApplicationSubscription view="rd" />);
    expect(wrapper.find(".terms-conditions").length).toBe(0);
  });

  it("should show Accepted text when view is not tc", () => {
    const wrapper = shallow(<TCApplicationSubscription view="review" />);
    expect(wrapper.find("span").text()).toContain("Accepted");
  });

  it("should not show Accepted text when view is tc", () => {
    const wrapper = shallow(<TCApplicationSubscription view="tc" />);
    const spans = wrapper.find(".accepted-parent").find("span");
    expect(spans.length).toBe(0);
  });

  it("should show CheckCircleFilled icon when view is not tc", () => {
    const wrapper = shallow(<TCApplicationSubscription view="review" />);
    expect(wrapper.find(CheckCircleFilled).length).toBe(1);
  });

  it("should apply opacity 0.5 when subForFlag is true", () => {
    const wrapper = shallow(
      <TCApplicationSubscription subForFlag={true} view="tc" />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "0.5" });
  });

  it("should apply opacity none when subForFlag is false", () => {
    const wrapper = shallow(
      <TCApplicationSubscription subForFlag={false} view="tc" />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "none" });
  });

  it("should render Operational Level Agreement heading", () => {
    const wrapper = shallow(<TCApplicationSubscription view="tc" />);
    expect(wrapper.find("h4").text()).toBe("Operational Level Agreement");
  });

  it("should apply opacity to terms section when subForFlag true and vendorRequest not Y", () => {
    const wrapper = shallow(
      <TCApplicationSubscription
        subForFlag={true}
        vendorRequest="N"
        view="tc"
      />
    );
    const termsDiv = wrapper.find(".terms-conditions");
    expect(termsDiv.prop("style")).toEqual({ opacity: "0.5" });
  });

  it("should not apply opacity to terms section when vendorRequest is Y", () => {
    const wrapper = shallow(
      <TCApplicationSubscription
        subForFlag={true}
        vendorRequest="Y"
        view="tc"
      />
    );
    const termsDiv = wrapper.find(".terms-conditions");
    expect(termsDiv.prop("style")).toEqual({ opacity: "none" });
  });
});
