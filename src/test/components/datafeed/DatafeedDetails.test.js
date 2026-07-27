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

let mockLocation = {
  state: {
    dataset: { datasetId: "DS001", shortName: "MyDataset" },
    isUpdate: false,
  },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useHistory: () => ({ push: jest.fn() }),
  useLocation: () => mockLocation,
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

  it("should prefill Dataset Short Name from the router state in create mode", () => {
    render(<DatafeedDetails />);
    expect(screen.getByDisplayValue("MyDataset")).toBeInTheDocument();
  });

  it("should prefill Dataset Short Name from the router state in edit mode", () => {
    setupSelector({
      feedId: "DF001",
      feedStatus: "Active",
      longName: "Test Feed",
      shortName: "TF",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "A test feed",
    });
    render(<DatafeedDetails />);
    expect(screen.getByDisplayValue("MyDataset")).toBeInTheDocument();
  });

  it("should flag a duplicate short name under the same dataset on blur", async () => {
    const { fireEvent } = require("@testing-library/react");
    setupSelector(
      {
        feedId: "DF001",
        feedStatus: "Active",
        longName: "Test Feed",
        shortName: "TF",
        dataConfidentiality: "Internal",
        personalData: "Non-personal data",
        feedDescription: "A test feed",
      },
      [{ datasetId: "DS001", shortName: "Dup", longName: "DupLong" }]
    );
    render(<DatafeedDetails />);
    const input = await screen.findByDisplayValue("TF");
    fireEvent.change(input, { target: { value: "Dup" } });
    fireEvent.blur(input);
    expect(
      await screen.findByText(
        "Data Feed short name already exists under this DataSet"
      )
    ).toBeInTheDocument();
  });

  it("should carry non-form DB fields through when Next persists the step", async () => {
    const { act } = require("@testing-library/react");
    setupSelector({
      feedId: "DF001",
      feedStatus: "Active",
      longName: "Test Feed",
      shortName: "TF",
      dataConfidentiality: "Internal",
      personalData: "Non-personal data",
      feedDescription: "A test feed",
      documentationLink: "http://example.com/doc",
      dataFeedConfiguration: "CFG1",
      datasetId: "DS001",
      createdBy: "111",
    });
    const next = jest.fn();
    const { rerender } = render(<DatafeedDetails next={next} formData={false} />);
    mockDispatch.mockClear();
    await act(async () => {
      rerender(<DatafeedDetails next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockDispatch).toHaveBeenCalled();
    const dispatched = mockDispatch.mock.calls[0][0];
    expect(dispatched.payload).toEqual(
      expect.objectContaining({
        documentationLink: "http://example.com/doc",
        dataFeedConfiguration: "CFG1",
        datasetId: "DS001",
      })
    );
  });
});
