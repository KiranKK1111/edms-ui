import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorAlert from "../../../components/error/ErrorAlert";

describe("ErrorAlert", () => {
  it("should render an Alert component", () => {
    render(<ErrorAlert message="Something went wrong" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should display the error message", () => {
    render(<ErrorAlert message="Test error" />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should have severity error", () => {
    const { container } = render(<ErrorAlert message="Error" />);
    expect(
      container.querySelector(".MuiAlert-colorError, .MuiAlert-standardError")
    ).toBeInTheDocument();
  });

  it("should show icon", () => {
    const { container } = render(<ErrorAlert message="Error" />);
    expect(container.querySelector(".MuiAlert-icon")).toBeInTheDocument();
  });

  it("should handle empty message", () => {
    render(<ErrorAlert message="" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should handle long error message", () => {
    const longMsg = "A".repeat(500);
    render(<ErrorAlert message={longMsg} />);
    expect(screen.getByText(longMsg)).toBeInTheDocument();
  });

  it("should handle special characters in message", () => {
    const msg = "Error: field <name> is required & must be valid";
    render(<ErrorAlert message={msg} />);
    expect(screen.getByText(msg)).toBeInTheDocument();
  });

  it("should handle undefined message", () => {
    render(<ErrorAlert />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should render without crashing when no props", () => {
    render(<ErrorAlert />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
