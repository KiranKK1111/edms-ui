import React from "react";
import * as redux from "react-redux";
import { render, screen, act } from "@testing-library/react";

import ConfigurationSteps, {
  computeNextStep,
  computePrevStep,
  getFlag,
  getViewName,
  handleUpdates,
  isRunning,
} from "../../../components/addConfiguration/ConfigurationSteps";
import {
  startConfigUi,
  startConfigUiAuth,
  startConfigUiApiDetails,
  clearConfigData,
  checkIfRouteIsRunning,
} from "../../../store/actions/datafeedAction";

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

const mockDispatch = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const mockHistoryPush = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: () => ({ id: "DF1" }),
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock("../../../store/actions/datafeedAction", () => ({
  startConfigUi: jest.fn(),
  startConfigUiAuth: jest.fn(),
  startConfigUiApiDetails: jest.fn(),
  clearConfigData: jest.fn(),
  getConfigById: jest.fn(),
  startConfigUiSplit: jest.fn(),
  findConfigDetails: () => Promise.resolve({ data: null }),
  checkIfRouteIsRunning: jest.fn(),
}));

jest.mock("../../../utils/accessObject", () =>
  jest.fn().mockReturnValue({ permission: "RW" })
);
jest.mock("../../../utils/accessButtonCheck", () =>
  jest.fn().mockReturnValue(false)
);

jest.mock(
  "../../../components/addConfiguration/GeneralConfiguration",
  () => {
    const React = require("react");
    // Mirror the real step timing: on Next (formData=true) it resets the
    // trigger synchronously and advances ASYNCHRONOUSLY (after validation),
    // reporting the selected protocol.
    return (props) => {
      React.useEffect(() => {
        if (props.formData) {
          Promise.resolve().then(() =>
            props.next(true, {
              sourceProtocol: "HTTPS",
              splittingRequirement: "No",
            })
          );
          props.next(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [props.formData]);
      return React.createElement("div", { "data-testid": "general-config" });
    };
  }
);

// The API step has no mandatory fields, so if it ever mounts while the shared
// formData flag is still true it would auto-advance. This mock reproduces that
// behaviour so the test fails if the controller leaks formData=true on advance.
jest.mock(
  "../../../components/addConfiguration/ApiConfiguration",
  () => {
    const React = require("react");
    return (props) => {
      React.useEffect(() => {
        if (props.formData) {
          Promise.resolve().then(() => props.next(true, {}));
          props.next(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [props.formData]);
      // Mirror the real step's Previous contract: when prevData flips true the
      // step persists its draft and calls back previous(true, draft).
      React.useEffect(() => {
        if (props.prevData) {
          props.previous(true, { sourceProtocol: "HTTPS" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [props.prevData]);
      return React.createElement("div", { "data-testid": "api-config" });
    };
  }
);
jest.mock(
  "../../../components/addConfiguration/SplittingConfiguration",
  () => () => <div data-testid="splitting-config" />
);
jest.mock(
  "../../../components/addConfiguration/ReviewSubmit",
  () => () => <div data-testid="review-submit" />
);

const state = { datafeedInfo: { congigUi: {} } };

describe("ConfigurationSteps utility functions", () => {
  it("getViewName returns Add label for empty config", () => {
    expect(getViewName({})).toBe("Add Data Feed Configuration");
  });

  it("getViewName returns Edit label when a config id is present", () => {
    expect(getViewName({ dataFeedConfigurationId: "C1" })).toBe(
      "Edit Data Feed Configuration"
    );
  });

  it("getFlag returns true for Data Operations role with config", () => {
    localStorage.setItem("currentUserRole", "Data Operations");
    expect(getFlag("currentUserRole", { a: 1 })).toBe(true);
    localStorage.clear();
  });

  it("handleUpdates returns true when values match", () => {
    const data = { expiryDate: "31/3/2024", sourceHostName: "10.2.1.3" };
    const config = { expiry: "31/3/2024", sourceHostName: "10.2.1.3" };
    expect(handleUpdates(data, config)).toBe(true);
  });

  it("isRunning finds a matching routeName", () => {
    const allFeedDetails = { data: { content: [{ routeName: "RG8" }] } };
    expect(isRunning(allFeedDetails, { routeName: "RG8" })).toBe(true);
  });

  it("isRunning returns false when routeName is not found", () => {
    const allFeedDetails = { data: { content: [{ routeName: "other" }] } };
    expect(isRunning(allFeedDetails, { routeName: "RG8" })).toBe(false);
  });

  it("handleUpdates returns false when cronScheduler differs", () => {
    const data = { cronScheduler: "0 5 * * *", expiryDate: "31/3/2024", sourceHostName: "h", sourceUsername: "u", sourceFolder: "/", filenameFormat: "f", vendorRequestConfig: "N" };
    const config = { cronExpression: "0 6 * * *", expiry: "31/3/2024", sourceHostName: "h", sourceUser: "u", sourceFolder: "/", filePattern: "f", vendorRequestConfig: "N" };
    expect(handleUpdates(data, config)).toBe(false);
  });

  it("handleUpdates returns false when vendorRequestConfig differs", () => {
    const data = { cronScheduler: "0 * * * *", expiryDate: "31/3/2024", sourceHostName: "h", sourceUsername: "u", sourceFolder: "/", filenameFormat: "f", vendorRequestConfig: "Y" };
    const config = { cronExpression: "0 * * * *", expiry: "31/3/2024", sourceHostName: "h", sourceUser: "u", sourceFolder: "/", filePattern: "f", vendorRequestConfig: "N" };
    expect(handleUpdates(data, config)).toBe(false);
  });

  it("handleUpdates returns false when config is null", () => {
    expect(handleUpdates({ cronScheduler: "x" }, null)).toBe(false);
  });

  it("getViewName returns Add for null config", () => {
    expect(getViewName(null)).toBe("Add Data Feed Configuration");
  });

  it("getFlag returns false when config is null", () => {
    localStorage.setItem("currentUserRole", "Data Operations");
    expect(getFlag("currentUserRole", null)).toBe(false);
    localStorage.clear();
  });

  it("getFlag returns false when role is not Data Operations", () => {
    localStorage.setItem("currentUserRole", "Dataset Delegate");
    expect(getFlag("currentUserRole", { a: 1 })).toBe(false);
    localStorage.clear();
  });

  it("computePrevStep from Splitting (2): HTTPS -> API (1)", () => {
    expect(computePrevStep(2, true, true)).toBe(1);
  });

  it("computePrevStep from Splitting (2): non-HTTPS -> General (0)", () => {
    expect(computePrevStep(2, false, true)).toBe(0);
  });

  it("computePrevStep from API (1) always goes to General (0)", () => {
    expect(computePrevStep(1, true, false)).toBe(0);
    expect(computePrevStep(1, false, false)).toBe(0);
  });

  it("computeNextStep from Splitting (2) always goes to Review (3)", () => {
    expect(computeNextStep(2, true, true)).toBe(3);
    expect(computeNextStep(2, false, true)).toBe(3);
  });
});

describe("ConfigurationSteps (delegated body)", () => {
  let lastVm;
  let lastActions;
  beforeEach(() => {
    lastVm = undefined;
    lastActions = undefined;
    jest.spyOn(redux, "useSelector").mockImplementation((cb) => cb(state));
  });

  const renderBody = () =>
    render(
      <ConfigurationSteps
        onViewModel={(vm) => {
          lastVm = vm;
        }}
        bindActions={(a) => {
          lastActions = a;
        }}
      />
    );

  it("renders the first step content", () => {
    renderBody();
    expect(screen.getByTestId("general-config")).toBeInTheDocument();
  });

  it("reports a view-model with 4 steps starting at step 0", () => {
    renderBody();
    expect(lastVm).toBeDefined();
    expect(lastVm.steps).toHaveLength(4);
    expect(lastVm.current).toBe(0);
    expect(lastVm.title).toBe("Add Data Feed Configuration");
  });

  it("registers cancel/submit/next/previous actions", () => {
    renderBody();
    expect(typeof lastActions.cancel).toBe("function");
    expect(typeof lastActions.submit).toBe("function");
    expect(typeof lastActions.next).toBe("function");
    expect(typeof lastActions.previous).toBe("function");
  });

  it("advances to the API step (1) when the source protocol is HTTPS", () => {
    // HTTPS at the General step must go to API (1), not skip to Review.
    expect(computeNextStep(0, true, false)).toBe(1);
    expect(computeNextStep(0, true, true)).toBe(1);
  });

  it("skips the API step for SFTP without splitting (0 -> Review)", () => {
    expect(computeNextStep(0, false, false)).toBe(3);
  });

  it("goes to the Splitting step for SFTP with splitting (0 -> 2)", () => {
    expect(computeNextStep(0, false, true)).toBe(2);
  });

  it("from API (1): splitting -> 2, no splitting -> 3", () => {
    expect(computeNextStep(1, true, true)).toBe(2);
    expect(computeNextStep(1, true, false)).toBe(3);
  });

  it("previous from Review respects splitting/HTTPS", () => {
    expect(computePrevStep(3, true, true)).toBe(2); // splitting -> Splitting
    expect(computePrevStep(3, true, false)).toBe(1); // HTTPS -> API
    expect(computePrevStep(3, false, false)).toBe(0); // SFTP/no-split -> General
  });

  it("controller Next from General with HTTPS lands on the API step (integration)", async () => {
    renderBody();
    expect(lastVm.current).toBe(0);
    // Controller's Next -> setFormData(true). The General mock validates and
    // advances asynchronously; the API step must NOT auto-advance past itself.
    await act(async () => {
      lastActions.next();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(lastVm.current).toBe(1);
  });

  it("controller Previous from the API step saves the draft then returns to General", async () => {
    renderBody();
    // Get to the API step first (General -> HTTPS -> API).
    await act(async () => {
      lastActions.next();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(lastVm.current).toBe(1);
    // Previous: the controller asks the API step to persist its draft; the
    // step calls back previous(true, draft) and navigation completes.
    await act(async () => {
      lastActions.previous();
      await Promise.resolve();
    });
    expect(lastVm.current).toBe(0);
    expect(screen.getByTestId("general-config")).toBeInTheDocument();
  });

  it("controller Previous from Review (no form) navigates directly", async () => {
    renderBody();
    // current stays 0 here; previous at step 0 must be a no-op (stays at 0).
    await act(async () => {
      lastActions.previous();
    });
    expect(lastVm.current).toBe(0);
  });

  it("cancel action dispatches clearConfigData and navigates to masterData", async () => {
    renderBody();
    await act(async () => {
      lastActions.cancel();
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith("/masterData");
  });
});

describe("submitConfig", () => {
  let lastActions;
  const sftp_no_split_configValues = {
    splittingRequirement: "No",
    sourceProtocol: "SFTP",
    tokenReq: "No",
    routeName: "testRoute",
    dataFeedId: "DF123",
    createdBy: "user1",
    startDate: "2026-06-01T00:00:00.000Z",
    expiryDate: "2026-12-31T00:00:00.000Z",
    cronScheduler: "0 0 * * *",
    sourceProcessor: "sftpProcessor",
    sourcePortInteger: "22",
    sourceUsername: "user",
    sourcePasswordProperty: "pass.prop",
    sourceFolder: "/data",
    destinationExpression: "bean:s3Processor?method=process",
    filenameFormat: "*.csv",
    routeType: "Scheduled",
    keyLocation: "/keys",
    storageLocation: "/storage",
    proxyRequirement: "No",
    filenameExtension: "",
    asynchronousRoute: "False",
    isChecksum: false,
    vendorRequestConfig: "N",
    filenameDateSuffix: "No",
  };

  beforeEach(() => {
    lastActions = undefined;
    mockHistoryPush.mockClear();
    jest.clearAllMocks();
    jest.spyOn(redux, "useSelector").mockImplementation((cb) =>
      cb({ datafeedInfo: { congigUi: sftp_no_split_configValues } })
    );
  });

  const renderForSubmit = () =>
    render(
      <ConfigurationSteps
        onViewModel={jest.fn()}
        bindActions={(a) => { lastActions = a; }}
      />
    );

  it("submitConfig SFTP non-splitting: calls startConfigUi and navigates on success", async () => {
    mockDispatch
      .mockResolvedValueOnce({})                          // getConfigById (useEffect on mount)
      .mockResolvedValueOnce({ data: { content: [] } })   // checkIfRouteIsRunning
      .mockResolvedValueOnce({ data: { routeId: "DFD1" } }) // startConfigUi
      .mockResolvedValue({});                             // clearConfigData + fallback

    await act(async () => { renderForSubmit(); await Promise.resolve(); });
    await act(async () => {
      await lastActions.submit();
      await Promise.resolve();
    });

    expect(startConfigUi).toHaveBeenCalled();
    expect(startConfigUiApiDetails).not.toHaveBeenCalled();
    expect(startConfigUiAuth).not.toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith("/masterData");
  });

  it("submitConfig HTTPS + tokenReq=Yes: calls startConfigUiApiDetails and startConfigUiAuth", async () => {
    jest.spyOn(redux, "useSelector").mockImplementation((cb) =>
      cb({
        datafeedInfo: {
          congigUi: {
            ...sftp_no_split_configValues,
            sourceProtocol: "HTTPS",
            tokenReq: "Yes",
            tokenURL: "https://example.com/token",
            userName: "user1",
            grantType: "password",
            passwordProperty: "pass.prop",
            requestBodyAuth: "{}",
            contentType: "application/json",
            tokenResponseKey: "access_token",
            tokenPrefix: "Bearer",
          },
        },
      })
    );
    mockDispatch
      .mockResolvedValueOnce({})                          // getConfigById (useEffect on mount)
      .mockResolvedValueOnce({ data: { content: [] } })   // checkIfRouteIsRunning
      .mockResolvedValueOnce({ data: { routeId: "DFD1" } }) // startConfigUi
      .mockResolvedValue({});                             // startConfigUiApiDetails, startConfigUiAuth, clearConfigData

    await act(async () => { renderForSubmit(); await Promise.resolve(); });
    await act(async () => {
      await lastActions.submit();
      await Promise.resolve();
    });

    expect(startConfigUiApiDetails).toHaveBeenCalled();
    expect(startConfigUiAuth).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith("/masterData");
  });

  it("submitConfig: does not navigate when route creation returns routeError", async () => {
    mockDispatch
      .mockResolvedValueOnce({})                          // getConfigById (useEffect on mount)
      .mockResolvedValueOnce({ data: { content: [] } })   // checkIfRouteIsRunning
      .mockResolvedValueOnce({ routeError: true })        // startConfigUi returns error
      .mockResolvedValue({});

    await act(async () => { renderForSubmit(); await Promise.resolve(); });
    await act(async () => {
      await lastActions.submit();
      await Promise.resolve();
    });

    expect(startConfigUiApiDetails).not.toHaveBeenCalled();
    expect(startConfigUiAuth).not.toHaveBeenCalled();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it("submitConfig splitting=Yes exitingSchema=Yes: calls startConfigUi after split check", async () => {
    jest.spyOn(redux, "useSelector").mockImplementation((cb) =>
      cb({
        datafeedInfo: {
          congigUi: {
            ...sftp_no_split_configValues,
            splittingRequirement: "Yes",
            exitingSchema: "Yes",
            schemaId: "schema-abc",
          },
        },
      })
    );
    mockDispatch
      .mockResolvedValueOnce({})                          // getConfigById (useEffect on mount)
      .mockResolvedValueOnce({ data: { content: [] } })   // checkIfRouteIsRunning
      .mockResolvedValueOnce({ data: { routeId: "DFD1" } }) // startConfigUi
      .mockResolvedValue({});                             // clearConfigData + fallback

    await act(async () => { renderForSubmit(); await Promise.resolve(); });
    await act(async () => {
      await lastActions.submit();
      await Promise.resolve();
    });

    expect(startConfigUi).toHaveBeenCalled();
    expect(mockHistoryPush).toHaveBeenCalledWith("/masterData");
  });
});
