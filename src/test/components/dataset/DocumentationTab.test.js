import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "../../../design-system";
import DocumentationTab from "../../../components/dataset/DocumentationTab";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockState = {};
let mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

const mockFetchUrlsInfo = jest.fn();
jest.mock("../../../store/actions/DatasetPageActions", () => ({
  fetchUrlsInfo: (...args) => mockFetchUrlsInfo(...args),
}));

const mockStartGetAllDocuments = jest.fn();
const mockStartDownloadDocument = jest.fn();
jest.mock("../../../store/actions/datafeedAction", () => ({
  startGetAllDocuments: (...args) => mockStartGetAllDocuments(...args),
  startDownloadDocument: (...args) => mockStartDownloadDocument(...args),
}));

const fileDoc = {
  docObjectId: "D1",
  docObjectType: "Dataset",
  docDisplayFilename: "user-guide.pdf",
  docTitle: "User Guide",
  docDescription: "How to use the dataset",
  docUpdatedOn: "2024-05-01T00:00:00Z",
  docDid: "did-1",
};
const linkDoc = {
  docObjectId: "F1",
  docObjectType: "Data Feed",
  docDisplayFilename: "http://example.com/spec",
  docTitle: "Vendor Spec",
  docDescription: "External specification",
  docUpdatedOn: "2024-06-01T00:00:00Z",
};
const undatedDoc = {
  docObjectId: "F1",
  docObjectType: "Data Feed",
  docDisplayFilename: "changelog.txt",
  docTitle: "Change Log",
  docDescription: "History",
  docDid: "did-3",
};
const otherObjectDoc = {
  docObjectId: "SOMETHING-ELSE",
  docObjectType: "Licence",
  docDisplayFilename: "licence.pdf",
  docTitle: "Licence Doc",
  docDescription: "Not for this feed",
  docUpdatedOn: "2024-07-01T00:00:00Z",
  docDid: "did-4",
};

const buildState = ({
  documentList = "",
  data = { taskStatus: "", subscriptionId: "" },
} = {}) => ({
  dataset: { subscriptionInfo: { data } },
  fileUpload: { fileLists: { documentList } },
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
    mockDispatch = jest.fn(() => Promise.resolve({}));
    mockFetchUrlsInfo.mockReturnValue("fetchUrlsInfo");
    mockStartGetAllDocuments.mockReturnValue("startGetAllDocuments");
    mockStartDownloadDocument.mockReturnValue("startDownloadDocument");
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

  it("should load the document list on mount", () => {
    renderTab();
    expect(mockStartGetAllDocuments).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith("startGetAllDocuments");
  });

  it("should show the empty state when there are no documents", async () => {
    renderTab();
    await screen.findByText("Documentation");
    expect(screen.queryByText("User Guide")).not.toBeInTheDocument();
  });

  it("should list only the documents for the current dataset and data feed", async () => {
    mockState = buildState({
      documentList: [fileDoc, linkDoc, otherObjectDoc],
    });
    renderTab();
    expect(await screen.findByText("User Guide")).toBeInTheDocument();
    expect(screen.getByText("Vendor Spec")).toBeInTheDocument();
    expect(screen.queryByText("Licence Doc")).not.toBeInTheDocument();
  });

  it("should sort the documents by their updated date, newest first", async () => {
    mockState = buildState({
      documentList: [fileDoc, linkDoc],
    });
    renderTab();
    await screen.findByText("Vendor Spec");
    const rows = screen.getAllByRole("row");
    // header row first, then the newest document
    expect(rows[1].textContent).toContain("Vendor Spec");
    expect(rows[2].textContent).toContain("User Guide");
  });

  it("should format the updated on column and tolerate a missing date", async () => {
    mockState = buildState({ documentList: [fileDoc, undatedDoc] });
    renderTab();
    await screen.findByText("User Guide");
    expect(screen.getByText("01 May 2024")).toBeInTheDocument();
    expect(screen.getByText("Change Log")).toBeInTheDocument();
  });

  it("should render external documents as links", async () => {
    mockState = buildState({ documentList: [linkDoc] });
    renderTab();
    const link = await screen.findByRole("link", { name: "Vendor Spec" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("href")).toContain("/spec");
  });

  it("should download an attached document and report success", async () => {
    mockState = buildState({ documentList: [fileDoc] });
    mockDispatch = jest.fn(() =>
      Promise.resolve("Successfully downloaded the document")
    );
    renderTab();
    fireEvent.click(await screen.findByRole("button", { name: "User Guide" }));
    await waitFor(() =>
      expect(mockStartDownloadDocument).toHaveBeenCalledWith(
        "user-guide.pdf",
        "did-1"
      )
    );
    expect(
      await screen.findByText("Successfully downloaded the document")
    ).toBeInTheDocument();
  });

  it("should report a failed download", async () => {
    mockState = buildState({ documentList: [fileDoc] });
    mockDispatch = jest.fn(() => Promise.resolve("Download failed"));
    renderTab();
    fireEvent.click(await screen.findByRole("button", { name: "User Guide" }));
    expect(await screen.findByText("Download failed")).toBeInTheDocument();
  });

  it("should not fetch the access urls while the subscription is pending", async () => {
    mockState = buildState({
      documentList: [fileDoc],
      data: { taskStatus: "Pending", subscriptionId: "SUB-1" },
    });
    renderTab();
    await screen.findByText("User Guide");
    expect(mockFetchUrlsInfo).not.toHaveBeenCalled();
  });

  it("should fetch the access urls once the subscription is approved", async () => {
    mockState = buildState({
      documentList: [fileDoc],
      data: { taskStatus: "Approved", subscriptionId: "SUB-1" },
    });
    renderTab();
    await waitFor(() =>
      expect(mockFetchUrlsInfo).toHaveBeenCalledWith("SUB-1")
    );
    expect(mockDispatch).toHaveBeenCalledWith("fetchUrlsInfo");
  });
});
