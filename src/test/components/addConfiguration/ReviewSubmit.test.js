import React from "react";
import * as redux from "react-redux";
import { render, screen } from "@testing-library/react";
import ReviewSubmit from "../../../components/addConfiguration/ReviewSubmit";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));
jest.mock("react-router-dom/cjs/react-router-dom.min", () => ({
  useLocation: () => ({
    pathname: "/masterData/DF2025224459333400/addConfiguration",
    state: { isUpdate: true },
    search: "",
    hash: "",
    key: "dcvlbu",
  }),
}));

const setupSelector = (configValues = {}, loadingConfig = false) => {
  const state = {
    datafeedInfo: {
      congigUi: configValues,
      loadingConfig: loadingConfig,
    },
  };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

describe("ReviewSubmit (Configuration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("currentUserRole", "Dataset Delegate");
    setupSelector({ proxyRequirement: "No" });
  });

  it("should render the review-submit wrapper", () => {
    const { container } = render(<ReviewSubmit />);
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should render the Main Configuration, Proxy and Vendor headers", () => {
    render(<ReviewSubmit />);
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
    expect(screen.getByText("Proxy")).toBeInTheDocument();
    expect(screen.getByText("On-Demand Vendor request")).toBeInTheDocument();
  });

  it("should render the Splitting Configuration section when applicable", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "No",
      schemaId: "NA",
      dataFeedType: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute",
      schemaDataObj: { name: "data.json" },
      schemaMetaDataObj: { name: "meta.json" },
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("Splitting Configuration")).toBeInTheDocument();
  });

  it("should not render Splitting Configuration when not applicable", () => {
    setupSelector({ proxyRequirement: "No", splittingRequirement: "No" });
    render(<ReviewSubmit />);
    expect(screen.queryByText("Splitting Configuration")).not.toBeInTheDocument();
  });

  it("should render Request and Authentication details for HTTPS API config", () => {
    setupSelector({
      proxyRequirement: "No",
      sourceProtocol: "HTTPS",
      tokenReq: "Yes",
      tokenURL: "https://example.com/token",
      username: "user",
      passwordProperty: "pass",
      requestMethod: "POST",
      requestBodyObj: { name: "body.txt" },
      requestHeaders: "headers",
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("Request Details")).toBeInTheDocument();
    expect(screen.getByText("Authentication Details")).toBeInTheDocument();
  });

  it("should render the Historic Load section when histLoad is Yes", () => {
    setupSelector({
      proxyRequirement: "No",
      histLoad: "Yes",
      historyLoadDetailsID: "HIST001",
      historicLoadStartDate: "2025-01-01",
      listOfFiles: "file1.csv,file2.csv",
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("Historic Load")).toBeInTheDocument();
  });

  it("should render with Data Operations role", () => {
    localStorage.setItem("currentUserRole", "Data Operations");
    setupSelector({});
    const { container } = render(<ReviewSubmit />);
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should render requestBodyFileName as a chip when HTTPS and fileName is set", () => {
    setupSelector({
      proxyRequirement: "No",
      sourceProtocol: "HTTPS",
      tokenReq: "No",
      requestBodyFileName: "payload.json",
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("payload.json")).toBeInTheDocument();
  });

  it("should render inline requestBody in a pre block when no fileName is set", () => {
    setupSelector({
      proxyRequirement: "No",
      sourceProtocol: "HTTPS",
      tokenReq: "No",
      requestBody: '{"key":"value"}',
    });
    render(<ReviewSubmit />);
    expect(screen.getByText('{"key":"value"}')).toBeInTheDocument();
  });

  it("should display Yes for vendorRequestConfig Y", () => {
    setupSelector({
      proxyRequirement: "No",
      vendorRequestConfig: "Y",
    });
    render(<ReviewSubmit />);
    const yesItems = screen.getAllByText("Yes");
    expect(yesItems.length).toBeGreaterThan(0);
  });

  it("should display json data feed type text", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "Yes",
      schemaId: "schema-1",
      dataFeedType: "json",
      schemaDataObj: { name: "data.json" },
      schemaMetaDataObj: { name: "meta.json" },
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("json")).toBeInTheDocument();
  });

  it("should display xpath data feed type text", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "Yes",
      schemaId: "schema-2",
      dataFeedType: "xpath",
      schemaDataObj: { name: "data.xml" },
      schemaMetaDataObj: { name: "meta.xml" },
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("xpath")).toBeInTheDocument();
  });

  it("should display csv data feed type text for unknown type", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "Yes",
      schemaId: "schema-3",
      dataFeedType: "csv",
      schemaDataObj: { name: "data.csv" },
      schemaMetaDataObj: { name: "meta.csv" },
    });
    render(<ReviewSubmit />);
    expect(screen.getByText("csv")).toBeInTheDocument();
  });

  it("should show empty schemaId when exitingSchema is No", () => {
    setupSelector({
      proxyRequirement: "No",
      splittingRequirement: "Yes",
      exitingSchema: "No",
      schemaId: "should-not-appear",
      dataFeedType: "xml",
      schemaDataObj: { name: "data.json" },
      schemaMetaDataObj: { name: "meta.json" },
    });
    render(<ReviewSubmit />);
    expect(screen.queryByText("should-not-appear")).not.toBeInTheDocument();
  });
});
