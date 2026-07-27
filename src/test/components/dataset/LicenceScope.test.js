import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import LicenceScope from "../../../components/dataset/LicenceScope";

let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
}));

const buildState = () => ({
  license: { licenseById: {} },
  contract: { agreementById: "" },
  datafeedInfo: { datafeedsData: [] },
});

const renderScope = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <LicenceScope />
      </MemoryRouter>
    </AppProviders>
  );

describe("LicenceScope", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the main container", () => {
    const { container } = renderScope();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Licence scope heading", () => {
    renderScope();
    expect(screen.getByText("Licence scope")).toBeInTheDocument();
  });

  it("should render the data feeds count label", () => {
    renderScope();
    expect(
      screen.getByText("Data Feeds under the licence (0)")
    ).toBeInTheDocument();
  });

  it("should render labelled scope fields", () => {
    renderScope();
    expect(screen.getByText("Expiration date")).toBeInTheDocument();
    expect(screen.getByText("Licence type")).toBeInTheDocument();
    expect(screen.getByText("SCB Data Owner")).toBeInTheDocument();
  });
});
