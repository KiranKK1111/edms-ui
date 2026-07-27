import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppProviders } from "../../../design-system";
import DatasetDetails from "../../../components/datasetForm/DatasetDetails";
import { datasetInfo } from "../../../store/actions/datasetFormActions";

let mockState = {};
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: (cb) => cb(mockState),
  useDispatch: () => mockDispatch,
}));

let mockLocation = {
  pathname: "/example/path",
  state: { licence: { licenseId: "" } },
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockLocation,
}));

jest.mock("../../../store/actions/datasetFormActions", () => ({
  datasetInfo: jest.fn(),
}));

const buildState = () => ({
  dataset: {
    formData: [
      { datasetId: "", status: "", description: "", entityId: "", licenseId: "" },
    ],
    datasetInfo: [{ licenseId: "" }],
  },
});

const DEFAULT_LOCATION = {
  pathname: "/example/path",
  state: { licence: { licenseId: "" } },
};

const renderDetails = (props = {}) =>
  render(
    <AppProviders>
      <DatasetDetails next={jest.fn()} {...props} />
    </AppProviders>
  );

describe("DatasetDetails", () => {
  beforeEach(() => {
    mockState = buildState();
    mockLocation = { ...DEFAULT_LOCATION };
  });

  it("should render a form", () => {
    const { container } = renderDetails();
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should render the Long Name field", () => {
    renderDetails();
    expect(screen.getAllByText("Long Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Short Name field", () => {
    renderDetails();
    expect(screen.getAllByText("Short Name").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Description field", () => {
    renderDetails();
    expect(screen.getAllByText("Description").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the Dataset ID and Status fields", () => {
    renderDetails();
    expect(screen.getAllByText("Dataset ID").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
  });

  it("should flag a duplicate short name under the same licence on blur", async () => {
    const { fireEvent } = require("@testing-library/react");
    mockLocation = {
      pathname: "/example/path",
      state: { licence: { licenseId: "L1" } },
    };
    mockState = {
      dataset: {
        formData: {},
        datasetsInfo: [
          { licenseId: "L1", shortName: "Dup", longName: "DupLong" },
        ],
      },
    };
    renderDetails();
    const input = screen.getByPlaceholderText("Short Name");
    fireEvent.change(input, { target: { value: "Dup" } });
    fireEvent.blur(input);
    expect(
      await screen.findByText("Dataset name already exists under this Licence")
    ).toBeInTheDocument();
  });

  it("should not crash the duplicate check when router state is missing", () => {
    const { fireEvent } = require("@testing-library/react");
    mockLocation = { pathname: "/example/path", state: null };
    mockState = {
      dataset: {
        formData: {},
        datasetsInfo: [
          { licenseId: "L1", shortName: "Dup", longName: "DupLong" },
        ],
      },
    };
    renderDetails();
    const input = screen.getByPlaceholderText("Short Name");
    fireEvent.change(input, { target: { value: "Dup" } });
    expect(() => fireEvent.blur(input)).not.toThrow();
    expect(
      screen.queryByText("Dataset name already exists under this Licence")
    ).not.toBeInTheDocument();
  });
});

const DUP_MESSAGE = "Dataset name already exists under this Licence";

describe("DatasetDetails — duplicate name checks", () => {
  beforeEach(() => {
    mockState = buildState();
    mockLocation = { ...DEFAULT_LOCATION };
  });

  const withLicence = (datasetsInfo, formData = {}) => {
    mockLocation = {
      pathname: "/example/path",
      state: { licence: { licenseId: "L1" } },
    };
    mockState = { dataset: { formData, datasetsInfo } };
  };

  it("should flag a duplicate long name under the same licence on blur", async () => {
    withLicence([{ licenseId: "L1", shortName: "Dup", longName: "DupLong" }]);
    renderDetails();
    const input = screen.getByPlaceholderText("Long Name");
    fireEvent.change(input, { target: { value: "  DupLong  " } });
    fireEvent.blur(input);
    expect(await screen.findByText(DUP_MESSAGE)).toBeInTheDocument();
  });

  it("should clear the long name error once the value is unique", async () => {
    withLicence([{ licenseId: "L1", shortName: "Dup", longName: "DupLong" }]);
    renderDetails();
    const input = screen.getByPlaceholderText("Long Name");
    fireEvent.change(input, { target: { value: "DupLong" } });
    fireEvent.blur(input);
    expect(await screen.findByText(DUP_MESSAGE)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Unique Long Name" } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.queryByText(DUP_MESSAGE)).not.toBeInTheDocument()
    );
  });

  it("should ignore records belonging to a different licence", async () => {
    withLicence([{ licenseId: "OTHER", shortName: "Dup", longName: "DupLong" }]);
    renderDetails();
    const short = screen.getByPlaceholderText("Short Name");
    fireEvent.change(short, { target: { value: "Dup" } });
    fireEvent.blur(short);
    const long = screen.getByPlaceholderText("Long Name");
    fireEvent.change(long, { target: { value: "DupLong" } });
    fireEvent.blur(long);
    await waitFor(() =>
      expect(screen.queryByText(DUP_MESSAGE)).not.toBeInTheDocument()
    );
  });

  it("should short-circuit both checks when there are no datasets in the store", async () => {
    withLicence([]);
    renderDetails();
    const short = screen.getByPlaceholderText("Short Name");
    fireEvent.change(short, { target: { value: "Anything" } });
    fireEvent.blur(short);
    const long = screen.getByPlaceholderText("Long Name");
    fireEvent.change(long, { target: { value: "Anything" } });
    fireEvent.blur(long);
    await waitFor(() =>
      expect(screen.queryByText(DUP_MESSAGE)).not.toBeInTheDocument()
    );
  });

  it("should fall back to the licenceId on the bound form data when router state has no licence", async () => {
    mockLocation = { pathname: "/example/path", state: {} };
    mockState = {
      dataset: {
        formData: { licenseId: "L1" },
        datasetsInfo: [
          { licenseId: "L1", shortName: "Dup", longName: "DupLong" },
        ],
      },
    };
    renderDetails();
    const input = screen.getByPlaceholderText("Short Name");
    fireEvent.change(input, { target: { value: "Dup" } });
    fireEvent.blur(input);
    expect(await screen.findByText(DUP_MESSAGE)).toBeInTheDocument();
  });

  it("should not flag the record's own name while editing it", async () => {
    mockLocation = { pathname: "/example/path", state: {} };
    mockState = {
      dataset: {
        formData: {
          datasetId: "DS-1",
          licenseId: "L1",
          shortName: "Dup",
          longName: "DupLong",
        },
        datasetsInfo: [
          { licenseId: "L1", shortName: "Dup", longName: "DupLong" },
        ],
      },
    };
    renderDetails();
    const short = await screen.findByPlaceholderText("Short Name");
    await waitFor(() => expect(short).toHaveValue("Dup"));
    fireEvent.blur(short);
    const long = screen.getByPlaceholderText("Long Name");
    fireEvent.blur(long);
    await waitFor(() =>
      expect(screen.queryByText(DUP_MESSAGE)).not.toBeInTheDocument()
    );
  });
});

describe("DatasetDetails — submission", () => {
  const filledFormData = {
    datasetId: "DS-1",
    longName: "Long Name Value",
    shortName: "Short Name Value",
    datasetDescription: "A description",
    datasetStatus: "Active",
    entityId: "E-1",
    licenseId: "L-1",
  };

  beforeEach(() => {
    mockState = buildState();
    mockLocation = { ...DEFAULT_LOCATION };
  });

  const renderWithData = (formData, locationState, next) => {
    mockLocation = { pathname: "/example/path", state: locationState };
    mockState = { dataset: { formData, datasetsInfo: [] } };
    const utils = render(
      <AppProviders>
        <DatasetDetails next={next} formData={false} />
      </AppProviders>
    );
    const submit = () =>
      utils.rerender(
        <AppProviders>
          <DatasetDetails next={next} formData={true} />
        </AppProviders>
      );
    return { ...utils, submit };
  };

  it("should bind existing form data into the inputs", async () => {
    mockState = { dataset: { formData: filledFormData, datasetsInfo: [] } };
    renderDetails();
    expect(await screen.findByDisplayValue("Long Name Value")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Short Name Value")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Active")).toBeInTheDocument();
  });

  it("should default the status to Active when there is no bound data", async () => {
    mockState = { dataset: { formData: {}, datasetsInfo: [] } };
    renderDetails();
    expect(await screen.findByDisplayValue("Active")).toBeInTheDocument();
  });

  it("should dispatch the dataset info and advance when the parent requests submission", async () => {
    const next = jest.fn();
    const { submit } = renderWithData(filledFormData, { licence: null }, next);
    await screen.findByDisplayValue("Long Name Value");

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    expect(datasetInfo).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    const submitted = datasetInfo.mock.calls[0][0];
    expect(submitted.longName).toBe("Long Name Value");
    expect(submitted.shortName).toBe("Short Name Value");
    // not an update — the identifiers are not force-copied from the store
    expect(next).toHaveBeenCalledWith(false);
  });

  it("should carry entityId and licenseId through on an update", async () => {
    const next = jest.fn();
    const { submit } = renderWithData(
      filledFormData,
      { isUpdate: true, licence: null },
      next
    );
    await screen.findByDisplayValue("Long Name Value");

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(true));
    const submitted = datasetInfo.mock.calls[0][0];
    expect(submitted.entityId).toBe("E-1");
    expect(submitted.licenseId).toBe("L-1");
  });

  it("should not dispatch when mandatory fields are empty", async () => {
    const next = jest.fn();
    const { submit } = renderWithData({}, { licence: null }, next);
    await screen.findByDisplayValue("Active");

    submit();

    await waitFor(() => expect(next).toHaveBeenCalledWith(false));
    expect(await screen.findByText("Long name is mandatory !")).toBeInTheDocument();
    expect(screen.getByText("Short name is mandatory !")).toBeInTheDocument();
    expect(screen.getByText("Description is mandatory !")).toBeInTheDocument();
    expect(datasetInfo).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(true);
  });
});
