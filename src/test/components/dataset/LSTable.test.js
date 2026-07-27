import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import LSTable from "../../../components/dataset/LSTable";

const tblData = [
  {
    feedId: "F1",
    shortName: "Feed1",
    dataSetShortName: "DS1",
    isEnabled: true,
    start: "2024-01-01",
    feedDescription: "Test feed",
  },
  {
    feedId: "F2",
    shortName: "Feed2",
    dataSetShortName: "DS2",
    isEnabled: false,
    start: "2024-02-01",
    feedDescription: "Another feed",
  },
  {
    feedId: "F3",
    shortName: "Feed3",
    dataSetShortName: "DS3",
    isEnabled: null,
    start: null,
    feedDescription: "No status feed",
  },
];

describe("LSTable", () => {
  it("should render without crashing", () => {
    const { container } = renderWithProviders(<LSTable tblData={tblData} />);
    expect(container).toBeInTheDocument();
  });

  it("should render the data table column headers", async () => {
    renderWithProviders(<LSTable tblData={tblData} />);
    expect(await screen.findByText("Data Feed")).toBeInTheDocument();
    expect(screen.getByText("Dataset")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Start date")).toBeInTheDocument();
  });

  it("should render the feed rows", async () => {
    renderWithProviders(<LSTable tblData={tblData} />);
    expect(await screen.findByText("Feed1")).toBeInTheDocument();
    expect(screen.getByText("Feed2")).toBeInTheDocument();
    expect(screen.getByText("Feed3")).toBeInTheDocument();
  });

  it("should render status chips reflecting isEnabled", async () => {
    renderWithProviders(<LSTable tblData={tblData} />);
    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("NA")).toBeInTheDocument();
  });

  it("should format the start date", async () => {
    renderWithProviders(<LSTable tblData={tblData} />);
    expect(await screen.findByText("01 Jan 2024")).toBeInTheDocument();
  });

  it("should render with empty tblData without crashing", async () => {
    renderWithProviders(<LSTable tblData={[]} />);
    await waitFor(() =>
      expect(screen.getByText("Data Feed")).toBeInTheDocument()
    );
  });
});
