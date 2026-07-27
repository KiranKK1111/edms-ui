import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import DocumentationTab from "../../../components/dataset/DocumentationTab";

let mockState = {};
const mockDispatch = jest.fn(() => Promise.resolve({}));
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../store/actions/DatasetPageActions", () => ({
  fetchUrlsInfo: jest.fn(),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startGetAllDocuments: jest.fn(),
  startDownloadDocument: jest.fn(),
}));

const buildState = () => ({
  dataset: { subscriptionInfo: { data: { taskStatus: "", subscriptionId: "" } } },
  fileUpload: { fileLists: { documentList: "" } },
});

const renderTab = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <DocumentationTab catalogueObj={{ datasetId: "D1", dataFeedId: "F1" }} />
      </MemoryRouter>
    </AppProviders>
  );

describe("DocumentationTab", () => {
  beforeEach(() => {
    mockState = buildState();
  });

  it("should render the main container", () => {
    const { container } = renderTab();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Documentation heading", async () => {
    renderTab();
    expect(await screen.findByText("Documentation")).toBeInTheDocument();
  });
});
