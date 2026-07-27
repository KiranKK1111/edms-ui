import React from "react";
import * as redux from "react-redux";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import AppProviders from "../../design-system/AppProviders";
import AddEditDocuments from "../../pages/datafeed/AddEditDocuments";
import imperativeConfirm from "../../design-system/imperativeConfirm";
import { toast } from "../../design-system/toast";
import {
  startSubmittingDocumentsOrUrl,
  startGetAllDocuments,
  startDownloadDocument,
  startDeleteDocument,
  startGetDatafeeds,
} from "../../store/actions/datafeedAction";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn();
const mockHistoryPush = jest.fn();
let mockParams = { dsDfId: "DS1", docObjectIds: "" };

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => mockParams,
  useHistory: () => ({ push: mockHistoryPush }),
  useLocation: () => ({ pathname: "/addDocuments", state: {} }),
  Link: ({ children, onClick }) => (
    <a
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      {children}
    </a>
  ),
}));

jest.mock("../../components/Modals/DocumentDeleteValidate", () => () => (
  <div data-testid="mock-doc-delete-validate" />
));

jest.mock("../../design-system/imperativeConfirm", () => jest.fn());

jest.mock("../../design-system/toast", () => {
  const api = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  };
  return { __esModule: true, toast: api, default: api, setToastApi: jest.fn() };
});

jest.mock("../../store/actions/datafeedAction", () => ({
  startSubmittingDocumentsOrUrl: jest.fn(),
  startGetAllDocuments: jest.fn(),
  startDownloadDocument: jest.fn(),
  startDeleteDocument: jest.fn(),
  getAllDocs: jest.fn(),
  startGetDatafeeds: jest.fn(),
}));

jest.mock("../../store/actions/DatasetPageActions", () => ({
  startGetDatasets: jest.fn(),
}));

// Configurable per-test results returned when the component dispatches a
// mocked action; keyed by the sentinel action type produced by the mocked
// action creators. CRA's jest config uses resetMocks, so all mock
// implementations must be (re)installed in beforeEach below.
let dispatchResults = {};

const fileDoc = {
  docDid: "DOC1",
  docObjectId: "DS1",
  docObjectType: "dataset",
  docTitle: "Spec document",
  docDescription: "A plain file document",
  docDisplayFilename: "spec.pdf",
  docCreatedOn: "2026-01-01",
  docUpdatedOn: "2026-01-02",
};

const linkDoc = {
  docDid: "DOC2",
  docObjectId: "DS1",
  docObjectType: "dataset",
  docTitle: "Portal link",
  docDescription: "A url document",
  docDisplayFilename: "http://example.com/portal",
  docCreatedOn: "2026-01-03",
  docUpdatedOn: "2026-01-04",
};

const baseState = () => ({
  fileUpload: { fileLists: { documentList: [] } },
  dataset: { datasetsInfo: [{ datasetId: "DS1", shortName: "Dataset One" }] },
  datafeedInfo: {
    datafeedsData: [{ feedId: "DF1", shortName: "Feed One", datasetId: "DS1" }],
  },
});

let mockState = baseState();

const grantAccess = () => {
  localStorage.setItem(
    "objectMatrix",
    JSON.stringify([
      {
        category: "Masterdata",
        objectName: "Add Documents For Dataset",
        permission: "RW",
      },
      {
        category: "Masterdata",
        objectName: "Add Documents For Datafeed",
        permission: "RW",
      },
    ])
  );
};

const buildProps = (overrides = {}) => ({
  location: {
    state: { editObj: {} },
    pathname: "/addDocuments",
    ...(overrides.location || {}),
  },
  history: { push: jest.fn() },
});

const renderPage = (props = buildProps()) =>
  render(
    <AppProviders>
      <AddEditDocuments {...props} />
    </AppProviders>
  );

beforeEach(() => {
  localStorage.clear();
  mockParams = { dsDfId: "DS1", docObjectIds: "" };
  mockState = baseState();
  dispatchResults = { GET_ALL_DOCS: { documentList: [] } };

  // resetMocks wipes implementations between tests — reinstall them here.
  startSubmittingDocumentsOrUrl.mockImplementation((payload, docObjectIds) => ({
    type: "SUBMIT_DOC",
    payload,
    docObjectIds,
  }));
  startGetAllDocuments.mockImplementation(() => ({ type: "GET_ALL_DOCS" }));
  startDownloadDocument.mockImplementation((fileName, docDid) => ({
    type: "DOWNLOAD_DOC",
    fileName,
    docDid,
  }));
  startDeleteDocument.mockImplementation((docDid, docObjectId) => ({
    type: "DELETE_DOC",
    docDid,
    docObjectId,
  }));
  startGetDatafeeds.mockImplementation(() => ({ type: "GET_DATAFEEDS" }));
  startGetDatasets.mockImplementation(() => ({ type: "GET_DATASETS" }));
  mockDispatch.mockImplementation((action) => {
    if (
      action &&
      action.type &&
      Object.prototype.hasOwnProperty.call(dispatchResults, action.type)
    ) {
      return Promise.resolve(dispatchResults[action.type]);
    }
    return Promise.resolve(undefined);
  });
  imperativeConfirm.mockResolvedValue(false);
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest
    .spyOn(redux, "useSelector")
    .mockImplementation((callback) => callback(mockState));
});

describe("AddEditDocuments", () => {
  it("should render the main wrapper", () => {
    const { container } = renderPage();
    expect(container.querySelector("#main")).toBeInTheDocument();
  });

  it("should render the Document details heading", () => {
    renderPage();
    expect(screen.getByText("Document details")).toBeInTheDocument();
  });

  it("shows the empty state when there are no documents", () => {
    renderPage();
    expect(
      screen.getByText("No Documents / Link Uploaded")
    ).toBeInTheDocument();
  });

  it("renders file and url rows from the redux document list", () => {
    mockState.fileUpload.fileLists.documentList = [fileDoc, linkDoc];
    renderPage();

    expect(screen.getByText("Spec document")).toBeInTheDocument();
    expect(screen.getByText("spec.pdf")).toBeInTheDocument();
    expect(screen.getByText("Portal link")).toBeInTheDocument();
    expect(screen.getByText("http://example.com/portal")).toBeInTheDocument();
    expect(screen.getByText("A plain file document")).toBeInTheDocument();
    expect(screen.getByText("A url document")).toBeInTheDocument();
    // one Edit/Delete action pair per row
    expect(screen.getAllByText("Edit")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("shows the pending licence warning when licence status is pending", () => {
    const props = buildProps({
      location: {
        state: { editObj: {}, record: { licenseStatus: "Pending" } },
        pathname: "/addDocuments",
      },
    });
    renderPage(props);
    expect(
      screen.getByText(/This Licence is currently under review/)
    ).toBeInTheDocument();
  });

  it("fetches datasets when the dataset name is not in the store", () => {
    mockState.dataset.datasetsInfo = [];
    renderPage();
    expect(startGetDatasets).toHaveBeenCalled();
  });

  it("fetches datasets and datafeeds for a datafeed id with no store data", () => {
    mockParams = { dsDfId: "DF1", docObjectIds: "" };
    mockState.dataset.datasetsInfo = [];
    mockState.datafeedInfo.datafeedsData = [];
    renderPage();
    expect(startGetDatasets).toHaveBeenCalled();
    expect(startGetDatafeeds).toHaveBeenCalled();
  });

  it("renders the datafeed breadcrumb when the id is a datafeed", () => {
    mockParams = { dsDfId: "DF1", docObjectIds: "" };
    renderPage();
    expect(screen.getByText("Feed One")).toBeInTheDocument();
    expect(screen.getByText("Dataset One")).toBeInTheDocument();
  });

  it("navigates back to master data from the page header", () => {
    const props = buildProps();
    renderPage(props);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(props.history.push).toHaveBeenCalledWith("/masterData");
  });
});

describe("AddEditDocuments upload flow", () => {
  const selectFile = (container, file) => {
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
  };

  const fillDetails = () => {
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My title" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "My description" },
    });
  };

  it("shows the selected file name after choosing a file", async () => {
    grantAccess();
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    expect(await screen.findByText(/notes.pdf/)).toBeInTheDocument();
  });

  it("submits an uploaded file successfully", async () => {
    grantAccess();
    dispatchResults.SUBMIT_DOC = { statusMessage: "OK" };
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    fillDetails();
    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        " The File/Link has been successfully uploaded!"
      )
    );
    expect(mockHistoryPush).toHaveBeenCalledWith("/masterData/DS1/addDocuments");
    const [payload, docObjectIds] =
      startSubmittingDocumentsOrUrl.mock.calls[0];
    expect(docObjectIds).toBe("");
    expect(payload.docObj.docTitle).toBe("My title");
    expect(payload.docObj.docDescription).toBe("My description");
    expect(payload.docObj.docDisplayFilename).toBe("notes.pdf");
    expect(payload.docObj.docObjectType).toBe("dataset");
    expect(payload.file.name).toBe("notes.pdf");
  });

  it("shows an error toast when the submit action reports a failure", async () => {
    grantAccess();
    dispatchResults.SUBMIT_DOC = { message: "boom" };
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    fillDetails();
    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "File/Link not uploaded due to: boom"
      )
    );
  });

  it("rejects files above 100MB on selection and on submit", async () => {
    grantAccess();
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    const bigFile = new File(["x"], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(bigFile, "size", { value: 101 * 1024 * 1024 });
    selectFile(container, bigFile);

    expect(toast.error).toHaveBeenCalledWith(
      "File not uploaded due to: Max File size upload allowed is 100MB"
    );

    fillDetails();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2));
    expect(startSubmittingDocumentsOrUrl).not.toHaveBeenCalled();
  });

  it("shows required-field validation errors on empty submit", async () => {
    grantAccess();
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Please Enter Title")).toBeInTheDocument();
    expect(screen.getByText("Please add Description")).toBeInTheDocument();
    expect(startSubmittingDocumentsOrUrl).not.toHaveBeenCalled();
  });

  it("removes the chosen file when replace is confirmed", async () => {
    grantAccess();
    imperativeConfirm.mockResolvedValue(true);
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    fireEvent.click(await screen.findByText(/notes.pdf/));

    await waitFor(() =>
      expect(screen.queryByText(/notes.pdf/)).not.toBeInTheDocument()
    );
    expect(imperativeConfirm).toHaveBeenCalled();
  });

  it("keeps the chosen file when replace is cancelled", async () => {
    grantAccess();
    imperativeConfirm.mockResolvedValue(false);
    const { container } = renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    selectFile(
      container,
      new File(["hello"], "notes.pdf", { type: "application/pdf" })
    );
    fireEvent.click(await screen.findByText(/notes.pdf/));

    await waitFor(() => expect(imperativeConfirm).toHaveBeenCalled());
    expect(screen.getByText(/notes.pdf/)).toBeInTheDocument();
  });

  it("resets the form and navigates on cancel", async () => {
    grantAccess();
    renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockHistoryPush).toHaveBeenCalledWith(
      "/masterData/DS1/addDocuments"
    );
  });
});

describe("AddEditDocuments url flow", () => {
  const switchToUrl = () => {
    fireEvent.click(screen.getByLabelText("Add URL"));
  };

  const fillDetails = () => {
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Url title" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Url description" },
    });
  };

  it("shows the url input when Add URL is selected", async () => {
    grantAccess();
    renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    switchToUrl();
    expect(screen.getByPlaceholderText("Add URL")).toBeInTheDocument();
  });

  it("rejects an invalid url on submit", async () => {
    grantAccess();
    renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    switchToUrl();
    fillDetails();
    fireEvent.change(screen.getByPlaceholderText("Add URL"), {
      target: { value: "not-a-url" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(
      await screen.findByText("Url Validation failed")
    ).toBeInTheDocument();
    expect(startSubmittingDocumentsOrUrl).not.toHaveBeenCalled();
  });

  it("submits a valid url successfully", async () => {
    grantAccess();
    dispatchResults.SUBMIT_DOC = { statusMessage: "OK" };
    renderPage();
    await screen.findByText("No Documents / Link Uploaded");

    switchToUrl();
    fillDetails();
    fireEvent.change(screen.getByPlaceholderText("Add URL"), {
      target: { value: "https://www.example.com/page" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        " The File/Link has been successfully uploaded!"
      )
    );
    const [payload] = startSubmittingDocumentsOrUrl.mock.calls[0];
    expect(payload.docObj.docDisplayFilename).toBe(
      "https://www.example.com/page"
    );
    expect(payload.docObj.docTitle).toBe("Url title");
  });
});

describe("AddEditDocuments table actions", () => {
  it("deletes a document after confirmation", async () => {
    grantAccess();
    imperativeConfirm.mockResolvedValue(true);
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    dispatchResults.DELETE_DOC = { statusMessage: { message: "Deleted!" } };
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Deleted!"));
    expect(startDeleteDocument).toHaveBeenCalledWith("DOC1", "DS1");
    expect(mockHistoryPush).toHaveBeenCalledWith(
      "/masterData/DS1/addDocuments"
    );
  });

  it("shows an error toast when delete fails", async () => {
    grantAccess();
    imperativeConfirm.mockResolvedValue(true);
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    dispatchResults.DELETE_DOC = undefined;
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error while delete file/Link")
    );
  });

  it("does not delete when the confirmation is cancelled", async () => {
    grantAccess();
    imperativeConfirm.mockResolvedValue(false);
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(imperativeConfirm).toHaveBeenCalled());
    expect(startDeleteDocument).not.toHaveBeenCalled();
  });

  it("downloads a file and shows a success toast", async () => {
    grantAccess();
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    dispatchResults.DOWNLOAD_DOC = "Document Downloaded Successfully!";
    renderPage();

    fireEvent.click(await screen.findByText("spec.pdf"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Document Downloaded Successfully!"
      )
    );
    expect(startDownloadDocument).toHaveBeenCalledWith("spec.pdf", "DOC1");
  });

  it("shows an error toast when the download fails", async () => {
    grantAccess();
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    dispatchResults.DOWNLOAD_DOC = "Document Downloaded Error!";
    renderPage();

    fireEvent.click(await screen.findByText("spec.pdf"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Document Downloaded Error!")
    );
  });

  it("navigates to edit and marks the record as read-only when Edit is clicked", async () => {
    grantAccess();
    mockState.fileUpload.fileLists.documentList = [fileDoc];
    renderPage();

    fireEvent.click(await screen.findByText("Edit"));
    // Edit is a Link; clicking it triggers setShowPdf(true) via onClick.
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("paginates when there are more than five documents", async () => {
    mockState.fileUpload.fileLists.documentList = Array.from(
      { length: 6 },
      (_, i) => ({
        ...fileDoc,
        docDid: `DOC${i + 1}`,
        docTitle: `Document ${i + 1}`,
        docUpdatedOn: `2026-01-${String(10 + i).padStart(2, "0")}`,
      })
    );
    renderPage();

    // Sorted by docUpdatedOn desc — Document 6 is newest, Document 1 last.
    expect(screen.getByText("Document 6")).toBeInTheDocument();
    expect(screen.queryByText("Document 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(await screen.findByText("Document 1")).toBeInTheDocument();
    expect(screen.queryByText("Document 6")).not.toBeInTheDocument();
  });
});

describe("AddEditDocuments edit mode", () => {
  const urlEditProps = () =>
    ({
      location: {
        state: { editObj: { ...linkDoc } },
        pathname: "/masterData/DS1/editDocuments/DOC2",
      },
      history: { push: jest.fn() },
    });

  const fileEditProps = () =>
    ({
      location: {
        state: { editObj: { ...fileDoc } },
        pathname: "/masterData/DS1/editDocuments/DOC1",
      },
      history: { push: jest.fn() },
    });

  it("prefills the form and locks it for a url document", async () => {
    grantAccess();
    mockParams = { dsDfId: "DS1", docObjectIds: "DOC2" };
    dispatchResults.GET_ALL_DOCS = {
      documentList: [
        { ...linkDoc, docDisplayFilename: "http://example.com/table" },
      ],
    };
    renderPage(urlEditProps());

    expect(
      await screen.findByText("http://example.com/portal")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Add URL")).toBeChecked();
    expect(screen.getByLabelText("Add URL")).toBeDisabled();
    expect(screen.getByLabelText("Name")).toHaveValue("Portal link");
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByLabelText("Description")).toHaveValue("A url document");
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("keeps the existing url when replace is cancelled", async () => {
    grantAccess();
    mockParams = { dsDfId: "DS1", docObjectIds: "DOC2" };
    imperativeConfirm.mockResolvedValue(false);
    dispatchResults.GET_ALL_DOCS = {
      documentList: [
        { ...linkDoc, docDisplayFilename: "http://example.com/table" },
      ],
    };
    renderPage(urlEditProps());

    fireEvent.click(await screen.findByText("http://example.com/portal"));
    await waitFor(() => expect(imperativeConfirm).toHaveBeenCalled());
    expect(screen.getByText("http://example.com/portal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("updates a url document after replacing the existing link", async () => {
    grantAccess();
    mockParams = { dsDfId: "DS1", docObjectIds: "DOC2" };
    imperativeConfirm.mockResolvedValue(true);
    dispatchResults.GET_ALL_DOCS = {
      documentList: [
        { ...linkDoc, docDisplayFilename: "http://example.com/table" },
      ],
    };
    dispatchResults.SUBMIT_DOC = { statusMessage: "OK" };
    renderPage(urlEditProps());

    fireEvent.click(await screen.findByText("http://example.com/portal"));

    const urlInput = await screen.findByPlaceholderText("Add URL");
    expect(urlInput).toHaveValue("http://example.com/portal");
    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com/new" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        " The File/Link has been successfully updated!"
      )
    );
    const [payload, docObjectIds] =
      startSubmittingDocumentsOrUrl.mock.calls[0];
    expect(docObjectIds).toBe("DOC2");
    expect(payload.docObj.newUrl).toBe("https://www.example.com/new");
    expect(payload.docObj.docDid).toBe("DOC2");
    expect(payload.docObj.docObjectId).toBe("DS1");
  });

  it("shows an error toast when a url update fails", async () => {
    grantAccess();
    mockParams = { dsDfId: "DS1", docObjectIds: "DOC2" };
    imperativeConfirm.mockResolvedValue(true);
    dispatchResults.GET_ALL_DOCS = {
      documentList: [
        { ...linkDoc, docDisplayFilename: "http://example.com/table" },
      ],
    };
    dispatchResults.SUBMIT_DOC = { message: "update failed" };
    renderPage(urlEditProps());

    fireEvent.click(await screen.findByText("http://example.com/portal"));
    const urlInput = await screen.findByPlaceholderText("Add URL");
    fireEvent.change(urlInput, {
      target: { value: "https://www.example.com/new" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "File/Link not updated due to: update failed"
      )
    );
  });

  it("prefills a file document and updates it with a replacement file", async () => {
    grantAccess();
    mockParams = { dsDfId: "DS1", docObjectIds: "DOC1" };
    imperativeConfirm.mockResolvedValue(true);
    dispatchResults.GET_ALL_DOCS = {
      documentList: [{ ...fileDoc, docDisplayFilename: "table-copy.pdf" }],
    };
    dispatchResults.SUBMIT_DOC = { statusMessage: "OK" };
    const { container } = renderPage(fileEditProps());

    // Existing file chip shown, radio stays on Add file, form locked.
    expect(await screen.findByText("spec.pdf")).toBeInTheDocument();
    expect(screen.getByLabelText("Add file")).toBeChecked();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    // Replace the existing file (confirm), then choose a new one.
    fireEvent.click(screen.getByText("spec.pdf"));
    await waitFor(() =>
      expect(screen.queryByText("spec.pdf")).not.toBeInTheDocument()
    );

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["new"], "replacement.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        " The File/Link has been successfully updated!"
      )
    );
    const [payload, docObjectIds] =
      startSubmittingDocumentsOrUrl.mock.calls[0];
    expect(docObjectIds).toBe("DOC1");
    expect(payload.file.name).toBe("replacement.pdf");
    expect(payload.docObj.docDisplayFilename).toBe("spec.pdf");
  });
});
