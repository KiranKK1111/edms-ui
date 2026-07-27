import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppProviders } from "../../../design-system";
import RecordFormPage from "../../../components/recordForm/RecordFormPage";

// Lightweight test for the licence "component" driver. We mock redux + the
// heavy OrderSteps body so this focuses on the generic controller mounting the
// component driver WITHOUT throwing. This guards the regression where the
// licence descriptor (which has no `steps`) made `steps.length` throw inside a
// useCallback dependency array during render.
const mockState = {
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

jest.mock("../../../components/license/step/OrderSteps", () => (props) => {
  // OrderSteps reports its step list, validity + saved data to the controller
  if (props.onStepsReady) {
    props.onStepsReady([
      { key: "Licence Details", title: "Licence Details" },
      { key: "Licence Limitations", title: "Licence Limitations" },
      { key: "Review & Submit", title: "Review & Submit" },
    ]);
  }
  if (props.isFormValid) props.isFormValid(true);
  if (props.savedData) props.savedData({ taskStatus: "PENDING" });
  return <div data-testid="mock-order-steps" />;
});

const renderLicence = (route = "/masterData/AG1/addLicense", mode = "create") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>
        <RecordFormPage resource="licence" mode={mode} />
      </AppProviders>
    </MemoryRouter>
  );

describe("RecordFormPage — licence (component driver)", () => {
  it("mounts the OrderSteps body without crashing", () => {
    renderLicence();
    expect(screen.getByTestId("mock-order-steps")).toBeInTheDocument();
  });

  it("renders the page chrome (title + Cancel/Submit)", () => {
    renderLicence();
    expect(screen.getAllByText("Add Licence").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("enables Submit once the body reports it is valid", () => {
    renderLicence();
    expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled();
  });
});
