import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Chip } from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import dayjs from "../../design-system/dayjs";
import GeneralConfiguration from "./GeneralConfiguration";
import ApiConfiguration from "./ApiConfiguration";
import SplittingConfiguration from "./SplittingConfiguration";
import ReviewSubmit from "./ReviewSubmit";
import {
  startConfigUi,
  startConfigUiAuth,
  startConfigUiApiDetails,
  clearConfigData,
  getConfigById,
  startConfigUiSplit,
  findConfigDetails,
  checkIfRouteIsRunning,
} from "../../store/actions/datafeedAction";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
  DATA_OPERATIONS,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";
import getPermissionObject from "../../utils/accessObject";
import { checkForString } from "../../utils/warningUtils";
import { toast as message } from "../../design-system/toast";
import "../../pages/datafeed/addConfiguration.css";

export const getViewName = (config) => {
  if (!config) return "Add Data Feed Configuration";
  return Object.keys(config).length &&
    config["dataFeedConfigurationId"] != undefined
    ? `Edit Data Feed Configuration`
    : `Add Data Feed Configuration`;
};

export const getFlag = (currentRole, configValues) => {
  return checkForString(currentRole, DATA_OPERATIONS) && configValues !== null;
};

export const isRunning = (allFeedDetails, finalValues) => {
  return (
    allFeedDetails.data.content.find(
      (item) => item.routeName === finalValues.routeName
    ) !== undefined
  );
};

export const handleUpdates = (data, config) => {
  var flag;
  if (config) {
    if (data.cronScheduler !== config.cronExpression) {
      flag = false;
    } else if (
      new Date(data.expiryDate.toString()).toLocaleDateString() !==
      new Date(config.expiry.toString()).toLocaleDateString()
    ) {
      flag = false;
    } else if (data.filenameFormat !== config.filePattern) {
      flag = false;
    } else if (data.sourceHostName !== config.sourceHostName) {
      flag = false;
    } else if (data.sourceUsername !== config.sourceUser) {
      flag = false;
    } else if (data.sourceFolder !== config.sourceFolder) {
      flag = false;
    } else if (data.vendorRequestConfig !== config.vendorRequestConfig) {
      flag = false;
    } else {
      flag = true;
    }
  } else {
    flag = false;
  }
  return flag;
};

/*
  Wizard step indices: 0 General, 1 API, 2 Splitting, 3 Review.
  The API step applies only to HTTPS (API) sources; the Splitting step only when
  splitting is applicable. Navigation is computed purely from the protocol +
  splitting choice. Exported so the (non-linear) navigation is unit-testable.
*/
export const computeNextStep = (cur, isHttps, isSplit) => {
  if (cur === 0) {
    if (isHttps) return 1; // API
    if (isSplit) return 2; // Splitting (non-API source)
    return 3; // Review
  }
  if (cur === 1) return isSplit ? 2 : 3; // API -> Splitting / Review
  if (cur === 2) return 3; // Splitting -> Review
  return Math.min(3, cur + 1);
};

export const computePrevStep = (cur, isHttps, isSplit) => {
  if (cur === 3) {
    if (isSplit) return 2;
    if (isHttps) return 1;
    return 0;
  }
  if (cur === 2) return isHttps ? 1 : 0; // Splitting -> API / General
  if (cur === 1) return 0; // API -> General
  return Math.max(0, cur - 1);
};

/*
  ConfigurationSteps — the data-feed configuration wizard body. It owns ALL of
  the (intentionally intricate) wizard logic: the non-linear step navigation
  that skips API/Splitting steps based on protocol + splitting choices, the
  edit/view detection, the change-detection submit guard, and the heavy
  submit flow. It renders only the CURRENT step's content and reports a
  view-model (title/breadcrumb/meta/steps/current/button state) up to the
  generic <RecordFormPage> "delegated" driver, which renders the shared chrome
  and delegates the Cancel/Submit/Prev/Next actions back here.

  Props (from the controller):
    onViewModel(vm) : push the chrome view-model
    bindActions(a)  : register { cancel, submit, next, previous } imperatively
*/
const ConfigurationSteps = ({ onViewModel, bindActions }) => {
  const params = useParams();
  const history = useHistory();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState(false);
  const [prevData, setPrevData] = useState(false);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState();
  const [isUpdate, setIsUpdate] = useState();
  const [configData, setConfigData] = useState();

  const addDataConfigPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );
  const addConfigButton = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );

  const configValues = useSelector((state) => state.datafeedInfo.congigUi);

  useEffect(() => {
    dispatch(getConfigById(params.id));
    if (
      addDataConfigPagesAndButton &&
      addDataConfigPagesAndButton.permission === "R"
    ) {
      setCurrent(steps.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    findConfigDetails(params.id)
      .then((res) => {
        if (!mounted) return;
        if (res.data !== null) {
          setConfigData(res.data);
          setIsUpdate(true);
        } else {
          setConfigData(null);
          setIsUpdate(false);
        }
      })
      .catch((err) => err);
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wizard step indices: 0 General, 1 API, 2 Splitting, 3 Review.
  // Navigation is computed purely from the protocol + splitting choice (never
  // from the stale closed-over configValues) via the exported pure helpers.
  const resolveProtocolSplitting = (data) => {
    const src = data && Object.keys(data || {}).length ? data : configValues;
    const protocol = src["sourceProtocol"] ?? configValues["sourceProtocol"];
    const splitting =
      src["splittingRequirement"] ?? configValues["splittingRequirement"];
    return { isHttps: protocol === "HTTPS", isSplit: splitting === "Yes" };
  };

  const previous = (value, formDataValues) => {
    if (value === true) {
      // The step finished persisting its draft — move back now. Reset the
      // trigger in the SAME update so the newly-mounted step does not see
      // prevData=true and immediately save+navigate again.
      const { isHttps, isSplit } = resolveProtocolSplitting(formDataValues);
      setPrevData(false);
      return setCurrent(computePrevStep(current, isHttps, isSplit));
    }
    // API (1) and Splitting (2) hold editable forms: ask them to persist the
    // current (possibly incomplete — no validation) input to redux first, so
    // nothing typed is lost when navigating backwards. Review (3) has no form.
    if (current === 1 || current === 2) return setPrevData(true);
    const { isHttps, isSplit } = resolveProtocolSplitting(configValues);
    setCurrent(computePrevStep(current, isHttps, isSplit));
  };

  const next = (value, formDataValues) => {
    if (value === true) {
      const { isHttps, isSplit } = resolveProtocolSplitting(formDataValues);
      const target = computeNextStep(current, isHttps, isSplit);
      // Reset the shared validation trigger in the SAME update as the step
      // change so the newly-mounted step does not see formData=true and
      // auto-advance (its validation effect runs on mount).
      setFormData(false);
      return setCurrent(target);
    }
    setFormData(value === false ? false : true);
  };

  const configEdit = getFlag("currentUserRole", configData);

  const handleUpdatedData = (data, isUpdatedDataPassed) => {
    if (isUpdatedDataPassed !== true) {
      window.setTimeout(handleUpdatedData, 2000);
    } else {
      setFlag(handleUpdates(data, configData));
    }
  };

  const steps = [
    {
      title: "General Configuration",
      content: (
        <GeneralConfiguration
          passUpdates={handleUpdatedData}
          isUpdate={configEdit}
          next={next}
          formData={formData}
        />
      ),
    },
    {
      title: "API Configuration",
      content: (
        <ApiConfiguration
          next={next}
          formData={formData}
          previous={previous}
          prevData={prevData}
        />
      ),
    },
    {
      title: "Splitting Configuration",
      content: (
        <SplittingConfiguration
          next={next}
          formData={formData}
          previous={previous}
          prevData={prevData}
        />
      ),
    },
    {
      title: "Review & Submit",
      content: <ReviewSubmit configValues={configValues} previous={previous} />,
    },
  ];

  const cancelHandler = () => {
    dispatch(clearConfigData());
    history.push("/masterData");
  };

  const submitConfig = async () => {
    try {
    let splitterCanonicalClass =
      "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute";
    if (
      configValues["dataFeedType"] == "xml" ||
      configValues["dataFeedType"] ==
        "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute"
    ) {
      splitterCanonicalClass =
        "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute";
    } else if (
      configValues["dataFeedType"] == "json" ||
      configValues["dataFeedType"] ==
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute"
    ) {
      splitterCanonicalClass =
        "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute";
    } else if (
      configValues["dataFeedType"] == "xpath" ||
      configValues["dataFeedType"] ==
        "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute"
    ) {
      splitterCanonicalClass =
        "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute";
    } else {
      splitterCanonicalClass =
        "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute";
    }
    let finalValues = {
      createdByUserId: configValues["createdBy"],
      start: configValues["startDate"],
      expiry: configValues["expiryDate"],
      cronExpression: configValues["cronScheduler"],
      sourceHostname: configValues["sourceHostName"],
      sourceProcessor: configValues["sourceProcessor"],
      sourcePort: configValues["sourcePortInteger"]
        ? parseInt(configValues["sourcePortInteger"], 10)
        : null,
      sourceUser: configValues["sourceUsername"],
      sourcePasswordProperty: configValues["sourcePasswordProperty"],
      sourceProtocol: configValues["sourceProtocol"],
      sourceFolder: configValues["sourceFolder"],
      destinationExpression: configValues["destinationExpression"],
      filePattern: configValues["filenameFormat"],
      dataFeedId: configValues["dataFeedId"],
      keyLocation:
        configValues["keyLocation"] != "" ? configValues["keyLocation"] : null,
      routeName: configValues["routeName"],
      routeTypeCanonicalClass:
        configValues["routeType"] == "Scheduled"
          ? "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute"
          : "com.scb.edms.edmsdataflowsvc.routes.OnceOnlyRoute",
      isEnabled:
        configValues["isEnabled"] != null
          ? configValues["isEnabled"] !== false
          : configValues["configurationStatus"] === "Active" ||
            configValues["configurationStatus"] == undefined,
      isProxyUsed: configValues["proxyRequirement"] === "Yes" ? true : false,
      proxyHost:
        configValues["proxyHostname"] != ""
          ? configValues["proxyHostname"]
          : null,
      proxyPort:
        configValues["proxyPort"] != "" && configValues["proxyPort"] != null
          ? parseInt(configValues["proxyPort"], 10)
          : null,
      fileSuffix:
        configValues["filenameDateSuffix"] == "Yes"
          ? `'.'+formatDateString('yyyyMMdd', 0)`
          : null,
      fileExtension: configValues["filenameExtension"],
      isAsyncRoute: configValues["asynchronousRoute"] === "True" ? true : false,
      isChecksum: configValues["isChecksum"],
      lastUpdatedBy: localStorage.getItem("psid"),
      storageLocation:
        configValues["storageLocation"] != null && configValues["storageLocation"] !== ""
          ? configValues["storageLocation"]
          : null,
      splittingSourceExpression:
        configValues["splittingSourceExpression"] != undefined
          ? configValues["splittingSourceExpression"]
          : null,
      splittingPathExpression:
        configValues["splittingPathExpression"] != undefined
          ? configValues["splittingPathExpression"]
          : null,
      splitterCanonicalClass: splitterCanonicalClass,
      schemaId:
        configValues["exitingSchema"] == "No" ? null : configValues["schemaId"],
      vendorRequestConfig: configValues["vendorRequestConfig"],
    };

    const allDataFeedDetails = await dispatch(checkIfRouteIsRunning());

    // Submits to POST /api/v1/apidetails (multipart) or PUT /editApiDetails/{dataFeedId} (JSON).
    const submitApiDetails = async (routeId) => {
      if (configValues["sourceProtocol"] !== "HTTPS") return;
      await dispatch(startConfigUiApiDetails(isUpdate, {
        dataFeedDetailsId: routeId,
        dataFeedId: configValues["dataFeedId"],
        requestMethod: configValues["requestMethod"],
        requestParameters: configValues["requestParameter"],
        requestBodyFile: configValues["requestBodyObj"],
        requestBody: configValues["requestBody"],
        requestHeaders: configValues["requestHeaders"],
        createdBy: localStorage.getItem("psid"),
        lastUpdatedBy: localStorage.getItem("psid"),
      }));
    };

    // Submits to POST /api/v1/authenticationdetails or PUT /editAuthenticationDetails/{dataFeedId}.
    const submitAuthDetails = async () => {
      if (configValues["tokenReq"] !== "Yes") return;
      await dispatch(startConfigUiAuth(isUpdate, {
        dataFeedId: configValues["dataFeedId"],
        userName: configValues["userName"],
        grantType: configValues["grantType"],
        passwordProperty: configValues["passwordProperty"],
        url: configValues["tokenURL"],
        requestBody: configValues["requestBodyAuth"],
        contentType: configValues["contentType"],
        tokenResponseKey: configValues["tokenResponseKey"],
        tokenPrefix: configValues["tokenPrefix"],
      }));
    };

    // Only save api/auth details and navigate when route creation fully succeeded.
    // If route instantiation fails, nothing is saved to DB (backend is @Transactional)
    // and we stay on the page so the user can retry.
    const handleRouteResult = async (res) => {
      if (!res || res.routeError) return;
      const routeId = res.data?.routeId ?? null;
      await submitApiDetails(routeId);
      await submitAuthDetails();
      dispatch(clearConfigData());
      history.push("/masterData");
    };

    if (configValues["splittingRequirement"] == "Yes") {
      if (configValues["exitingSchema"] == "Yes") {
        const res = await dispatch(
          startConfigUi(
            isUpdate,
            finalValues,
            isRunning(allDataFeedDetails, finalValues)
          )
        );
        await handleRouteResult(res);
      } else {
        const splittingSchemaDetail = {
          schema: configValues["schemaDataObj"],
          schemaMetaData: configValues["schemaMetaDataObj"],
        };
        const resSplit = await dispatch(
          startConfigUiSplit(splittingSchemaDetail)
        );
        if (resSplit && resSplit.schemaName != null) {
          finalValues.schemaId = resSplit.schemaName;
          const res = await dispatch(
            startConfigUi(
              isUpdate,
              finalValues,
              isRunning(allDataFeedDetails, finalValues)
            )
          );
          await handleRouteResult(res);
        }
      }
    } else {
      finalValues.schemaId = "NA";
      finalValues.splittingSourceExpression = `direct://${finalValues.routeName}`;
      finalValues.splittingPathExpression = null;
      finalValues.splitterCanonicalClass = null;
      const res = await dispatch(
        startConfigUi(
          isUpdate,
          finalValues,
          isRunning(allDataFeedDetails, finalValues)
        )
      );
      await handleRouteResult(res);
    }
  } catch (err) {
    message.error(
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred while saving the configuration"
    );
  }
};

  const getOperationText = () => {
    if (
      addDataConfigPagesAndButton &&
      addDataConfigPagesAndButton.permission === "R"
    ) {
      return "View Data Feed Configuration";
    }
    if (configValues && configValues["dataFeedConfigurationId"]) {
      return "Edit Data Feed Configuration";
    } else {
      return "Add Data Feed Configuration";
    }
  };

  const renderStatusBadge = (status, fallback = "NA") => {
    if (!status) return fallback;
    const lower = String(status).toLowerCase();
    return lower === "active" ? (
      <Chip size="small" color="success" variant="outlined" label="Active" />
    ) : (
      <Chip size="small" color="error" variant="outlined" label={status} />
    );
  };

  const meta = [
    {
      label: "Data Feed ID",
      value: (configValues && configValues["dataFeedId"]) || params.id || "NA",
    },
    {
      label: "Data Feed Status",
      value: renderStatusBadge(sessionStorage.getItem("feedStatus")),
    },
    {
      label: "Configuration created on",
      value:
        configValues && configValues["configurationCreatedOn"]
          ? dayjs(configValues["configurationCreatedOn"]).format("DD MMM YYYY")
          : dayjs(new Date()).format("DD MMM YYYY"),
    },
    {
      label: "Updated on",
      value:
        configValues && configValues["lastUpdatedOn"]
          ? dayjs(configValues["lastUpdatedOn"]).format("DD MMM YYYY")
          : "NA",
    },
    ...(configValues && configValues["dataFeedConfigurationId"]
      ? [
          {
            label: "Data Feed Configuration ID",
            value: configValues["dataFeedConfigurationId"],
          },
        ]
      : []),
    {
      label: "Configuration Status",
      value: renderStatusBadge(
        configValues && configValues["configurationStatus"]
      ),
    },
    {
      label: "Created by",
      value:
        (configValues && configValues["createdBy"]) ||
        localStorage.getItem("psid") ||
        "NA",
    },
    {
      label: "Updated by",
      value: (configValues && configValues["lastUpdatedBy"]) || "NA",
    },
  ];

  const breadcrumb = [
    { name: "Entities", url: "/masterData" },
    { name: sessionStorage.getItem("feedShortName"), url: "/masterData" },
    { name: getViewName(configValues) },
  ];

  const stepItems = steps.map((item) => ({ key: item.title, title: item.title }));
  const canSubmit = !(addConfigButton || current !== steps.length - 1 || flag);

  // Report the chrome view-model to the controller. Keyed on the values that
  // actually affect the chrome so this stays bounded (no per-render loop).
  useEffect(() => {
    onViewModel({
      title: getOperationText(),
      breadcrumb,
      backTo: "/masterData",
      className: "add-configuration-page",
      meta,
      steps: stepItems,
      current,
      canSubmit,
      showPrev: current > 0,
      showNext: current < steps.length - 1,
      prevDisabled: addConfigButton,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, configValues, flag, addConfigButton]);

  // Register the imperative actions (re-bind every render to capture the latest
  // closures over current / configValues / isUpdate).
  useEffect(() => {
    bindActions({
      cancel: cancelHandler,
      submit: submitConfig,
      next: () => next(),
      previous,
    });
  });

  return steps[current].content;
};

export default ConfigurationSteps;
