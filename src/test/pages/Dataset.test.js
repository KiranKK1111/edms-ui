import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";

import Dataset from "../../pages/dataset/Dataset";

// Dataset is now a thin wrapper that delegates to the generic RecordFormPage
// controller. We mock the controller and assert the wrapper picks the right
// resource + mode based on the navigation location.state.
jest.mock("../../components/recordForm/RecordFormPage", () => (props) => (
  <div
    data-testid="mock-record-form-page"
    data-resource={props.resource}
    data-mode={props.mode}
  />
));

const renderWith = (state) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/masterData/DS1/dataset", state }]}
    >
      <Route path="*">
        <Dataset />
      </Route>
    </MemoryRouter>
  );

describe("Dataset page wrapper", () => {
  it("renders RecordFormPage for the dataset resource", () => {
    renderWith(undefined);
    const el = screen.getByTestId("mock-record-form-page");
    expect(el).toHaveAttribute("data-resource", "dataset");
  });

  it("uses create mode when there is no isUpdate/isView state", () => {
    renderWith({ licence: { licenseId: "L1" } });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "create"
    );
  });

  it("uses edit mode when state.isUpdate is true", () => {
    renderWith({ isUpdate: true, licence: { licenseId: "L1" } });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "edit"
    );
  });

  it("uses view mode when state.isView is true", () => {
    renderWith({ isView: true, licence: { licenseId: "L1" } });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "view"
    );
  });
});
