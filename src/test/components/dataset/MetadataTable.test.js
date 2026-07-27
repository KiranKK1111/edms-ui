import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/renderWithProviders";
import MetadataTable from "../../../components/dataset/MetadataTable";

jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("../../../store/services/ContractService", () => ({
  metaTabTableData: jest.fn(),
}));

describe("MetadataTable", () => {
  it("should render without crashing", () => {
    const { container } = renderWithProviders(<MetadataTable />);
    expect(container).toBeInTheDocument();
  });

  it("should render all column headers", async () => {
    renderWithProviders(<MetadataTable />);
    expect(await screen.findByText("Attribute Schema Name")).toBeInTheDocument();
    expect(screen.getByText("Attribute Table Name")).toBeInTheDocument();
    expect(screen.getByText("Attribute Name")).toBeInTheDocument();
    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Data Length")).toBeInTheDocument();
    expect(screen.getByText("Parent Table Name")).toBeInTheDocument();
    expect(screen.getByText("Table Rank")).toBeInTheDocument();
  });
});
