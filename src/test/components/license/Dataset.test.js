import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import Dataset from "../../../components/license/dataset/Dataset";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({}),
}));

jest.mock("../../../store/actions/licensedataAction", () => ({
  dataset: jest.fn(),
}));

const buildState = () => ({
  license: { selectedLicense: "" },
  licenseReq: { dataset: [] },
});

const renderDataset = () =>
  render(
    <AppProviders>
      <Dataset
        handleChange={jest.fn()}
        handleInformationSecurityRating={jest.fn()}
        next={jest.fn()}
      />
    </AppProviders>
  );

describe("Dataset", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the personal data field", () => {
    renderDataset();
    expect(
      screen.getByText("Dataset contains Personal Data")
    ).toBeInTheDocument();
  });

  it("should render the information security rating field", () => {
    renderDataset();
    expect(
      screen.getAllByText("Information Security Rating").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the data validity and metadata fields", () => {
    renderDataset();
    expect(screen.getByText("Data Validity")).toBeInTheDocument();
    expect(screen.getByText("Metadata Available")).toBeInTheDocument();
    expect(screen.getByText("Metadata Viewing Permission")).toBeInTheDocument();
  });

  it("should render Yes/No radio options", () => {
    renderDataset();
    expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(1);
  });
});
