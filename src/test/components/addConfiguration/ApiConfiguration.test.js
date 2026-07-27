import React from "react";
import * as redux from "react-redux";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import ApiConfiguration from "../../../components/addConfiguration/ApiConfiguration";
import imperativeConfirm from "../../../design-system/imperativeConfirm";
import { toast } from "../../../design-system/toast";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));
jest.mock("../../../design-system/imperativeConfirm", () => jest.fn());
jest.mock("../../../design-system/toast", () => {
  const api = {
    open: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn(),
  };
  return { __esModule: true, toast: api, default: api };
});

const defaultConfigValues = {};
const setupSelector = (configValues = defaultConfigValues) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const renderCfg = (props = {}) =>
  render(<ApiConfiguration next={jest.fn()} {...props} />);

const selectRequestBodyFile = async (container, file) => {
  const fileInput = container.querySelector('input[type="file"]');
  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
  });
};

describe("ApiConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
    imperativeConfirm.mockResolvedValue(false);
  });

  it("should render the Request Details and Authentication Details headers", () => {
    renderCfg();
    expect(screen.getByText("Request Details")).toBeInTheDocument();
    expect(screen.getByText("Authentication Details")).toBeInTheDocument();
  });

  it("should render the request method radio options (GET / POST)", () => {
    renderCfg();
    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("POST")).toBeInTheDocument();
  });

  it("should render the token requirement radio options (Yes / No)", () => {
    renderCfg();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("should render the request field labels", () => {
    renderCfg();
    expect(screen.getByText("Request method")).toBeInTheDocument();
    expect(screen.getByText("Request parameters")).toBeInTheDocument();
    expect(screen.getByText("Request headers")).toBeInTheDocument();
  });

  it("should render the Click to Upload control for the request body", () => {
    renderCfg();
    expect(
      screen.getByRole("button", { name: /Upload JSON \/ Text file/i })
    ).toBeInTheDocument();
  });

  it("should render with configValues from redux", () => {
    setupSelector({
      requestMethod: "GET",
      tokenReq: "No",
      requestHeaders: "Content-Type: application/json",
    });
    renderCfg();
    expect(screen.getByText("Request Details")).toBeInTheDocument();
  });

  it("should render token authentication fields when tokenReq is Yes", () => {
    setupSelector({
      requestMethod: "POST",
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      username: "user1",
      passwordProperty: "pass1",
    });
    renderCfg();
    expect(screen.getByText("Token URL")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Password property")).toBeInTheDocument();
  });

  it("should render new token auth fields (grant type, token response key, token prefix, content type) when tokenReq is Yes", () => {
    setupSelector({ requestMethod: "POST", tokenReq: "Yes" });
    renderCfg();
    expect(screen.getByText("Grant type")).toBeInTheDocument();
    expect(screen.getByText("Token response key")).toBeInTheDocument();
    expect(screen.getByText("Token prefix")).toBeInTheDocument();
    expect(screen.getByText("Content type")).toBeInTheDocument();
  });

  it("should render auth request body field when tokenReq is Yes", () => {
    setupSelector({ requestMethod: "POST", tokenReq: "Yes" });
    renderCfg();
    // Two 'Request body' labels exist: one in Request Details, one in Auth Details
    const requestBodyLabels = screen.getAllByText("Request body");
    expect(requestBodyLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("should display filename chip when requestBodyFileName is in configValues", () => {
    setupSelector({
      requestBodyObj: { name: "payload.json" },
      requestBodyFileName: "payload.json",
      requestMethod: "POST",
      tokenReq: "No",
    });
    renderCfg();
    expect(screen.getByText("payload.json")).toBeInTheDocument();
  });

  it("should disable the upload button when a file is already loaded", () => {
    setupSelector({
      requestBodyObj: { name: "body.json" },
      requestBodyFileName: "body.json",
      requestMethod: "POST",
      tokenReq: "No",
    });
    renderCfg();
    const uploadBtn = screen.getByRole("button", { name: /Upload JSON \/ Text file/i });
    expect(uploadBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("should call dispatch when formData triggers onFinish", async () => {
    const { rerender } = renderCfg({ formData: false });
    await act(async () => {
      rerender(<ApiConfiguration next={jest.fn()} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should read an uploaded .json file into the request body field", async () => {
    const { container } = renderCfg();
    const file = new File(['{"a":1}'], "payload.json", {
      type: "application/json",
    });
    await selectRequestBodyFile(container, file);
    await waitFor(() =>
      expect(screen.getByText("payload.json")).toBeInTheDocument()
    );
    const bodyField = container.querySelector(
      'textarea[name="requestBody"]'
    );
    await waitFor(() => expect(bodyField).toHaveValue('{"a":1}'));
    // upload button now disabled since a file's content is loaded
    expect(
      screen.getByRole("button", { name: /Upload JSON \/ Text file/i })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("should accept a .txt upload for the request body", async () => {
    const { container } = renderCfg();
    const file = new File(["plain text body"], "body.txt", {
      type: "text/plain",
    });
    await selectRequestBodyFile(container, file);
    await waitFor(() =>
      expect(screen.getByText("body.txt")).toBeInTheDocument()
    );
  });

  it("should reject an upload with an invalid extension", async () => {
    const { container } = renderCfg();
    const file = new File(["%PDF"], "document.pdf", {
      type: "application/pdf",
    });
    await selectRequestBodyFile(container, file);
    expect(toast.error).toHaveBeenCalledWith(
      "Please upload a .json or .txt file."
    );
    expect(screen.queryByText("document.pdf")).not.toBeInTheDocument();
  });

  it("should ignore an empty file selection", async () => {
    const { container } = renderCfg();
    const fileInput = container.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [] } });
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should clear the uploaded file when replace is confirmed", async () => {
    imperativeConfirm.mockResolvedValue(true);
    const { container } = renderCfg();
    await selectRequestBodyFile(
      container,
      new File(['{"a":1}'], "payload.json", { type: "application/json" })
    );
    await waitFor(() =>
      expect(screen.getByText("payload.json")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("payload.json"));
    await waitFor(() =>
      expect(screen.queryByText("payload.json")).not.toBeInTheDocument()
    );
    expect(imperativeConfirm).toHaveBeenCalled();
    const bodyField = container.querySelector('textarea[name="requestBody"]');
    expect(bodyField).toHaveValue("");
  });

  it("should keep the uploaded file when replace is cancelled", async () => {
    imperativeConfirm.mockResolvedValue(false);
    const { container } = renderCfg();
    await selectRequestBodyFile(
      container,
      new File(['{"a":1}'], "payload.json", { type: "application/json" })
    );
    await waitFor(() =>
      expect(screen.getByText("payload.json")).toBeInTheDocument()
    );
    await act(async () => {
      fireEvent.click(screen.getByText("payload.json"));
    });
    expect(imperativeConfirm).toHaveBeenCalled();
    expect(screen.getByText("payload.json")).toBeInTheDocument();
  });

  it("should update request method via the radio handler", async () => {
    renderCfg();
    const getRadio = screen.getByRole("radio", { name: "GET" });
    await act(async () => {
      fireEvent.click(getRadio);
    });
    expect(getRadio).toBeChecked();
  });

  it("should reveal token auth fields when token requirement is switched to Yes", async () => {
    renderCfg();
    expect(screen.queryByText("Token URL")).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    });
    expect(screen.getByText("Token URL")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "No" }));
    });
    expect(screen.queryByText("Token URL")).not.toBeInTheDocument();
  });

  it("should blank token fields on submit when tokenReq is No", async () => {
    setupSelector({
      requestMethod: "POST",
      tokenReq: "No",
      tokenURL: "https://example.com/token",
      userName: "user1",
      passwordProperty: "secret",
      requestBody: "",
    });
    const next = jest.fn();
    const { rerender } = render(
      <ApiConfiguration next={next} formData={false} />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(<ApiConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        tokenURL: "",
        userName: "",
        passwordProperty: "",
        contentType: "",
        requestBodyAuth: "",
        tokenResponseKey: "",
        tokenPrefix: "",
      })
    );
  });

  it("should keep token fields on submit when tokenReq is Yes", async () => {
    setupSelector({
      requestMethod: "POST",
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      userName: "user1",
      requestBody: "",
    });
    const next = jest.fn();
    const { rerender } = render(
      <ApiConfiguration next={next} formData={false} />
    );
    await act(async () => {
      rerender(<ApiConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        tokenURL: "https://example.com/token",
        userName: "user1",
      })
    );
  });

  it("should fail validation and not advance when the token URL is invalid", async () => {
    setupSelector({
      requestMethod: "POST",
      tokenReq: "Yes",
      tokenURL: "notaurl",
      requestBody: "",
    });
    const next = jest.fn();
    const { rerender } = render(
      <ApiConfiguration next={next} formData={false} />
    );
    await act(async () => {
      rerender(<ApiConfiguration next={next} formData={true} />);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
    expect(
      await screen.findByText("Not a valid Token URL")
    ).toBeInTheDocument();
  });

  it("should persist a draft (no validation) and navigate back when prevData flips true", async () => {
    const previous = jest.fn();
    const { rerender } = render(
      <ApiConfiguration next={jest.fn()} previous={previous} prevData={false} />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(
        <ApiConfiguration next={jest.fn()} previous={previous} prevData={true} />
      );
      await Promise.resolve();
    });
    // Draft saved to redux…
    expect(mockDispatch).toHaveBeenCalled();
    // …and the step reports back so the wizard moves to the previous step.
    expect(previous).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should keep existing configValues in the draft saved on Previous", async () => {
    setupSelector({ sourceProtocol: "HTTPS", cronScheduler: "0 0 12 * * ?" });
    const previous = jest.fn();
    const { rerender } = render(
      <ApiConfiguration next={jest.fn()} previous={previous} prevData={false} />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(
        <ApiConfiguration next={jest.fn()} previous={previous} prevData={true} />
      );
      await Promise.resolve();
    });
    const dispatched = mockDispatch.mock.calls[0][0];
    expect(dispatched.payload).toEqual(
      expect.objectContaining({ sourceProtocol: "HTTPS" })
    );
  });

  it("should include the uploaded file details in the draft saved on Previous", async () => {
    const previous = jest.fn();
    const { rerender, container } = render(
      <ApiConfiguration next={jest.fn()} previous={previous} prevData={false} />
    );
    await selectRequestBodyFile(
      container,
      new File(['{"a":1}'], "draft.json", { type: "application/json" })
    );
    await waitFor(() =>
      expect(screen.getByText("draft.json")).toBeInTheDocument()
    );
    await act(async () => {
      rerender(
        <ApiConfiguration next={jest.fn()} previous={previous} prevData={true} />
      );
      await Promise.resolve();
    });
    expect(previous).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ requestBodyFileName: "draft.json" })
    );
  });
});
