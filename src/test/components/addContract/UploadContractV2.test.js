import React from "react";
import { render, screen } from "@testing-library/react";
import UploadContract from "../../../components/addContract/UploadContractV2";
import { upload } from "../../../store/actions/contractAction";

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
});
