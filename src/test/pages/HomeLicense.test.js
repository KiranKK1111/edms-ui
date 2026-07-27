import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";

import Home from "../../pages/license/Home";

// Home is now a thin wrapper that delegates to the generic RecordFormPage
// controller. We mock the controller and assert the wrapper picks the right
// resource + mode based on the route.
jest.mock("../../components/recordForm/RecordFormPage", () => (props) => (
  <div
    data-testid="mock-record-form-page"
    data-resource={props.resource}
    data-mode={props.mode}
  />
));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Route path="*">
        <Home />
      </Route>
    </MemoryRouter>
  );

describe("Home (License) wrapper", () => {
  it("renders RecordFormPage for the licence resource", () => {
    renderAt("/masterData/AG1/addLicense");
    const el = screen.getByTestId("mock-record-form-page");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-resource", "licence");
  });

  it("uses create mode on the addLicense path", () => {
    renderAt("/masterData/AG1/addLicense");
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "create"
    );
  });

  it("uses edit mode on the modifyLicense path", () => {
    renderAt("/masterData/L1/modifyLicense");
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-mode",
      "edit"
    );
  });
});
