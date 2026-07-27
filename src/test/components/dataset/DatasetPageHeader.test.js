import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import DatasetPageHeader from "../../../components/dataset/DatasetPageHeader";

describe("DatasetPageHeader", () => {
  it("should render the header with the datafeed long name", () => {
    renderWithProviders(<DatasetPageHeader datafeedLongName="My Data Feed" />);
    expect(screen.getByText("My Data Feed")).toBeInTheDocument();
  });

  it("should display a dash when datafeedLongName is not provided", () => {
    renderWithProviders(<DatasetPageHeader />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should show the Subscribed chip when subscription is active", () => {
    renderWithProviders(
      <DatasetPageHeader
        datafeedLongName="Test"
        subscription={{ subscriptionStatus: "Active" }}
      />
    );
    expect(screen.getByText("Subscribed")).toBeInTheDocument();
  });

  it("should not show the Subscribed chip when subscription is not active", () => {
    renderWithProviders(
      <DatasetPageHeader
        datafeedLongName="Test"
        subscription={{ subscriptionStatus: "Pending" }}
      />
    );
    expect(screen.queryByText("Subscribed")).not.toBeInTheDocument();
  });

  it("should not show the Subscribed chip when there is no subscription", () => {
    renderWithProviders(<DatasetPageHeader datafeedLongName="Test" />);
    expect(screen.queryByText("Subscribed")).not.toBeInTheDocument();
  });

  it("should render a back button", () => {
    renderWithProviders(<DatasetPageHeader datafeedLongName="Test" />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });
});
