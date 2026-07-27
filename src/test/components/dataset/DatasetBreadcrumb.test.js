import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import DatasetBreadcrumb from "../../../components/dataset/DatasetBreadcrumb";

describe("DatasetBreadcrumb", () => {
  it("should render a breadcrumb navigation", () => {
    renderWithProviders(<DatasetBreadcrumb />);
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });

  it("should render the Catalogue link", () => {
    renderWithProviders(<DatasetBreadcrumb title="Test Feed" />);
    expect(screen.getByText("Catalogue")).toBeInTheDocument();
  });

  it("should link the home icon and Catalogue to /catalog", () => {
    const { container } = renderWithProviders(<DatasetBreadcrumb title="Test" />);
    const links = container.querySelectorAll("a[href='/catalog']");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("should display title when provided", () => {
    renderWithProviders(<DatasetBreadcrumb title="My Data Feed" />);
    expect(screen.getByText("My Data Feed")).toBeInTheDocument();
  });

  it("should display dash when title is not provided", () => {
    renderWithProviders(<DatasetBreadcrumb />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should display dash when title is empty string", () => {
    renderWithProviders(<DatasetBreadcrumb title="" />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should apply the legacy spacing className", () => {
    const { container } = renderWithProviders(<DatasetBreadcrumb />);
    expect(container.querySelector(".mt-16.ml-24.mr-24")).toBeInTheDocument();
  });
});
