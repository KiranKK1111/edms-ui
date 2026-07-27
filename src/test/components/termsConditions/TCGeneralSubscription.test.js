import React from "react";
import { render, screen } from "@testing-library/react";
import { TCGeneralSubscription } from "../../../components/termsAndConditions/tcGeneralSubscription";

describe("TCGeneralSubscription", () => {
  it("should render the component", () => {
    const { container } = render(<TCGeneralSubscription />);
    expect(container.querySelector(".accepted-parent")).toBeInTheDocument();
  });

  it("should render the header text", () => {
    const { container } = render(<TCGeneralSubscription />);
    expect(container.querySelector("h3").textContent).toBe(
      "Terms & Conditions general Subscription"
    );
  });

  it("should render terms-conditions div when view is not rd", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelector(".terms-conditions")).toBeInTheDocument();
  });

  it("should not render terms-conditions div when view is rd", () => {
    const { container } = render(<TCGeneralSubscription view="rd" />);
    expect(container.querySelector(".terms-conditions")).not.toBeInTheDocument();
  });

  it("should show Accepted text when view is not tc", () => {
    render(<TCGeneralSubscription view="review" />);
    expect(screen.getByText(/Accepted/)).toBeInTheDocument();
  });

  it("should not show Accepted text when view is tc", () => {
    render(<TCGeneralSubscription view="tc" />);
    expect(screen.queryByText(/Accepted/)).not.toBeInTheDocument();
  });

  it("should show the accepted icon when view is not tc", () => {
    const { container } = render(<TCGeneralSubscription view="review" />);
    expect(container.querySelector(".accepted-parent svg")).toBeInTheDocument();
  });

  it("should render multiple h4 headings for sections", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("h4").length).toBe(4); // General, Licence, Usage, Storage
  });

  it("should render General heading", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("h4")[0].textContent).toBe("General");
  });

  it("should render Licence and Restrictions heading", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("h4")[1].textContent).toBe(
      "Licence and Restrictions"
    );
  });

  it("should render Usage heading", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("h4")[2].textContent).toBe("Usage");
  });

  it("should render Storage heading", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("h4")[3].textContent).toBe("Storage");
  });

  it("should render paragraph elements with terms text", () => {
    const { container } = render(<TCGeneralSubscription view="tc" />);
    expect(container.querySelectorAll("p").length).toBeGreaterThanOrEqual(5);
  });
});
