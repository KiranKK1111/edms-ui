import React from "react";
import * as redux from "react-redux";
import { render, screen, act } from "@testing-library/react";
import ApiConfiguration from "../../../components/addConfiguration/ApiConfiguration";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const defaultConfigValues = {};
const setupSelector = (configValues = defaultConfigValues) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

const renderCfg = (props = {}) =>
  render(<ApiConfiguration next={jest.fn()} {...props} />);

describe("ApiConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSelector();
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
});
