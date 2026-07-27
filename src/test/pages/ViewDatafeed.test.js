import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";

import ViewDatafeed from "../../pages/datafeed/ViewDatafeed";

// ViewDatafeed is now a thin wrapper that delegates to the generic
// RecordFormPage controller in read-only ("view") mode.
jest.mock("../../components/recordForm/RecordFormPage", () => (props) => (
  <div
    data-testid="mock-record-form-page"
    data-resource={props.resource}
    data-mode={props.mode}
  />
));

const renderPage = () =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/masterData/DS1/viewDatafeed",
          state: { datafeedRecord: {}, dataset: { shortName: "DS1" } },
        },
      ]}
    >
      <Route path="*">
        <ViewDatafeed />
      </Route>
    </MemoryRouter>
  );

describe("ViewDatafeed page wrapper", () => {
  it("renders RecordFormPage for the datafeed resource in view mode", () => {
    renderPage();
    const el = screen.getByTestId("mock-record-form-page");
    expect(el).toHaveAttribute("data-resource", "datafeed");
    expect(el).toHaveAttribute("data-mode", "view");
  });
});
