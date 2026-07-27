import React from "react";
import { render, screen } from "@testing-library/react";

// AddEntity is now a thin wrapper over the generic RecordFormPage controller
// for the "entity" resource. Mock the controller and the route param so this
// unit test verifies only the wrapper's wiring (resource + mode + id).
let mockParams = {};
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
}));

jest.mock("../../components/recordForm/RecordFormPage", () => ({
  __esModule: true,
  default: (props) => (
    <div
      data-testid="record-form-page"
      data-resource={props.resource}
      data-mode={props.mode}
      data-id={props.id || ""}
    />
  ),
}));

const AddEntity = require("../../pages/addEntity/AddEntity").default;

describe("AddEntity (wrapper)", () => {
  it("renders RecordFormPage for the entity resource in create mode", () => {
    mockParams = {};
    render(<AddEntity />);
    const el = screen.getByTestId("record-form-page");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-resource", "entity");
    expect(el).toHaveAttribute("data-mode", "create");
  });

  it("renders in edit mode when an :id param is present", () => {
    mockParams = { id: "E1" };
    render(<AddEntity />);
    const el = screen.getByTestId("record-form-page");
    expect(el).toHaveAttribute("data-mode", "edit");
    expect(el).toHaveAttribute("data-id", "E1");
  });
});
