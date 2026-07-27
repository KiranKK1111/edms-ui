import React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../utils/renderWithProviders";
import ReviewSubmit from "../../../components/vendors/AddVendor/ReviewSubmit";

// Mutable state read by the mocked useSelector. The factory function runs
// lazily (per render), so reassigning this between tests is honoured even
// though resetMocks is ON.
let mockVendorState = { data: {} };

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: (cb) => cb({ vendor: mockVendorState }),
}));

const setVendorData = (data) => {
  mockVendorState = { data };
};

describe("ReviewSubmit (Vendor)", () => {
  it("should render the main container", () => {
    setVendorData({
      longName: "Test Vendor",
      shortName: "TV",
      entityDescription: "A test vendor",
    });
    const { container } = renderWithProviders(<ReviewSubmit />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render a label for each data field", () => {
    setVendorData({
      longName: "Test Vendor",
      shortName: "TV",
      entityType: "Vendor",
      entityDescription: "A test vendor",
    });
    const { container } = renderWithProviders(<ReviewSubmit />);
    expect(
      container.querySelectorAll(".label-review").length
    ).toBeGreaterThanOrEqual(4);
  });

  it("should display the field values", () => {
    setVendorData({
      longName: "Test Vendor",
      shortName: "TV",
      entityDescription: "A test vendor",
    });
    renderWithProviders(<ReviewSubmit />);
    expect(screen.getByText("Test Vendor")).toBeInTheDocument();
    expect(screen.getByText("TV")).toBeInTheDocument();
    expect(screen.getByText("A test vendor")).toBeInTheDocument();
  });

  it("should render the Description label", () => {
    setVendorData({
      longName: "Test",
      entityDescription: "Some details here",
    });
    renderWithProviders(<ReviewSubmit />);
    expect(screen.getByText(/^Description/)).toBeInTheDocument();
  });

  it("should display a dash for empty values", () => {
    setVendorData({
      longName: "",
      shortName: "TV",
      entityDescription: "Description",
    });
    renderWithProviders(<ReviewSubmit />);
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the website as a link", () => {
    setVendorData({
      website: "www.example.com",
      entityDescription: "Test",
    });
    renderWithProviders(<ReviewSubmit />);
    const link = screen.getByRole("link", { name: "www.example.com" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.example.com");
  });

  it("should render label-review spans", () => {
    setVendorData({
      longName: "Test",
      entityDescription: "Description",
    });
    const { container } = renderWithProviders(<ReviewSubmit />);
    expect(
      container.querySelectorAll(".label-review").length
    ).toBeGreaterThanOrEqual(1);
  });
});
