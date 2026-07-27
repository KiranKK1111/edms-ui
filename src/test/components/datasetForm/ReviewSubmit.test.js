import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import ReviewSubmit from "../../../components/datasetForm/ReviewSubmit";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useLocation: () => ({
    pathname: "/another-route",
    state: { isUpdate: true, eid: "E1", licence: { licenseId: "L1" } },
  }),
  useParams: () => ({ vendorId: "123", id: "" }),
  useHistory: () => ({ push: jest.fn() }),
}));

jest.mock("../../../store/actions/datasetFormActions", () => ({
  datasetInfo: jest.fn(),
}));

const buildState = () => ({
  dataset: {
    formData: {
      description: "Some description",
      datasetId: "DS1",
      status: "Active",
      longName: "Long",
      shortName: "Short",
      roleName: "Admin",
    },
  },
});

const renderReview = () =>
  render(
    <AppProviders>
      <ReviewSubmit />
    </AppProviders>
  );

describe("ReviewSubmit", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the review-submit container", () => {
    const { container } = renderReview();
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should render the Dataset Details heading", () => {
    renderReview();
    expect(screen.getByText("Dataset Details")).toBeInTheDocument();
  });

  it("should render the dataset field values", () => {
    renderReview();
    expect(screen.getByText("Long")).toBeInTheDocument();
    expect(screen.getByText("Short")).toBeInTheDocument();
    expect(screen.getByText("DS1")).toBeInTheDocument();
  });
});
