import React from "react";
import { render, screen } from "@testing-library/react";
import { TCApplicationSubscription } from "../../../components/termsAndConditions/tcApplicationSubscription";

describe("TCApplicationSubscription", () => {
  it("should render the component", () => {
    const { container } = render(<TCApplicationSubscription />);
    expect(container.querySelector(".accepted-parent")).toBeInTheDocument();
  });

  it("should render the header text", () => {
    const { container } = render(<TCApplicationSubscription />);
    expect(container.querySelector("h3").textContent).toBe(
      "Terms & Conditions Application Subscription"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const { container } = render(<TCApplicationSubscription view="tc" />);
    expect(container.querySelector(".terms-conditions")).toBeInTheDocument();
  });

  it("should not render terms-conditions div when view is rd", () => {
    const { container } = render(<TCApplicationSubscription view="rd" />);
    expect(container.querySelector(".terms-conditions")).not.toBeInTheDocument();
  });

  it("should show Accepted text when view is not tc", () => {
    render(<TCApplicationSubscription view="review" />);
    expect(screen.getByText(/Accepted/)).toBeInTheDocument();
  });

  it("should not show Accepted text when view is tc", () => {
    render(<TCApplicationSubscription view="tc" />);
    expect(screen.queryByText(/Accepted/)).not.toBeInTheDocument();
  });

  it("should show the accepted icon when view is not tc", () => {
    const { container } = render(<TCApplicationSubscription view="review" />);
    expect(container.querySelector(".accepted-parent svg")).toBeInTheDocument();
  });

  it("should apply opacity 0.5 when subForFlag is true", () => {
    const { container } = render(
      <TCApplicationSubscription subForFlag={true} view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).toBe("0.5");
  });

  it("should not apply opacity 0.5 when subForFlag is false", () => {
    const { container } = render(
      <TCApplicationSubscription subForFlag={false} view="tc" />
    );
    expect(container.querySelector(".accepted-parent").style.opacity).not.toBe(
      "0.5"
    );
  });

  it("should render Operational Level Agreement heading", () => {
    const { container } = render(<TCApplicationSubscription view="tc" />);
    expect(container.querySelector("h4").textContent).toBe(
      "Operational Level Agreement"
    );
  });

  it("should apply opacity to terms section when subForFlag true and vendorRequest not Y", () => {
    const { container } = render(
      <TCApplicationSubscription subForFlag={true} vendorRequest="N" view="tc" />
    );
    expect(container.querySelector(".terms-conditions").style.opacity).toBe(
      "0.5"
    );
  });

  it("should not apply opacity to terms section when vendorRequest is Y", () => {
    const { container } = render(
      <TCApplicationSubscription subForFlag={true} vendorRequest="Y" view="tc" />
    );
    expect(container.querySelector(".terms-conditions").style.opacity).not.toBe(
      "0.5"
    );
  });
});
