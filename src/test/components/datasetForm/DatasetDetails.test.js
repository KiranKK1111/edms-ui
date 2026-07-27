import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import DatasetDetails from "../../../components/datasetForm/DatasetDetails";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "/example/path",
    state: { licence: { licenseId: "" } },
  }),
}));

jest.mock("../../../store/actions/datasetFormActions", () => ({
  datasetInfo: jest.fn(),
}));

const buildState = () => ({
  dataset: {
    formData: [
      { datasetId: "", status: "", description: "", entityId: "", licenseId: "" },
    ],
    datasetInfo: [{ licenseId: "" }],
  },
});

const renderDetails = () =>
  render(
    <AppProviders>
      <DatasetDetails next={jest.fn()} />
    </AppProviders>
  );

describe("DatasetDetails", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render a form", () => {
    const { container } = renderDetails();
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should render the Long Name field", () => {
    renderDetails();
    expect(screen.getAllByText("Long Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Short Name field", () => {
    renderDetails();
    expect(screen.getAllByText("Short Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Description field", () => {
    renderDetails();
    expect(screen.getAllByText("Description").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Dataset ID and Status fields", () => {
    renderDetails();
    expect(screen.getAllByText("Dataset ID").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
  });
});
