import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import DatafeedDetails from "../../../components/datafeed/DatafeedDetails";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: jest.fn() }),
  useLocation: () => ({
    state: { dataset: { datasetId: "DS001" }, isUpdate: false },
  }),
}));

const setupSelector = (formData = {}, datafeedsData = []) => {
  const state = {
    datafeedInfo: { formData, datafeedsData },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("DatafeedDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
  });

  it("should render the main container", () => {
    const { container } = render(<DatafeedDetails />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the identity field labels", () => {
    render(<DatafeedDetails />);
    expect(screen.getAllByText("Data Feed ID").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Long Name and Short Name fields", () => {
    render(<DatafeedDetails />);
    expect(screen.getAllByText("Long Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Short Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Data Confidentiality and Description fields", () => {
    render(<DatafeedDetails />);
    expect(screen.getAllByText("Data Confidentiality").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Description").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the disabled Data Feed ID input", () => {
    const { container } = render(<DatafeedDetails />);
    expect(container.querySelectorAll("input[disabled]").length).toBeGreaterThanOrEqual(1);
  });

  it("should render with existing form data", () => {
    setupSelector({
      feedId: "DF001",
      feedStatus: "Active",
      longName: "Test Feed",
      shortName: "TF",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "A test feed",
      documentationLink: "http://example.com",
    });
    const { container } = render(<DatafeedDetails />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });
});
