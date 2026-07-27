import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { AppProviders } from "../../../design-system";
import store from "../../../store";
import RecordFormPage from "../../../components/recordForm/RecordFormPage";

const renderRFP = (ui, route = "/record/entity/create") =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <AppProviders>{ui}</AppProviders>
      </MemoryRouter>
    </Provider>
  );

describe("RecordFormPage (generic controller)", () => {
  it("renders the entity create wizard with chrome + step", () => {
    renderRFP(<RecordFormPage resource="entity" mode="create" />);
    // Title from pageConfig (also appears in the breadcrumb, so allow >1)
    expect(screen.getAllByText("Add Entity").length).toBeGreaterThan(0);
    // Header actions
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    // Step label from the entity descriptor
    expect(screen.getAllByText("Entity Details").length).toBeGreaterThan(0);
  });

  it("renders read-only View mode header (Edit button, no Submit)", () => {
    renderRFP(
      <RecordFormPage resource="entity" mode="view" id="UNKNOWN" />,
      "/record/entity/view/UNKNOWN"
    );
    expect(screen.getByText("View Entity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^submit$/i })
    ).not.toBeInTheDocument();
  });

  it("shows an error for an unknown resource", () => {
    renderRFP(<RecordFormPage resource="nope" mode="create" />);
    expect(screen.getByText(/Unknown record type/i)).toBeInTheDocument();
  });

  // Guards the "Maximum update depth exceeded" regression: the dataset
  // descriptor's selectedSelector must return a STABLE reference so the real
  // react-redux useSelector doesn't re-render infinitely. Rendered against the
  // real store so an unstable selector would throw here.
  it("renders the dataset create wizard against the real store without looping", () => {
    renderRFP(
      <RecordFormPage resource="dataset" mode="create" />,
      "/masterData/DS1/dataset"
    );
    expect(screen.getAllByText("Add Dataset").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders the datafeed view (custom rich body) against the real store", () => {
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/masterData/DS1/viewDatafeed",
              state: { datafeedRecord: {}, dataset: { shortName: "DS1" } },
            },
          ]}
        >
          <AppProviders>
            <RecordFormPage resource="datafeed" mode="view" />
          </AppProviders>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getAllByText("View Data Feed").length).toBeGreaterThan(0);
    // the descriptor's custom ViewBody (not the generic field list)
    expect(screen.getByText("General Details")).toBeInTheDocument();
    expect(screen.getByText("Data Feed configuration")).toBeInTheDocument();
  });

  it("renders the datafeed-configuration delegated wizard against the real store", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/masterData/DF1/addConfiguration"]}>
          <AppProviders>
            <RecordFormPage resource="datafeedConfig" />
          </AppProviders>
        </MemoryRouter>
      </Provider>
    );
    // Title + Cancel/Submit chrome come from the delegated view-model
    expect(
      screen.getAllByText(/Data Feed Configuration/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});
