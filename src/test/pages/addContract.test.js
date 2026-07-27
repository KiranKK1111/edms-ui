import React from "react";
import { render, screen } from "@testing-library/react";

// addContract is now a thin wrapper that delegates to the generic
// RecordFormPage controller for the "agreement" resource. Mock the controller
// so this unit test verifies only the wrapper's wiring (resource + mode).
let mockPathname = "/masterData/StageOne/addAgreement";
jest.mock("react-router-dom", () => ({
  useHistory: () => ({ location: { pathname: mockPathname } }),
}));

jest.mock("../../components/recordForm/RecordFormPage", () => ({
  __esModule: true,
  default: (props) => (
    <div
      data-testid="record-form-page"
      data-resource={props.resource}
      data-mode={props.mode}
    />
  ),
}));

import AddContract from "../../pages/contract/addContract";

describe("AddContract (wrapper)", () => {
  it("renders RecordFormPage for the agreement resource in create mode", () => {
    mockPathname = "/masterData/StageOne/addAgreement";
    render(<AddContract />);
    const el = screen.getByTestId("record-form-page");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-resource", "agreement");
    expect(el).toHaveAttribute("data-mode", "create");
  });

  it("renders in edit mode on the modifyAgreement route", () => {
    mockPathname = "/masterData/StageOne/modifyAgreement";
    render(<AddContract />);
    expect(screen.getByTestId("record-form-page")).toHaveAttribute(
      "data-mode",
      "edit"
    );
  });
});
