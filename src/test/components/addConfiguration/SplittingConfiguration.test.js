import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import SplittingConfiguration from "../../../components/addConfiguration/SplittingConfiguration";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const setupSelector = (configValues = {}, allSchemas = []) => {
  const state = {
    datafeedInfo: {
      congigUi: configValues,
      allSchemas: allSchemas,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const renderCfg = (props = {}) =>
  render(<SplittingConfiguration next={jest.fn()} {...props} />);

describe("SplittingConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render the Splitting Configuration header", () => {
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });

  it("should render the existing schema radio options (Yes / No)", () => {
    renderCfg();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("should render the field labels", () => {
    renderCfg();
    expect(screen.getByText("Existing schema")).toBeInTheDocument();
    expect(screen.getByText("Schema ID")).toBeInTheDocument();
    expect(screen.getByText("Data format")).toBeInTheDocument();
  });

  it("should render the splitting expression labels", () => {
    renderCfg();
    expect(screen.getByText("Splitting path expression")).toBeInTheDocument();
    expect(screen.getByText("Splitting source expression")).toBeInTheDocument();
  });

  it("should render two Click to Upload controls (schema data + metadata)", () => {
    renderCfg();
    expect(
      screen.getAllByRole("button", { name: /Click to Upload/i }).length
    ).toBe(2);
  });

  it("should render with schemas from redux", () => {
    const schemas = [
      { schemaName: "com.edms.fundamentals.bgsgs", version: 0 },
      { schemaName: "com.edms.fundamentals.csf", version: 0 },
    ];
    setupSelector({}, schemas);
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });

  it("should render with existing schema config values", () => {
    setupSelector(
      {
        splitterCanonicalClass:
          "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaId: "schema123",
        dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
        schemaDataObj: { name: "schema.json" },
        schemaMetaDataObj: { name: "metadata.json" },
      },
      [{ schemaName: "schema123", version: 1 }]
    );
    renderCfg();
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });
});
