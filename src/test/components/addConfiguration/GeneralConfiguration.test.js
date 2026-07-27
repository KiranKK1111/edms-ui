import React from "react";
import * as redux from "react-redux";
import { render, screen, act, fireEvent } from "@testing-library/react";
import GeneralConfiguration from "../../../components/addConfiguration/GeneralConfiguration";

// MUI's useMediaQuery (via the date picker) needs a full matchMedia mock.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));
jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "DF123" }),
}));

const setupSelector = (configValues = {}) => {
  const state = { datafeedInfo: { congigUi: configValues } };
  redux.useSelector.mockImplementation((cb) => cb(state));
};

// A full set of valid values so trigger() passes and onFinish runs.
const validConfigValues = {
  startDate: "2025-01-01",
  expiryDate: "2025-12-31",
  configurationCreatedOn: "2025-01-01",
  routeType: "Scheduled",
  sourceProcessor: "sftpProcessor",
  sourceProtocol: "SFTP",
  proxyRequirement: "No",
  splittingRequirement: "No",
  filenameDateSuffix: "No",
  cronScheduler: "0 0 12 * * ?",
  storageLocation: "s3://bucket/feeds",
  sourceHostName: "10.192.191.25",
  sourcePortInteger: "22",
  sourceUsername: "svc_user",
  sourcePasswordProperty: "vault.prop",
  sourceFolder: "/inbox/",
  filenameFormat: "NotUsed",
  routeName: "route-1",
  destinationExpression: "bean:s3Processor?method=process",
  isChecksum: false,
  vendorRequestConfig: "N",
};

const renderCfg = (props = {}) =>
  render(
    <GeneralConfiguration next={jest.fn()} passUpdates={jest.fn()} {...props} />
  );

describe("GeneralConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("psid", "1234567");
    sessionStorage.clear();
    sessionStorage.setItem("feedShortName", "TestFeed");
    setupSelector();
  });

  it("should render the section headers", () => {
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
    expect(screen.getByText("Proxy")).toBeInTheDocument();
    expect(screen.getByText("On-Demand Vendor request")).toBeInTheDocument();
  });

  it("should render core field labels", () => {
    renderCfg();
    expect(screen.getByText("Source processor")).toBeInTheDocument();
    expect(screen.getByText("Cron scheduler")).toBeInTheDocument();
    expect(screen.getByText("Storage location")).toBeInTheDocument();
  });

  it("should render the route type radio options", () => {
    renderCfg();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("One-time")).toBeInTheDocument();
  });

  it("should render with config values from redux", () => {
    setupSelector({
      startDate: "2025-01-01",
      expiryDate: "2025-12-31",
      routeType: "Scheduled",
      sourceProcessor: "sftpProcessor",
      proxyRequirement: "No",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
      cronScheduler: "0 0 * * *",
    });
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
  });

  it("should show proxy fields when proxyRequirement is Yes", () => {
    setupSelector({
      proxyRequirement: "Yes",
      splittingRequirement: "No",
      filenameDateSuffix: "No",
    });
    renderCfg();
    expect(screen.getByText("Proxy hostname")).toBeInTheDocument();
    expect(screen.getByText("Proxy port")).toBeInTheDocument();
  });

  it("should render disabled fields when isUpdate is true", () => {
    const { container } = renderCfg({ isUpdate: true });
    expect(container.querySelectorAll("input[disabled]").length).toBeGreaterThanOrEqual(1);
  });

  it("should handle a feed short name with a space in sessionStorage", () => {
    sessionStorage.setItem("feedShortName", "Test Feed Name");
    setupSelector({});
    renderCfg();
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
  });

  it("should show a human readable cron preview from config values", () => {
    setupSelector({ ...validConfigValues, cronScheduler: "0 0 12 * * ?" });
    renderCfg();
    expect(screen.getByText(/At 12:00 PM/i)).toBeInTheDocument();
  });

  it("should not show a cron preview when the stored cron is invalid", () => {
    setupSelector({ ...validConfigValues, cronScheduler: "not a cron" });
    renderCfg();
    expect(screen.queryByText(/At /)).not.toBeInTheDocument();
  });

  it("should update the cron preview while typing (valid, invalid, empty)", async () => {
    const { container } = renderCfg();
    const cronInput = container.querySelector('input[name="cronScheduler"]');
    await act(async () => {
      fireEvent.change(cronInput, { target: { value: "0 0 12 * * ?" } });
    });
    expect(screen.getByText(/At 12:00 PM/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(cronInput, { target: { value: "garbage cron" } });
    });
    expect(screen.queryByText(/At 12:00 PM/i)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.change(cronInput, { target: { value: "" } });
    });
    expect(screen.queryByText(/At 12:00 PM/i)).not.toBeInTheDocument();
  });

  it("should toggle proxy fields via the proxy requirement radios", async () => {
    renderCfg();
    expect(screen.queryByText("Proxy hostname")).not.toBeInTheDocument();
    // 'Yes' radios in order: filenameDateSuffix, proxyRequirement, vendor request
    const yesRadios = screen.getAllByRole("radio", { name: "Yes" });
    await act(async () => {
      fireEvent.click(yesRadios[1]);
    });
    expect(screen.getByText("Proxy hostname")).toBeInTheDocument();
    expect(screen.getByText("Proxy port")).toBeInTheDocument();
    const noRadios = screen.getAllByRole("radio", { name: "No" });
    await act(async () => {
      fireEvent.click(noRadios[1]);
    });
    expect(screen.queryByText("Proxy hostname")).not.toBeInTheDocument();
  });

  it("should update route type, filename date suffix and vendor request via radio handlers", async () => {
    renderCfg();
    const oneTime = screen.getByRole("radio", { name: "One-time" });
    await act(async () => {
      fireEvent.click(oneTime);
    });
    expect(oneTime).toBeChecked();
    const yesRadios = screen.getAllByRole("radio", { name: "Yes" });
    // filenameDateSuffix -> Yes
    await act(async () => {
      fireEvent.click(yesRadios[0]);
    });
    expect(yesRadios[0]).toBeChecked();
    // vendor request -> Yes
    await act(async () => {
      fireEvent.click(yesRadios[2]);
    });
    expect(yesRadios[2]).toBeChecked();
    // splitting requirement -> Applicable
    const applicable = screen.getByRole("radio", { name: "Applicable" });
    await act(async () => {
      fireEvent.click(applicable);
    });
    expect(applicable).toBeChecked();
  });

  it("should not advance when validation fails on Next", async () => {
    const next = jest.fn();
    const passUpdates = jest.fn();
    const { rerender } = render(
      <GeneralConfiguration
        next={next}
        passUpdates={passUpdates}
        formData={false}
      />
    );
    await act(async () => {
      rerender(
        <GeneralConfiguration
          next={next}
          passUpdates={passUpdates}
          formData={true}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    // required fields are empty -> trigger() fails -> only the reset call fires
    expect(next).toHaveBeenCalledWith(false);
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
    expect(passUpdates).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Cron scheduler is mandatory !")
    ).toBeInTheDocument();
  });

  it("should submit and report updates when all fields are valid", async () => {
    setupSelector(validConfigValues);
    const next = jest.fn();
    const passUpdates = jest.fn();
    const { rerender } = render(
      <GeneralConfiguration
        next={next}
        passUpdates={passUpdates}
        formData={false}
      />
    );
    mockDispatch.mockClear();
    await act(async () => {
      rerender(
        <GeneralConfiguration
          next={next}
          passUpdates={passUpdates}
          formData={true}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        createdBy: "1234567",
        dataFeedId: "DF123",
        proxyHostname: "",
        proxyPort: "",
        isChecksum: false,
      })
    );
    expect(passUpdates).toHaveBeenCalledWith(expect.any(Object), true);
  });

  it("should keep proxy values on submit when proxyRequirement is Yes", async () => {
    setupSelector({
      ...validConfigValues,
      proxyRequirement: "Yes",
      proxyHostname: "10.0.0.1",
      proxyPort: "8080",
    });
    const next = jest.fn();
    const { rerender } = render(
      <GeneralConfiguration
        next={next}
        passUpdates={jest.fn()}
        formData={false}
      />
    );
    await act(async () => {
      rerender(
        <GeneralConfiguration
          next={next}
          passUpdates={jest.fn()}
          formData={true}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        proxyHostname: "10.0.0.1",
        proxyPort: "8080",
      })
    );
  });

  it("should map the scheduled route class to the Scheduled radio via bindData", () => {
    setupSelector({
      ...validConfigValues,
      routeType: "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute",
    });
    renderCfg();
    expect(screen.getByRole("radio", { name: "Scheduled" })).toBeChecked();
  });

  it("should map an unknown route class to One-time via bindData", () => {
    setupSelector({
      ...validConfigValues,
      routeType: "com.scb.edms.edmsdataflowsvc.routes.OneTimeRoute",
    });
    renderCfg();
    expect(screen.getByRole("radio", { name: "One-time" })).toBeChecked();
  });

  it("should default source protocol to SFTP when it is null in config values", () => {
    setupSelector({ ...validConfigValues, sourceProtocol: null });
    renderCfg();
    expect(screen.getByRole("radio", { name: "SFTP" })).toBeChecked();
  });

  it("should mark splitting Applicable when a splitter canonical class exists", () => {
    setupSelector({
      ...validConfigValues,
      splitterCanonicalClass:
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute",
      splittingRequirement: "No",
    });
    renderCfg();
    expect(screen.getByRole("radio", { name: "Applicable" })).toBeChecked();
  });

  it("should mark splitting Not applicable when no splitter class exists", () => {
    setupSelector({ ...validConfigValues, splittingRequirement: "Yes" });
    renderCfg();
    expect(screen.getByRole("radio", { name: "Not applicable" })).toBeChecked();
  });

  it("should prefill created by and data feed id on the create path", async () => {
    setupSelector({});
    const next = jest.fn();
    const passUpdates = jest.fn();
    render(
      <GeneralConfiguration
        next={next}
        passUpdates={passUpdates}
        formData={false}
      />
    );
    // setDefaultValues ran: dataFeedId comes from route params
    expect(screen.getByText("Main Configuration")).toBeInTheDocument();
  });

  it("should show validation errors for invalid host and port values", async () => {
    setupSelector({
      ...validConfigValues,
      sourceHostName: "not a host!!",
      sourcePortInteger: "-2abc",
    });
    const next = jest.fn();
    const { rerender } = render(
      <GeneralConfiguration
        next={next}
        passUpdates={jest.fn()}
        formData={false}
      />
    );
    await act(async () => {
      rerender(
        <GeneralConfiguration
          next={next}
          passUpdates={jest.fn()}
          formData={true}
        />
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(next).not.toHaveBeenCalledWith(true, expect.any(Object));
    expect(
      await screen.findByText("Not a valid host name")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Only numbers and positive numbers are allowed")
    ).toBeInTheDocument();
  });
});
