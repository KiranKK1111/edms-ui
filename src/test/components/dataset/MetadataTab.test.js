import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import MetadataTab from "../../../components/dataset/MetadataTab";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  getMatadataInfo: jest.fn(),
}));

const buildState = (metadatadetail = {}) => ({
  datafeedInfo: {
    datafeedById: { datafeed: { feedId: "F1" } },
    metadatadetail,
  },
});

const renderTab = () =>
  render(
    <AppProviders>
      <MetadataTab />
    </AppProviders>
  );

describe("MetadataTab", () => {
  it("should render the Schema heading", () => {
    mockState = buildState({ data: { schemaString: "", type: "" } });
    renderTab();
    expect(screen.getByText("Schema")).toBeInTheDocument();
  });

  it("should show 'No Schema' when there is no schema data", () => {
    mockState = buildState({ data: { schemaString: "", type: "" } });
    renderTab();
    expect(screen.getByText("No Schema")).toBeInTheDocument();
  });

  it("should render with JSON schema data", () => {
    mockState = buildState({
      data: { schemaString: '{"type":"object"}', type: "JSON" },
    });
    renderTab();
    expect(screen.getByText("Schema")).toBeInTheDocument();
  });

  it("should render with null metadata", () => {
    mockState = buildState({ data: null });
    renderTab();
    expect(screen.getByText("Schema")).toBeInTheDocument();
  });

  it("should render with undefined metadata detail", () => {
    mockState = buildState({});
    renderTab();
    expect(screen.getByText("Schema")).toBeInTheDocument();
  });
});
