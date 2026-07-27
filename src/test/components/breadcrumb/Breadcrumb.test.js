import React from "react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import BreadcrumbComponent from "../../../components/breadcrumb/Breadcrumb";

describe("BreadcrumbComponent", () => {
  it("should render a Breadcrumb component", () => {
    const { container } = renderWithProviders(<BreadcrumbComponent />);
    expect(container.querySelector(".app-breadcrumb")).toBeInTheDocument();
  });

  it("should render home icon link to /catalog", () => {
    const { container } = renderWithProviders(<BreadcrumbComponent />);
    expect(container.querySelector("a[href='/catalog']")).toBeInTheDocument();
  });

  it("should render breadcrumb items from props", () => {
    const breadcrumb = [
      { name: "Datasets", url: "/datasets" },
      { name: "Details" },
    ];
    const { container, getByText } = renderWithProviders(
      <BreadcrumbComponent breadcrumb={breadcrumb} />
    );
    // Datasets is a non-last item with a url -> link; Details is the last item -> text.
    const datasetsLink = getByText("Datasets");
    expect(datasetsLink.closest("a")).toHaveAttribute("href", "/datasets");
    expect(getByText("Details")).toBeInTheDocument();
    expect(getByText("Details").closest("a")).toBeNull();
    // home link + Datasets link
    expect(container.querySelectorAll("a").length).toBe(2);
  });

  it("should render text only for items without url", () => {
    const breadcrumb = [{ name: "Details" }];
    const { getByText } = renderWithProviders(
      <BreadcrumbComponent breadcrumb={breadcrumb} />
    );
    expect(getByText("Details").closest("a")).toBeNull();
  });

  it("should handle empty breadcrumb array", () => {
    const { container } = renderWithProviders(
      <BreadcrumbComponent breadcrumb={[]} />
    );
    expect(container.querySelectorAll("a").length).toBe(1);
  });

  it("should handle undefined breadcrumb", () => {
    const { container } = renderWithProviders(<BreadcrumbComponent />);
    expect(container.querySelectorAll("a").length).toBe(1);
  });

  it("should render multiple breadcrumb items in order", () => {
    const breadcrumb = [
      { name: "Master Data", url: "/masterdata" },
      { name: "Vendors", url: "/vendors" },
      { name: "Details" },
    ];
    const { container, getByText } = renderWithProviders(
      <BreadcrumbComponent breadcrumb={breadcrumb} />
    );
    expect(getByText("Master Data").closest("a")).toHaveAttribute(
      "href",
      "/masterdata"
    );
    expect(getByText("Vendors").closest("a")).toHaveAttribute(
      "href",
      "/vendors"
    );
    expect(getByText("Details").closest("a")).toBeNull();
    // home + Master Data + Vendors
    expect(container.querySelectorAll("a").length).toBe(3);
  });

  it("should have truncate-text class on links", () => {
    const breadcrumb = [
      { name: "Test", url: "/test" },
      { name: "Last" },
    ];
    const { getByText } = renderWithProviders(
      <BreadcrumbComponent breadcrumb={breadcrumb} />
    );
    expect(getByText("Test").closest("a")).toHaveClass("truncate-text");
  });
});
