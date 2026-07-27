import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppProviders } from "../../../design-system";
import RecordFormPage from "../../../components/recordForm/RecordFormPage";

// Lightweight test for the dataset "self" driver. Redux + the step components
// are mocked so this focuses on the generic controller: it renders the wizard
// chrome for create/edit and a read-only DetailView for view mode.
let mockState = {
  dataset: { formData: {} },
  vendor: { list: [] },
  contract: {},
  license: { response: {} },
  licenseReq: { licenseDetailsRequirements: [], support: [] },
};

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector(mockState),
  useDispatch: () => jest.fn(),
  connect: () => (Component) => Component,
}));

jest.mock("../../../components/datasetForm/DatasetDetails", () => () => (
  <div data-testid="dataset-details-step" />
));
jest.mock("../../../components/datasetForm/ReviewSubmit", () => () => (
  <div data-testid="dataset-review-step" />
));

const renderRFP = (mode) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/masterData/DS1/dataset" }]}>
      <AppProviders>
        <RecordFormPage resource="dataset" mode={mode} />
      </AppProviders>
    </MemoryRouter>
  );

describe("RecordFormPage — dataset (self driver)", () => {
  beforeEach(() => {
    mockState = {
      dataset: { formData: {} },
      vendor: { list: [] },
      contract: {},
      license: { response: {} },
      licenseReq: { licenseDetailsRequirements: [], support: [] },
    };
  });

  it("renders the create wizard chrome + first step", () => {
    renderRFP("create");
    expect(screen.getAllByText("Add Dataset").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByTestId("dataset-details-step")).toBeInTheDocument();
    expect(screen.getByText("Dataset details")).toBeInTheDocument();
  });

  it("renders a read-only DetailView in view mode", () => {
    mockState.dataset.formData = {
      datasetId: "DS1",
      longName: "My Dataset",
      shortName: "MD",
      datasetStatus: "Active",
      licenseId: "L1",
      datasetDescription: "Some description",
    };
    renderRFP("view");
    expect(screen.getByText("View Dataset")).toBeInTheDocument();
    // values from the descriptor viewFields are shown
    expect(screen.getByText("My Dataset")).toBeInTheDocument();
    expect(screen.getByText("DS1")).toBeInTheDocument();
    // no Submit button in read-only view
    expect(
      screen.queryByRole("button", { name: /^submit$/i })
    ).not.toBeInTheDocument();
    // dataset has no editRoute -> no Edit button either
    expect(
      screen.queryByRole("button", { name: /^edit$/i })
    ).not.toBeInTheDocument();
  });
});
