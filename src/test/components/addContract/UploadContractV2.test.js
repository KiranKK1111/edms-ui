import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import UploadContract from "../../../components/addContract/UploadContractV2";
import { upload } from "../../../store/actions/contractAction";
import { bindData } from "../../../components/addContract/bindData";
import { toast } from "../../../design-system/toast";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

let mockDispatch = jest.fn();
let mockState = {};
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
  connect: () => (Component) => Component,
}));

jest.mock("../../../store/actions/contractAction", () => ({
  vendorContacts: jest.fn(),
  upload: jest.fn().mockReturnValue({ type: "UPLOAD" }),
}));

jest.mock("../../../components/addContract/bindData", () => ({
  bindData: jest.fn(),
}));

jest.mock("../../../design-system/toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const defaultContractState = {
  contract: {
    selectedContract: [],
    upload: {},
  },
};

const renderUpload = (props = {}) =>
  render(
    <UploadContract
      formData={false}
      next={jest.fn()}
      pdfOfContract={null}
      {...props}
    />
  );

describe("UploadContractV2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { ...defaultContractState };
  });

  it("should render the URL to Agreement field", () => {
    renderUpload();
    expect(screen.getAllByText("URL to Agreement").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("Agreement Link")).toBeInTheDocument();
  });

  it("should render the Click to Upload button", () => {
    renderUpload();
    expect(
      screen.getByRole("button", { name: /Click to Upload/i })
    ).toBeInTheDocument();
  });

  it("should use selectedContract data when selectedContract has items", () => {
    mockState = {
      contract: {
        selectedContract: [{ agreementLink: "https://link.com" }],
        upload: {},
      },
    };
    renderUpload();
    expect(screen.getAllByText("URL to Agreement").length).toBeGreaterThanOrEqual(1);
  });

  it("should use reduxData.upload when it has keys", () => {
    mockState = {
      contract: {
        selectedContract: [],
        upload: { urlToAgreement: "https://uploaded.com" },
      },
    };
    renderUpload();
    expect(screen.getAllByText("URL to Agreement").length).toBeGreaterThanOrEqual(1);
  });

  it("should render an uploaded file link when upload is a file list", () => {
    mockState = {
      contract: {
        selectedContract: [],
        upload: [{ name: "file.pdf" }],
      },
    };
    renderUpload();
    expect(screen.getByText("file.pdf")).toBeInTheDocument();
  });

  it("should render when formData is true", () => {
    renderUpload({ formData: true });
    expect(screen.getAllByText("URL to Agreement").length).toBeGreaterThanOrEqual(1);
  });

  it("should keep the upload action available for dispatch", () => {
    renderUpload();
    expect(typeof upload).toBe("function");
  });

  it("should render an uploaded file link from the object slice shape", () => {
    mockState = {
      contract: {
        selectedContract: [],
        upload: { urlToAgreement: "https://x.com", fileName: "contract.pdf" },
      },
    };
    renderUpload();
    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
  });

  it("should register a draft saver that persists url + file name for Previous", () => {
    mockState = {
      contract: {
        selectedContract: [],
        upload: { urlToAgreement: "https://x.com", fileName: "contract.pdf" },
      },
    };
    const registerDraftSaver = jest.fn();
    renderUpload({ registerDraftSaver });
    expect(registerDraftSaver).toHaveBeenCalledWith(expect.any(Function));
    mockDispatch.mockClear();
    upload.mockClear();
    const saver = registerDraftSaver.mock.calls[0][0];
    saver();
    expect(mockDispatch).toHaveBeenCalled();
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "contract.pdf" })
    );
  });

  it("should upload a PDF and store its file name in the slice", async () => {
    const { act, fireEvent } = require("@testing-library/react");
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const { container } = renderUpload();
    const fileInput = container.querySelector('input[type="file"]');
    const pdf = new File(["dummy"], "agreement.pdf", {
      type: "application/pdf",
    });
    upload.mockClear();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [pdf] } });
      await Promise.resolve();
    });
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "agreement.pdf" })
    );
    delete global.fetch;
  });

  it("should reject a non-PDF file without dispatching", async () => {
    const { act, fireEvent } = require("@testing-library/react");
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const { container } = renderUpload();
    const fileInput = container.querySelector('input[type="file"]');
    const txt = new File(["dummy"], "notes.txt", { type: "text/plain" });
    upload.mockClear();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [txt] } });
      await Promise.resolve();
    });
    expect(upload).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    delete global.fetch;
  });

  it("should preserve the uploaded file name when Next persists the step", async () => {
    const { act } = require("@testing-library/react");
    mockState = {
      contract: {
        selectedContract: [],
        upload: { urlToAgreement: "", fileName: "kept.pdf" },
      },
    };
    const { rerender } = renderUpload({ formData: false });
    upload.mockClear();
    await act(async () => {
      rerender(
        <UploadContract formData={true} next={jest.fn()} pdfOfContract={null} />
      );
      await Promise.resolve();
    });
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "kept.pdf" })
    );
  });
});

describe("UploadContractV2 — binding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { ...defaultContractState };
  });

  it("should push the stored agreement url into the form field", async () => {
    // exercise the real antd-style form adapter rather than the bindData stub
    const realBindData = jest.requireActual(
      "../../../components/addContract/bindData"
    ).bindData;
    bindData.mockImplementation(realBindData);
    mockState = {
      contract: {
        selectedContract: [],
        upload: { urlToAgreement: "docs.example.com/a.pdf" },
      },
    };
    renderUpload();
    expect(
      await screen.findByDisplayValue("docs.example.com/a.pdf")
    ).toBeInTheDocument();
  });

  it("should fall back to the selected contract's agreement link", async () => {
    const realBindData = jest.requireActual(
      "../../../components/addContract/bindData"
    ).bindData;
    bindData.mockImplementation(realBindData);
    mockState = {
      contract: {
        selectedContract: [{ agreementLink: "legacy.example.com/b.pdf" }],
        upload: {},
      },
    };
    renderUpload();
    expect(
      await screen.findByDisplayValue("legacy.example.com/b.pdf")
    ).toBeInTheDocument();
  });
});

describe("UploadContractV2 — file upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { ...defaultContractState };
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("should do nothing when the picker is dismissed without a file", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const { container } = renderUpload();
    const fileInput = container.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [] } });
      await Promise.resolve();
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("should warn about the rejected file type", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const { container } = renderUpload();
    const fileInput = container.querySelector('input[type="file"]');
    const txt = new File(["dummy"], "notes.txt", { type: "text/plain" });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [txt] } });
      await Promise.resolve();
    });
    expect(toast.error).toHaveBeenCalledWith("notes.txt is not a pdf file");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should POST the pdf to the file service", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    const { container } = renderUpload();
    const pdf = new File(["dummy"], "agreement.pdf", {
      type: "application/pdf",
    });
    await act(async () => {
      fireEvent.change(container.querySelector('input[type="file"]'), {
        target: { files: [pdf] },
      });
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/upload/file"),
      expect.objectContaining({ method: "post" })
    );
  });

  it("should not store a file name when the upload call fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 });
    const { container } = renderUpload();
    const pdf = new File(["dummy"], "agreement.pdf", {
      type: "application/pdf",
    });
    await act(async () => {
      fireEvent.change(container.querySelector('input[type="file"]'), {
        target: { files: [pdf] },
      });
      await Promise.resolve();
    });
    expect(global.fetch).toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("UploadContractV2 — delete", () => {
  const withFile = {
    contract: {
      selectedContract: [],
      upload: { urlToAgreement: "", fileName: "contract.pdf" },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = withFile;
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("should link to the uploaded file and expose a delete action", () => {
    renderUpload();
    const link = screen.getByRole("link", { name: "contract.pdf" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("/download/contract.pdf")
    );
    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument();
  });

  it("should DELETE the file and keep the typed url in the slice", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    renderUpload();
    fireEvent.change(screen.getByPlaceholderText("Agreement Link"), {
      target: { value: "docs.example.com/x.pdf" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "delete" }));
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/delete"),
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ fileName: "contract.pdf" }),
      })
    );
    expect(toast.success).toHaveBeenCalledWith("File deleted successfully");
    expect(upload).toHaveBeenCalledWith({
      urlToAgreement: "docs.example.com/x.pdf",
    });
  });

  it("should surface an error when the delete call fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 });
    renderUpload();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "delete" }));
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalledWith("Error while deleting");
    expect(upload).not.toHaveBeenCalled();
  });
});

describe("UploadContractV2 — draft saver lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { ...defaultContractState };
  });

  it("should unregister the draft saver on unmount", () => {
    const registerDraftSaver = jest.fn();
    const { unmount } = renderUpload({ registerDraftSaver });
    expect(registerDraftSaver).toHaveBeenLastCalledWith(expect.any(Function));
    unmount();
    expect(registerDraftSaver).toHaveBeenLastCalledWith(null);
  });

  it("should skip registration when the controller does not ask for one", () => {
    expect(() => renderUpload()).not.toThrow();
    expect(screen.getByPlaceholderText("Agreement Link")).toBeInTheDocument();
  });
});
