import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import Dataset from "../../../components/license/dataset/Dataset";
import { dataset as datasetAction } from "../../../store/actions/licensedataAction";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

let mockParams = {};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockParams,
}));

jest.mock("../../../store/actions/licensedataAction", () => ({
  dataset: jest.fn(),
}));

const buildState = () => ({
  license: { selectedLicense: "" },
  licenseReq: { dataset: [] },
});

const renderDataset = (props = {}) =>
  render(
    <AppProviders>
      <Dataset
        handleChange={jest.fn()}
        handleInformationSecurityRating={jest.fn()}
        next={jest.fn()}
        {...props}
      />
    </AppProviders>
  );

describe("Dataset", () => {
  beforeEach(() => {
    mockState = buildState();
    mockParams = {};
  });

  it("should render the personal data field", () => {
    renderDataset();
    expect(
      screen.getByText("Dataset contains Personal Data")
    ).toBeInTheDocument();
  });

  it("should render the information security rating field", () => {
    renderDataset();
    expect(
      screen.getAllByText("Information Security Rating").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("should render the data validity and metadata fields", () => {
    renderDataset();
    expect(screen.getByText("Data Validity")).toBeInTheDocument();
    expect(screen.getByText("Metadata Available")).toBeInTheDocument();
    expect(screen.getByText("Metadata Viewing Permission")).toBeInTheDocument();
  });

  it("should render Yes/No radio options", () => {
    renderDataset();
    expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(1);
  });

  it("should default every radio group to Yes when creating a licence", () => {
    renderDataset();
    screen
      .getAllByRole("radio", { name: "Yes" })
      .forEach((radio) => expect(radio).toBeChecked());
  });
});

describe("Dataset — binding existing data", () => {
  beforeEach(() => {
    mockState = buildState();
    mockParams = {};
  });

  const record = {
    personalData: "No",
    dataValidity: "YES",
    metaData: "No",
    metaDataViewPermission: "Yes",
    securityRating: "C3-Confidential data",
  };

  it("should bind the record held on the licence requirements slice", async () => {
    mockState = {
      license: { selectedLicense: "" },
      licenseReq: { dataset: [record] },
    };
    mockParams = { id: "LIC-1" };
    renderDataset();

    await waitFor(() =>
      expect(screen.getByText("Confidential data")).toBeInTheDocument()
    );
    // bindData lowercases the yes/no answers so the radios match the options
    const noRadios = screen.getAllByRole("radio", { name: "No" });
    expect(noRadios[0]).toBeChecked();
  });

  it("should fall back to the selected licence when the requirements slice is empty", async () => {
    mockState = {
      license: {
        selectedLicense: [{ ...record, securityRating: "C1-Public data" }],
      },
      licenseReq: { dataset: [] },
    };
    mockParams = { id: "LIC-1" };
    renderDataset();

    await waitFor(() =>
      expect(screen.getByText("Public data")).toBeInTheDocument()
    );
  });

  it("should tolerate a record without a security rating", async () => {
    mockState = {
      license: { selectedLicense: "" },
      licenseReq: { dataset: [{ personalData: "No" }] },
    };
    mockParams = { id: "LIC-1" };
    renderDataset();

    await waitFor(() =>
      expect(screen.getAllByRole("radio", { name: "No" })[0]).toBeChecked()
    );
  });

  it("should reset to the defaults when there is nothing to bind", () => {
    mockState = {
      license: { selectedLicense: "" },
      licenseReq: { dataset: [] },
    };
    mockParams = { id: "LIC-1" };
    renderDataset();
    screen
      .getAllByRole("radio", { name: "Yes" })
      .forEach((radio) => expect(radio).toBeChecked());
  });
});

describe("Dataset — change handlers", () => {
  beforeEach(() => {
    mockState = buildState();
    mockParams = {};
  });

  it("should report radio changes back to the parent in the antd event shape", () => {
    const handleChange = jest.fn();
    renderDataset({ handleChange });

    const noRadios = screen.getAllByRole("radio", { name: "No" });
    fireEvent.click(noRadios[0]);
    expect(handleChange).toHaveBeenLastCalledWith({
      target: { name: "personalData", value: "no" },
    });

    fireEvent.click(noRadios[1]);
    expect(handleChange).toHaveBeenLastCalledWith({
      target: { name: "dataValidity", value: "no" },
    });

    fireEvent.click(noRadios[2]);
    expect(handleChange).toHaveBeenLastCalledWith({
      target: { name: "metaData", value: "no" },
    });

    fireEvent.click(noRadios[3]);
    expect(handleChange).toHaveBeenLastCalledWith({
      target: { name: "metaDataViewPermission", value: "no" },
    });
  });

  it("should report the chosen security rating to the parent", async () => {
    const handleInformationSecurityRating = jest.fn();
    renderDataset({ handleInformationSecurityRating });

    fireEvent.mouseDown(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByText("Restricted data"));

    expect(handleInformationSecurityRating).toHaveBeenCalledWith(
      "C4-Restrcited data"
    );
  });
});

describe("Dataset — submission", () => {
  beforeEach(() => {
    mockState = buildState();
    mockParams = {};
  });

  const renderWithSubmit = (next) => {
    const utils = render(
      <AppProviders>
        <Dataset
          handleChange={jest.fn()}
          handleInformationSecurityRating={jest.fn()}
          next={next}
          formData={false}
        />
      </AppProviders>
    );
    return {
      ...utils,
      submit: () =>
        utils.rerender(
          <AppProviders>
            <Dataset
              handleChange={jest.fn()}
              handleInformationSecurityRating={jest.fn()}
              next={next}
              formData={true}
            />
          </AppProviders>
        ),
    };
  };

  it("should persist the answers and advance once the form validates", async () => {
    mockState = {
      license: { selectedLicense: "" },
      licenseReq: {
        dataset: [
          {
            personalData: "No",
            dataValidity: "Yes",
            metaData: "No",
            metaDataViewPermission: "Yes",
            securityRating: "C2-Internal data",
          },
        ],
      },
    };
    mockParams = { id: "LIC-1" };
    const next = jest.fn();
    const { submit } = renderWithSubmit(next);
    await waitFor(() =>
      expect(screen.getByText("Internal data")).toBeInTheDocument()
    );

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(mockDispatch).toHaveBeenCalled();
    expect(datasetAction).toHaveBeenCalledWith([
      {
        personalData: "no",
        securityRating: "C2-Internal data",
        dataValidity: "yes",
        metaData: "no",
        metaDataViewPermission: "yes",
      },
    ]);
    expect(next).toHaveBeenCalledWith(false);
  });

  it("should block submission while the security rating is missing", async () => {
    const next = jest.fn();
    const { submit } = renderWithSubmit(next);

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(false));
    expect(
      await screen.findByText("Information Security Rating is mandatory !")
    ).toBeInTheDocument();
    expect(datasetAction).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(true);
  });
});
