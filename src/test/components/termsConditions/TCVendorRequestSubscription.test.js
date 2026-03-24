import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { CheckCircleFilled } from "@ant-design/icons";
import { TCVendorRequestSubscription } from "../../../components/termsAndConditions/tcVendorRequestSubscription";

configure({ adapter: new Adapter() });

describe("TCVendorRequestSubscription", () => {
  it("should render the component", () => {
    const wrapper = shallow(<TCVendorRequestSubscription />);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render the header text", () => {
    const wrapper = shallow(<TCVendorRequestSubscription />);
    expect(wrapper.find("h3").text()).toBe(
      "Terms & Conditions On-Demand Vendor request"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="tc" />);
    expect(wrapper.find(".terms-conditions").length).toBe(1);
  });

  it("should not render terms-conditions div when view is rd", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="rd" />);
    expect(wrapper.find(".terms-conditions").length).toBe(0);
  });

  it("should show Accepted text when view is not tc", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="review" />);
    expect(wrapper.find("span").text()).toContain("Accepted");
  });

  it("should not show Accepted text when view is tc", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="tc" />);
    const spans = wrapper.find(".accepted-parent").find("span");
    expect(spans.length).toBe(0);
  });

  it("should show CheckCircleFilled icon when view is not tc", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="review" />);
    expect(wrapper.find(CheckCircleFilled).length).toBe(1);
  });

  it("should apply opacity 0.5 when subForFlag true and dfVendor is Y", () => {
    const wrapper = shallow(
      <TCVendorRequestSubscription
        subForFlag={true}
        dfVendor="Y"
        view="tc"
      />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "0.5" });
  });

  it("should apply opacity 0.5 when subForFlag false and vendorRequest not Y", () => {
    const wrapper = shallow(
      <TCVendorRequestSubscription
        subForFlag={false}
        vendorRequest="N"
        view="tc"
      />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "0.5" });
  });

  it("should apply opacity none when subForFlag true and dfVendor not Y", () => {
    const wrapper = shallow(
      <TCVendorRequestSubscription
        subForFlag={true}
        dfVendor="N"
        view="tc"
      />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "none" });
  });

  it("should apply opacity none when subForFlag false and vendorRequest is Y", () => {
    const wrapper = shallow(
      <TCVendorRequestSubscription
        subForFlag={false}
        vendorRequest="Y"
        view="tc"
      />
    );
    const parent = wrapper.find(".accepted-parent");
    expect(parent.prop("style")).toEqual({ opacity: "none" });
  });

  it("should render Governance heading", () => {
    const wrapper = shallow(<TCVendorRequestSubscription view="tc" />);
    expect(wrapper.find("h4").text()).toBe(
      "Required Governance/Compliance approvals"
    );
  });
});
