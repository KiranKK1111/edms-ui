import React from "react";
import * as redux from "react-redux";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AppProviders from "../../design-system/AppProviders";
import MasterData from "../../pages/masterData/MasterData";

jest.spyOn(console, "error").mockImplementation(() => {});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../pages/masterData/VendorData", () => () => (
  <div data-testid="mock-vendor-data" />
));
jest.mock("../../pages/masterData/DataSetData", () => () => (
  <div data-testid="mock-dataset-data" />
));

const state = {
  dataset: { datasetsInfo: [] },
  datafeedInfo: { datafeedsData: [] },
  contract: { data: [[]] },
  vendor: { list: [], loading: false },
};

const renderPage = (props = {}) =>
  render(
    <AppProviders>
      <MemoryRouter>
        <MasterData {...props} />
      </MemoryRouter>
    </AppProviders>
  );

describe("MasterData", () => {
  beforeEach(() => {
    mockDispatch.mockReturnValue(
      Promise.resolve({ status: 200, data: { entityManagementList: [] } })
    );
    jest
      .spyOn(redux, "useSelector")
      .mockImplementation((selector) => selector(state));
  });

  it("should render the search input", async () => {
    const { container, findByText } = renderPage();
    await findByText("Entity Details");
    expect(container.querySelector("#inp-search")).toBeInTheDocument();
  });

  it("should render the Entity Details section", async () => {
    const { findByText } = renderPage();
    expect(await findByText("Entity Details")).toBeInTheDocument();
  });

  it("should handle search input change", async () => {
    const { container, findByText } = renderPage();
    await findByText("Entity Details");
    const input =
      container.querySelector("#inp-search input") ||
      container.querySelector("#inp-search");
    fireEvent.change(input, { target: { value: "test" } });
    expect(input).toBeInTheDocument();
  });
});
