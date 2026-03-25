import React from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Row, Col, Divider } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import ReviewSubmit from "../../../components/requestAccess/ReviewSubmit";
import { saveFinalData } from "../../../store/actions/requestAccessActions";

configure({ adapter: new Adapter() });

jest.spyOn(console, "error").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));

jest.mock("../../../store/actions/requestAccessActions", () => ({
  saveFinalData: jest.fn((data) => ({ type: "SAVE_FINAL_DATA", payload: data })),
}));

jest.mock("../../../components/requestAccess/DisplayTC", () => (props) => (
  <div data-testid="mock-display-tc" data-view={props.view} data-subforflag={String(props.subForFlag)} data-vendorrequest={props.vendorRequest} />
));

jest.mock("../../../components/stringConversion", () => ({
  getCustomLabels: jest.fn((item) => item),
}));

describe("ReviewSubmit (requestAccess)", () => {
  const defaultReduxState = {
    businessRequirements: [
      {
        subscriptionId: "SUB123",
        clarityId: "CLR456",
        department: "IT",
        numberOfEndUserSubscriptions: "10",
        projectName: "TestProject",
        reasonForSubscription: "Business need",
        subscriptionFor: "user1",
        status: "Active",
        subscriptionType: "Standard",
        serviceAccountName: "svc_account",
        vendorRequest: "Y",
      },
    ],
    response: null,
  };

  const defaultLocation = {
    state: {
      data: {
        dataFeedId: "DF001",
        dataFeedShortName: "TestFeed",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((selector) =>
      selector({ requestAccess: defaultReduxState })
    );
    useLocation.mockReturnValue(defaultLocation);
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "psid") return "PS001";
      if (key === "entitlementType") return "Admin";
      return null;
    });
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      vendorRequest: "Y",
      view: "tc",
      subForFlag: false,
    };
    return mount(<ReviewSubmit {...defaultProps} {...props} />);
  };

  it("should render without crashing", () => {
    const wrapper = renderComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("should render Business Requirements heading", () => {
    const wrapper = renderComponent();
    expect(wrapper.find("h3").text()).toBe("Business Requirements ");
  });

  it("should render review-submit container", () => {
    const wrapper = renderComponent();
    expect(wrapper.find(".review-submit").length).toBe(1);
  });

  it("should render Row components", () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Row).length).toBeGreaterThanOrEqual(2);
  });

  it("should filter out reasonForSubscription from brData mapped in the first Row", () => {
    const wrapper = renderComponent();
    const firstRow = wrapper.find(Row).at(0);
    const cols = firstRow.find(Col);
    const labelTexts = cols.map((col) => col.find(".label-review").text());
    labelTexts.forEach((text) => {
      expect(text).not.toContain("reasonForSubscription");
    });
  });

  it("should display reasonForSubscription in the second Row", () => {
    const wrapper = renderComponent();
    const secondRow = wrapper.find(Row).at(1);
    expect(secondRow.find(".label-review").text()).toContain("Reason for Subscription");
    expect(secondRow.text()).toContain("Business need");
  });

  it("should render brData fields (excluding reasonForSubscription and vendorRequest)", () => {
    const wrapper = renderComponent();
    const firstRow = wrapper.find(Row).at(0);
    const cols = firstRow.find(Col);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("should render Col with span 8 for each brData field in first Row", () => {
    const wrapper = renderComponent();
    const firstRow = wrapper.find(Row).at(0);
    const cols = firstRow.find(Col);
    cols.forEach((col) => {
      expect(col.prop("span")).toBe(8);
    });
  });

  it("should render vendor request section when vendorRequest prop is Y", () => {
    const wrapper = renderComponent({ vendorRequest: "Y" });
    const h4s = wrapper.find("h4");
    expect(h4s.someWhere((n) => n.text().includes("On-Demand Vendor request"))).toBe(true);
    expect(h4s.someWhere((n) => n.text().includes("Yes"))).toBe(true);
  });

  it("should show No for vendor request when vendorRequest prop is N", () => {
    const wrapper = renderComponent({ vendorRequest: "N" });
    const h4s = wrapper.find("h4");
    expect(h4s.someWhere((n) => n.text().includes("No"))).toBe(true);
  });

  it("should not render vendor request section when vendorRequest prop is falsy", () => {
    const wrapper = renderComponent({ vendorRequest: null });
    const h4s = wrapper.find("h4");
    const vendorH4 = h4s.filterWhere((n) => n.text().includes("On-Demand Vendor request"));
    expect(vendorH4.length).toBe(0);
  });

  it("should not render vendor request section when vendorRequest prop is undefined", () => {
    const wrapper = renderComponent({ vendorRequest: undefined });
    const h4s = wrapper.find("h4");
    const vendorH4 = h4s.filterWhere((n) => n.text().includes("On-Demand Vendor request"));
    expect(vendorH4.length).toBe(0);
  });

  it("should render Divider component", () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Divider).length).toBeGreaterThanOrEqual(1);
  });

  it("should render DisplayTC component with correct props", () => {
    const wrapper = renderComponent({ view: "tc", subForFlag: false, vendorRequest: "Y" });
    const displayTC = wrapper.find("[data-testid='mock-display-tc']");
    expect(displayTC.length).toBe(1);
    expect(displayTC.prop("data-view")).toBe("tc");
    expect(displayTC.prop("data-subforflag")).toBe("false");
    expect(displayTC.prop("data-vendorrequest")).toBe("Y");
  });

  it("should dispatch saveFinalData on mount", () => {
    renderComponent();
    expect(mockDispatch).toHaveBeenCalled();
    expect(saveFinalData).toHaveBeenCalled();
  });

  it("should build finalValues with correct subscriptionUpdateFlag Y when subscriptionId has length", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionUpdateFlag).toBe("Y");
  });

  it("should build finalValues with subscriptionUpdateFlag N when subscriptionId is empty", () => {
    const emptySubState = {
      ...defaultReduxState,
      businessRequirements: [
        {
          ...defaultReduxState.businessRequirements[0],
          subscriptionId: "",
        },
      ],
    };
    useSelector.mockImplementation((selector) =>
      selector({ requestAccess: emptySubState })
    );
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionUpdateFlag).toBe("N");
    expect(callArg.createdBy).toBe("PS001");
  });

  it("should not include createdBy when subscriptionId exists", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.createdBy).toBeUndefined();
  });

  it("should set lastUpdatedBy when subscriptionId exists", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.lastUpdatedBy).toBe("PS001");
  });

  it("should set subscriptionTermsConditionsOla to Approved when subForFlag is false", () => {
    renderComponent({ subForFlag: false });
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionTermsConditionsOla).toBe("Approved");
  });

  it("should set subscriptionTermsConditionsOla to Not Approved when subForFlag is true", () => {
    renderComponent({ subForFlag: true });
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionTermsConditionsOla).toBe("Not Approved");
  });

  it("should set subscriptionTermsConditionsVendorRequest to Not Approved because brResult omits vendorRequest", () => {
    // brResult = lodash.omit(businessResponse, "vendorRequest"), so brResult["vendorRequest"] is undefined
    // Therefore subscriptionTermsConditionsVendorRequest is always "Not Approved"
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionTermsConditionsVendorRequest).toBe("Not Approved");
  });

  it("should set subscriptionTermsConditionsVendorRequest to Not Approved when vendorRequest is N", () => {
    const stateWithNoVendor = {
      ...defaultReduxState,
      businessRequirements: [
        {
          ...defaultReduxState.businessRequirements[0],
          vendorRequest: "N",
        },
      ],
    };
    useSelector.mockImplementation((selector) =>
      selector({ requestAccess: stateWithNoVendor })
    );
    renderComponent({ vendorRequest: "N" });
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionTermsConditionsVendorRequest).toBe("Not Approved");
  });

  it("should set serviceAccountName to null when not provided", () => {
    const stateNoSvc = {
      ...defaultReduxState,
      businessRequirements: [
        {
          ...defaultReduxState.businessRequirements[0],
          serviceAccountName: "",
        },
      ],
    };
    useSelector.mockImplementation((selector) =>
      selector({ requestAccess: stateNoSvc })
    );
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.sserviceAccountName).toBeNull();
  });

  it("should set serviceAccountName when provided", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.sserviceAccountName).toBe("svc_account");
  });

  it("should include correct dataFeedId from location state", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.dataFeedId).toBe("DF001");
  });

  it("should include correct subscriptionShortName from location state", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionShortName).toBe("TestFeed");
  });

  it("should parse numberOfEndUserSubscriptions as integer", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.licensesSubscribed).toBe(10);
  });

  it("should set termsAndConditions to Approved", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.termsAndConditions).toBe("Approved");
  });

  it("should set roleName from localStorage", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.roleName).toBe("Admin");
  });

  it("should render two Dividers when vendorRequest prop is provided", () => {
    const wrapper = renderComponent({ vendorRequest: "Y" });
    expect(wrapper.find(Divider).length).toBe(2);
  });

  it("should render one Divider when vendorRequest prop is null", () => {
    const wrapper = renderComponent({ vendorRequest: null });
    expect(wrapper.find(Divider).length).toBe(1);
  });

  it("should render a br tag at the bottom", () => {
    const wrapper = renderComponent();
    expect(wrapper.find("br").length).toBeGreaterThanOrEqual(1);
  });

  it("should render first Row with gutter", () => {
    const wrapper = renderComponent();
    const firstRow = wrapper.find(Row).at(0);
    expect(firstRow.prop("gutter")).toEqual([2, 4]);
  });

  it("should set subscriptionVendorRequest from businessResponse", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.subscriptionVendorRequest).toBe("Y");
  });

  it("should set requester from localStorage psid", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.requester).toBe("PS001");
  });

  it("should set reason from reasonForSubscription", () => {
    renderComponent();
    const callArg = saveFinalData.mock.calls[0][0];
    expect(callArg.reason).toBe("Business need");
  });

  it("should render second Row with Col span 24", () => {
    const wrapper = renderComponent();
    const secondRow = wrapper.find(Row).at(1);
    const col = secondRow.find(Col);
    expect(col.first().prop("span")).toBe(24);
  });
});
