import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DisplayTC from "../../../components/requestAccess/DisplayTC";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};

jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

const mockTerms = jest.fn();
jest.mock("../../../store/actions/requestAccessActions", () => ({
  terms: (...args) => mockTerms(...args),
}));

const buildState = ({
  terms = false,
  businessRequirements = [],
  vendorRequestConfig = "N",
} = {}) => ({
  requestAccess: { terms, businessRequirements },
  datafeedInfo: { congigUi: { vendorRequestConfig } },
});

const GENERAL_ERROR =
  "Please accept the terms and conditions for general subscription.";
const APPLICATION_ERROR =
  "Please accept the terms and conditions for application subscription.";
const VENDOR_ERROR =
  "Please accept the terms and conditions for for on-demand vendor request.";

const GENERAL_LABEL =
  "I have read and accept the terms and conditions for general subscription";
const APPLICATION_LABEL =
  "I have read and accept the terms and conditions for application subscription";
const VENDOR_LABEL =
  "I have read and accept the terms and conditions for on-demand vendor request";

describe("DisplayTC", () => {
  beforeEach(() => {
    mockDispatch = jest.fn();
    mockTerms.mockReturnValue("terms");
    mockState = buildState();
  });

  it("should render the display-terms-and-conditions container", () => {
    const { container } = render(<DisplayTC view="tc" />);
    expect(
      container.querySelector(".display-terms-and-conditions")
    ).toBeInTheDocument();
  });

  it("should render the general subscription terms heading", () => {
    render(<DisplayTC view="tc" />);
    expect(
      screen.getByText("Terms & Conditions general Subscription")
    ).toBeInTheDocument();
  });

  it("should render the general and application acceptance checkboxes in the tc view", () => {
    render(<DisplayTC view="tc" />);
    expect(screen.getByLabelText(GENERAL_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(APPLICATION_LABEL)).toBeInTheDocument();
    expect(screen.queryByLabelText(VENDOR_LABEL)).not.toBeInTheDocument();
  });

  it("should render the vendor acceptance checkbox when the feed enables vendor requests", () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    render(<DisplayTC view="tc" />);
    expect(screen.getByLabelText(VENDOR_LABEL)).toBeInTheDocument();
  });

  it("should disable the application acceptance for a self subscription", () => {
    render(<DisplayTC view="tc" subForFlag={true} />);
    expect(screen.getByLabelText(APPLICATION_LABEL)).toBeDisabled();
  });

  it("should disable the vendor acceptance for a self subscription", () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    render(<DisplayTC view="tc" subForFlag={true} vendorRequest="Y" />);
    expect(screen.getByLabelText(VENDOR_LABEL)).toBeDisabled();
  });

  it("should disable the vendor acceptance when the request itself is not a vendor request", () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    render(<DisplayTC view="tc" subForFlag={false} vendorRequest="N" />);
    expect(screen.getByLabelText(VENDOR_LABEL)).toBeDisabled();
  });

  it("should pre-accept every term when the store already has accepted terms", () => {
    mockState = buildState({ terms: true, vendorRequestConfig: "Y" });
    render(<DisplayTC view="tc" vendorRequest="Y" />);
    expect(screen.getByLabelText(GENERAL_LABEL)).toBeChecked();
    expect(screen.getByLabelText(APPLICATION_LABEL)).toBeChecked();
    expect(screen.getByLabelText(VENDOR_LABEL)).toBeChecked();
  });

  it("should pre-accept every term for an existing subscription", () => {
    mockState = buildState({
      businessRequirements: [{ subscriptionId: "SUB-1" }],
      vendorRequestConfig: "Y",
    });
    render(<DisplayTC view="tc" vendorRequest="Y" />);
    expect(screen.getByLabelText(GENERAL_LABEL)).toBeChecked();
    expect(screen.getByLabelText(VENDOR_LABEL)).toBeChecked();
  });

  it("should leave the terms unaccepted for a brand new subscription", () => {
    mockState = buildState({
      businessRequirements: [{ subscriptionId: "" }],
    });
    render(<DisplayTC view="tc" />);
    expect(screen.getByLabelText(GENERAL_LABEL)).not.toBeChecked();
  });

  it("should block the step and surface every acceptance error", async () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    const next = jest.fn();
    const { rerender } = render(
      <DisplayTC view="tc" next={next} formData={false} vendorRequest="Y" />
    );
    rerender(
      <DisplayTC view="tc" next={next} formData={true} vendorRequest="Y" />
    );
    await waitFor(() =>
      expect(screen.getByText(GENERAL_ERROR)).toBeInTheDocument()
    );
    expect(screen.getByText(APPLICATION_ERROR)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_ERROR)).toBeInTheDocument();
    expect(next).toHaveBeenCalledWith(false);
    expect(next).not.toHaveBeenCalledWith(true);
    expect(mockTerms).not.toHaveBeenCalled();
  });

  it("should skip the application and vendor errors for a self subscription", async () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    const next = jest.fn();
    const { rerender } = render(
      <DisplayTC
        view="tc"
        next={next}
        formData={false}
        subForFlag={true}
        vendorRequest="Y"
      />
    );
    rerender(
      <DisplayTC
        view="tc"
        next={next}
        formData={true}
        subForFlag={true}
        vendorRequest="Y"
      />
    );
    await waitFor(() =>
      expect(screen.getByText(GENERAL_ERROR)).toBeInTheDocument()
    );
    expect(screen.queryByText(APPLICATION_ERROR)).not.toBeInTheDocument();
    expect(screen.queryByText(VENDOR_ERROR)).not.toBeInTheDocument();
  });

  it("should accept the terms and advance once every box is ticked", async () => {
    mockState = buildState({ vendorRequestConfig: "Y" });
    const next = jest.fn();
    const { rerender } = render(
      <DisplayTC view="tc" next={next} formData={false} vendorRequest="Y" />
    );
    fireEvent.click(screen.getByLabelText(GENERAL_LABEL));
    fireEvent.click(screen.getByLabelText(APPLICATION_LABEL));
    fireEvent.click(screen.getByLabelText(VENDOR_LABEL));
    rerender(
      <DisplayTC view="tc" next={next} formData={true} vendorRequest="Y" />
    );
    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(mockTerms).toHaveBeenCalledWith(true);
    expect(mockDispatch).toHaveBeenCalledWith("terms");
    // general + application + vendor all dispatch the accepted flag
    expect(mockTerms).toHaveBeenCalledTimes(3);
    expect(next).toHaveBeenCalledWith(false);
  });

  it("should not run the submit effect while formData stays false", () => {
    const next = jest.fn();
    render(<DisplayTC view="tc" next={next} formData={false} />);
    expect(next).not.toHaveBeenCalled();
    expect(mockTerms).not.toHaveBeenCalled();
  });

  it("should render the read only review view without any checkboxes", () => {
    render(<DisplayTC view="rd" subForFlag={true} vendorRequest="N" />);
    expect(
      screen.getByText("Terms & Conditions general Subscription")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(GENERAL_LABEL)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Terms & Conditions Application Subscription")
    ).not.toBeInTheDocument();
  });

  it("should show the application terms in the review view for a service account", () => {
    render(<DisplayTC view="rd" subForFlag={false} vendorRequest="N" />);
    expect(
      screen.getByText("Terms & Conditions Application Subscription")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Terms & Conditions On-Demand Vendor request")
    ).not.toBeInTheDocument();
  });

  it("should show the vendor terms in the review view for a vendor request", () => {
    render(<DisplayTC view="rd" subForFlag={false} vendorRequest="Y" />);
    expect(
      screen.getByText("Terms & Conditions On-Demand Vendor request")
    ).toBeInTheDocument();
  });

  it("should render the summary view for any other view flag", () => {
    const { container } = render(
      <DisplayTC view="summary" subForFlag={false} vendorRequest="Y" />
    );
    expect(
      container.querySelector(".display-terms-and-conditions")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Terms & Conditions On-Demand Vendor request")
    ).toBeInTheDocument();
  });
});
