import React from "react";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "../../utils/renderWithProviders";
import NewVendorHead from "../../../components/vendors/AddVendor/NewVendorHead";

const mockPush = jest.fn();
// `mockUseParams` is a stable reference; its return value is set in beforeEach
// (resetMocks would otherwise wipe an implementation declared at creation time).
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useHistory: () => ({ push: mockPush }),
  };
});

describe("NewVendorHead", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseParams.mockReturnValue({});
  });

  it("should render the header-one container", () => {
    const { container } = renderWithProviders(<NewVendorHead />);
    expect(container.querySelector(".header-one")).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByText("Entities")).toBeInTheDocument();
  });

  it("should show 'Add entity' breadcrumb when no id param", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByText("Add entity")).toBeInTheDocument();
  });

  it("should show 'Edit entity' breadcrumb when id param exists", () => {
    mockUseParams.mockReturnValue({ id: "123" });
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByText("Edit entity")).toBeInTheDocument();
  });

  it("should render the Cancel button", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should render the Submit button", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should disable Submit when activeSubmit is true", () => {
    renderWithProviders(<NewVendorHead activeSubmit={true} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("should disable Submit when isSubmitted is true", () => {
    renderWithProviders(<NewVendorHead isSubmitted={true} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("should show 'Add Entity' page title when no id", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByText("Add Entity")).toBeInTheDocument();
  });

  it("should show 'Edit Entity' page title when id exists", () => {
    mockUseParams.mockReturnValue({ id: "456" });
    renderWithProviders(<NewVendorHead />);
    expect(screen.getByText("Edit Entity")).toBeInTheDocument();
  });

  it("should call handleSubmitSuccess on Submit click", () => {
    const mockSubmit = jest.fn();
    renderWithProviders(<NewVendorHead handleSubmitSuccess={mockSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(mockSubmit).toHaveBeenCalled();
  });

  it("should navigate to /masterData on Cancel click", () => {
    renderWithProviders(<NewVendorHead />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockPush).toHaveBeenCalledWith("/masterData");
  });

  it("should not show the Audit Log dialog initially", () => {
    renderWithProviders(<NewVendorHead />);
    expect(screen.queryByText("Audit Log")).not.toBeInTheDocument();
  });
});
