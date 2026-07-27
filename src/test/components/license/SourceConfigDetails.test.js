import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import SourceConfigDetails from "../../../components/license/TechnicalDetails/SourceConfigDetails";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDataProtocolById = jest.fn();
const mockApiRequestParamsAllData = jest.fn();
const mockApiSourceConfigAllData = jest.fn();
const mockFileFormatDatabase = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
}));

jest.mock("../../../store/actions/SourceConfigActions", () => ({
  dataProtocolById: (...args) => mockDataProtocolById(...args),
  apiRequestParamsAllData: (...args) => mockApiRequestParamsAllData(...args),
  apiSourceConfigAllData: (...args) => mockApiSourceConfigAllData(...args),
  fileFormatDatabase: (...args) => mockFileFormatDatabase(...args),
}));

const renderConfig = () =>
  render(
    <AppProviders>
      <SourceConfigDetails />
    </AppProviders>
  );

describe("SourceConfigDetails", () => {
  beforeEach(() => {
    mockDataProtocolById.mockResolvedValue({ data: {} });
    mockApiRequestParamsAllData.mockResolvedValue({ data: { apiRequestParams: [] } });
    mockApiSourceConfigAllData.mockResolvedValue({ data: { apiResponseConfig: [] } });
    mockFileFormatDatabase.mockResolvedValue({ data: { fileFormatConfig: [] } });
  });

  it("should render the Data Protocol heading", () => {
    renderConfig();
    expect(screen.getByText("Data Protocol")).toBeInTheDocument();
  });

  it("should render the Ftp & Sftp and Api dividers", () => {
    renderConfig();
    expect(screen.getByText("Ftp & Sftp")).toBeInTheDocument();
    expect(screen.getByText("Api")).toBeInTheDocument();
  });

  it("should render the review-submit container", () => {
    const { container } = renderConfig();
    expect(container.querySelector(".review-submit")).toBeInTheDocument();
  });

  it("should call all four data fetching actions on mount", async () => {
    renderConfig();
    await waitFor(() => expect(mockDataProtocolById).toHaveBeenCalled());
    expect(mockApiRequestParamsAllData).toHaveBeenCalled();
    expect(mockApiSourceConfigAllData).toHaveBeenCalled();
    expect(mockFileFormatDatabase).toHaveBeenCalled();
  });

  it("should render protocol fields when protocol data is returned", async () => {
    mockDataProtocolById.mockResolvedValue({
      data: {
        licenseId: "123",
        protocol: "FTP",
        ftpHost: "ftp.example.com",
        useCaseName: "TestUseCase",
      },
    });
    renderConfig();
    expect(await screen.findByText("ftp.example.com")).toBeInTheDocument();
  });

  it("should render the API Request Params table when matching data is present", async () => {
    mockApiRequestParamsAllData.mockResolvedValue({
      data: {
        apiRequestParams: [
          {
            licenseId: "123",
            paramType: "header,query",
            parameter: "Authorization,page",
            rank: "1,2",
            value: "Bearer token,1",
          },
        ],
      },
    });
    renderConfig();
    expect(await screen.findByText("API Request Params")).toBeInTheDocument();
  });

  it("should render the API Response Config table when matching data is present", async () => {
    mockApiSourceConfigAllData.mockResolvedValue({
      data: {
        apiResponseConfig: [
          {
            licenseId: "123",
            data: "success,error",
            httpStatusCode: "200,500",
            error: "none,server error",
            errorMessage: "N/A,Internal Server Error",
            nextAction: "proceed,retry",
          },
        ],
      },
    });
    renderConfig();
    expect(await screen.findByText("API Response Config")).toBeInTheDocument();
  });
});
