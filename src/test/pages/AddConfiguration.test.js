import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AddConfiguration from "../../pages/datafeed/AddConfiguration";

// AddConfiguration is now a thin wrapper over the generic RecordFormPage
// controller (the "delegated" driver). Mock the controller so this verifies
// only the wrapper's wiring (resource).
jest.mock("../../components/recordForm/RecordFormPage", () => (props) => (
  <div data-testid="mock-record-form-page" data-resource={props.resource} />
));

describe("AddConfiguration (wrapper)", () => {
  it("renders RecordFormPage for the datafeedConfig resource", () => {
    render(
      <MemoryRouter initialEntries={["/masterData/DF1/addConfiguration"]}>
        <AddConfiguration />
      </MemoryRouter>
    );
    expect(screen.getByTestId("mock-record-form-page")).toHaveAttribute(
      "data-resource",
      "datafeedConfig"
    );
  });
});
