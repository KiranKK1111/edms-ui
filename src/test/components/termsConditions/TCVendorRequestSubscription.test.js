import React from "react";
import { render, screen } from "@testing-library/react";
import { TCVendorRequestSubscription } from "../../../components/termsAndConditions/tcVendorRequestSubscription";

describe("TCVendorRequestSubscription", () => {
  it("should render the component", () => {
    const { container } = render(<TCVendorRequestSubscription />);
    expect(container.querySelector(".accepted-parent")).toBeInTheDocument();
  });

  it("should render the header text", () => {
    const { container } = render(<TCVendorRequestSubscription />);
    expect(container.querySelector("h3").textContent).toBe(
      "Terms & Conditions On-Demand Vendor request"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const { container } = render(<TCVendorRequestSubscription view="tc" />);
    expect(container.querySelector(".terms-conditions")).toBeInTheDocument();
  });

  it("should not render terms-conditions div when view is rd", () => {
    const { container } = render(<TCVendorRequestSubscription view="rd" />);
    expect(container.querySelector(".terms-conditions")).not.toBeInTheDocument();
  });

  it("should show Accepted text when view is not tc", () => {
    render(<TCVendorRequestSubscription view="review" />);
    expect(screen.getByText(/Accepted/)).toBeInTheDocument();
  });

  it("should not show Accepted text when view is tc", () => {
    render(<TCVendorRequestSubscription view="tc" />);
    expect(screen.queryByText(/Accepted/)).not.toBeInTheDocument();
  });

  it("should show the accepted icon when view is not tc", () => {
    const { container } = render(<TCVendorRequestSubscription view="review" />);
    expect(container.querySelector(".accepted-parent svg")).toBeInTheDocument();
  });

  it("should apply opacity 0.5 when subForFlag true and dfVendor is Y", () => {
    const { container } = render(
      <TCVendorRequestSubscription subForFlag={true} dfVendor="Y" view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).toBe("0.5");
  });

  it("should apply opacity 0.5 when subForFlag false and vendorRequest not Y", () => {
    const { container } = render(
      <TCVendorRequestSubscription subForFlag={false} vendorRequest="N" view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).toBe("0.5");
  });

  it("should not apply opacity 0.5 when subForFlag true and dfVendor not Y", () => {
    const { container } = render(
      <TCVendorRequestSubscription subForFlag={true} dfVendor="N" view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).not.toBe(
      "0.5"
    );
  });

  it("should not apply opacity 0.5 when subForFlag false and vendorRequest is Y", () => {
    const { container } = render(
      <TCVendorRequestSubscription subForFlag={false} vendorRequest="Y" view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).not.toBe(
      "0.5"
    );
  });

  it("should render Governance heading", () => {
    const { container } = render(<TCVendorRequestSubscription view="tc" />);
    expect(container.querySelector("h4").textContent).toBe(
      "Required Governance/Compliance approvals"
    );
  });
});
