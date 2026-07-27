import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";

import Datafeed from "../../pages/datafeed/Datafeed";

// Datafeed is now a thin wrapper that delegates to the generic RecordFormPage
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
      initialEntries={[{ pathname: "/masterData/DS1/datafeed", state }]}
    >
      <Route path="*">
        <Datafeed />
      </Route>
    </MemoryRouter>
  );

describe("Datafeed page wrapper", () => {
  it("renders RecordFormPage for the datafeed resource", () => {
    renderWith({ dataset: { shortName: "DS1" } });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-resource",
      "datafeed"
    );
  });

  it("uses create mode when state.isUpdate is not set", () => {
    renderWith({ dataset: { shortName: "DS1" }, isUpdate: false });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "create"
    );
  });

  it("uses edit mode when state.isUpdate is true", () => {
    renderWith({ dataset: { shortName: "DS1" }, isUpdate: true });
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "edit"
    );
  });
});
