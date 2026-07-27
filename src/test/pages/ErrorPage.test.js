import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import ErrorPage from "../../pages/error/ErrorPage";

describe("ErrorPage", () => {
  const mockHistory = { replace: jest.fn() };

  beforeEach(() => {
    mockHistory.replace.mockClear();
  });

  it("should render the 404 status", () => {
    render(<ErrorPage history={mockHistory} />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("should render the page-not-found heading", () => {
    render(<ErrorPage history={mockHistory} />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("should display the correct subtitle", () => {
    render(<ErrorPage history={mockHistory} />);
    expect(
      screen.getByText("Sorry, the page you visited does not exist.")
    ).toBeInTheDocument();
  });

  it("should render a Back Home button", () => {
    render(<ErrorPage history={mockHistory} />);
    expect(
      screen.getByRole("button", { name: /Back Home/i })
    ).toBeInTheDocument();
  });

  it("should call history.replace with /catalog when button is clicked", () => {
    render(<ErrorPage history={mockHistory} />);
    fireEvent.click(screen.getByRole("button", { name: /Back Home/i }));
    expect(mockHistory.replace).toHaveBeenCalledWith("/catalog");
  });

  it("should call history.replace once per click", () => {
    render(<ErrorPage history={mockHistory} />);
    const btn = screen.getByRole("button", { name: /Back Home/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(mockHistory.replace).toHaveBeenCalledTimes(2);
  });
});
