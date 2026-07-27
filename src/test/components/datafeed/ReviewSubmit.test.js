import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import ReviewSubmit from "../../../components/datafeed/ReviewSubmit";

jest.spyOn(console, "error").mockImplementation(() => {});
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => ({
    state: { dataset: { datasetId: "DS001" }, isUpdate: false },
  }),
}));

const setupSelector = (formData = {}) => {
  const state = { datafeedInfo: { formData } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const fullFormData = {
  dataFeedId: "DF001",
  url: "",
  status: "Pending",
  dataFeedConfiguration: "",
  longName: "Test Feed",
  shortName: "TF",
  dataConfidentiality: "Internal",
  personalData: "Non-personal data",
  feedDescription: "Test",
  feedId: "",
  feedStatus: "",
  documentationLink: "",
};

describe("ReviewSubmit (Datafeed)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    localStorage.setItem("entitlementType", "Dataset Owner");
    setupSelector(fullFormData);
  });

  it("should render the main container", () => {
    const { container } = render(<ReviewSubmit />);
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the General Details heading", () => {
    render(<ReviewSubmit />);
    expect(screen.getByText("General Details")).toBeInTheDocument();
  });

  it("should render the review-submit wrapper", () => {
    const { container } = render(<ReviewSubmit />);
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should render field values from the form data", () => {
    render(<ReviewSubmit />);
    expect(screen.getByText("Test Feed")).toBeInTheDocument();
    expect(screen.getByText("TF")).toBeInTheDocument();
  });

  it("should dispatch formDataFn on mount", () => {
    render(<ReviewSubmit />);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
