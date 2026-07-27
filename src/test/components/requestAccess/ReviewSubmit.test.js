import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ReviewSubmit from "../../../components/requestAccess/ReviewSubmit";
import { saveFinalData } from "../../../store/actions/requestAccessActions";

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
  <div
    data-testid="mock-display-tc"
    data-view={props.view}
    data-subforflag={String(props.subForFlag)}
    data-vendorrequest={props.vendorRequest}
  />
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
    return render(<ReviewSubmit {...defaultProps} {...props} />);
  };

  it("should render without crashing", () => {
    const { container } = renderComponent();
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should render Business Requirements heading", () => {
    const { container } = renderComponent();
    expect(container.querySelector("h3").textContent).toContain(
      "Business Requirements"
    );
  });

  it("should render review-submit container", () => {
    const { container } = renderComponent();
    expect(container.querySelectorAll(".review-submit").length).toBe(1);
  });

  it("should render the business requirement field values", () => {
    renderComponent();
    expect(screen.getByText("TestProject")).toBeInTheDocument();
  });

  it("should display reasonForSubscription value", () => {
    renderComponent();
    expect(screen.getByText("Reason for Subscription :")).toBeInTheDocument();
    expect(screen.getByText("Business need")).toBeInTheDocument();
  });

  it("should render vendor request section when vendorRequest prop is Y", () => {
    renderComponent({ vendorRequest: "Y" });
    expect(screen.getByText("On-Demand Vendor request")).toBeInTheDocument();
    expect(
      screen.getByText("Enable On-Demand Vendor request : Yes")
    ).toBeInTheDocument();
  });

  it("should show No for vendor request when vendorRequest prop is N", () => {
    renderComponent({ vendorRequest: "N" });
    expect(
      screen.getByText("Enable On-Demand Vendor request : No")
    ).toBeInTheDocument();
  });

  it("should not render vendor request section when vendorRequest prop is falsy", () => {
    renderComponent({ vendorRequest: null });
    expect(
      screen.queryByText(/Enable On-Demand Vendor request/)
    ).not.toBeInTheDocument();
  });

  it("should not render vendor request section when vendorRequest prop is undefined", () => {
    renderComponent({ vendorRequest: undefined });
    expect(
      screen.queryByText(/Enable On-Demand Vendor request/)
    ).not.toBeInTheDocument();
  });

  it("should render Divider components", () => {
    const { container } = renderComponent();
    expect(
      container.querySelectorAll(".MuiDivider-root").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render DisplayTC component with correct props", () => {
    renderComponent({ view: "tc", subForFlag: false, vendorRequest: "Y" });
    const displayTC = screen.getByTestId("mock-display-tc");
    expect(displayTC).toBeInTheDocument();
    expect(displayTC.getAttribute("data-view")).toBe("tc");
    expect(displayTC.getAttribute("data-subforflag")).toBe("false");
    expect(displayTC.getAttribute("data-vendorrequest")).toBe("Y");
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
    const { container } = renderComponent({ vendorRequest: "Y" });
    expect(container.querySelectorAll(".MuiDivider-root").length).toBe(2);
  });

  it("should render one Divider when vendorRequest prop is null", () => {
    const { container } = renderComponent({ vendorRequest: null });
    expect(container.querySelectorAll(".MuiDivider-root").length).toBe(1);
  });

  it("should render a br tag at the bottom", () => {
    const { container } = renderComponent();
    expect(container.querySelectorAll("br").length).toBeGreaterThanOrEqual(1);
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
});
