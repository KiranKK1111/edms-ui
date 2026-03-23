import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, PageHeader, Steps, Descriptions, Row, Col, Badge } from "antd";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import Headers from "../header/Header";
import { useHistory, useParams } from "react-router-dom";
import "./addConfiguration.css";
import moment from "moment";
import GeneralConfiguration from "../../components/addConfiguration/GeneralConfiguration";
import ApiConfiguration from "../../components/addConfiguration/ApiConfiguration";
import SplittingConfiguration from "../../components/addConfiguration/SplittingConfiguration";
import ReviewSubmit from "../../components/addConfiguration/ReviewSubmit";
import {
  startConfigUi,
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
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { checkForString } from "../../utils/warningUtils";

export const getViewName = (config) => {
  if (!config) return "Add Data Feed Configuration";
  return Object.keys(config).length &&
    config["dataFeedConfigurationId"] != undefined
    ? `Edit Data Feed Configuration`
    : `Add Data Feed Configuration`;
}

export const getFlag = (currentRole, configValues) => {
  return checkForString(currentRole, DATA_OPERATIONS) &&
    configValues !== null;
}

export const isRunning = (allFeedDetails, finalValues) => {
  return allFeedDetails.data.content.find(item => item.routeName === finalValues.routeName) !== undefined;
}

export const handleUpdates = (data, config) => {
  var flag;
  if (config) {
    if (data.cronScheduler !== config.cronExpression) {
      flag = false;
    }
    else if (new Date(data.expiryDate.toString()).toLocaleDateString() !== new Date(config.expiry.toString()).toLocaleDateString()) {
      flag = false;
    }
    else if (data.filenameFormat !== config.filePattern) {
      flag = false;
    }
    else if (data.sourceHostName !== config.sourceHostName) {
      flag = false;
    }
    else if (data.sourceUsername !== config.sourceUser) {
      flag = false;
    }
    else if (data.sourceFolder !== config.sourceFolder) {
      flag = false;
    }
    else if (data.vendorRequestConfig !== config.vendorRequestConfig) {
      flag = false;
    }
    else {
      flag = true;
    }
  } else {
    flag = false;
  }

  return flag;
}

const AddConfiguration = () => {
  const params = useParams();
  const history = useHistory();
  const { Step } = Steps;
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState(false);
  const location = useLocation();
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
  useEffect(() => {
    dispatch(getConfigById(params.id));
    if (
      addDataConfigPagesAndButton &&
      addDataConfigPagesAndButton.permission === "R"
    ) {
      setCurrent(steps.length - 1);
    }
  }, []);

  useEffect(() => {
    findConfigDetails(params.id)
      .then(res => {
        if (res.data !== null) {
          setConfigData(res.data)
          setIsUpdate(true)
        }
        else {
          setConfigData(null)
          setIsUpdate(false)
        }
      })
      .catch(err => err)
  }, [])

  const previous = () => {
    if (Object.keys(configValues).length) {
      if (
        configValues["sourceProtocol"] == "SFTP" &&
        configValues["splittingRequirement"] == "Yes"
      ) {
        return current == 3 ? setCurrent(current - 1) : setCurrent(current - 2);
      } else if (
        configValues["sourceProtocol"] == "HTTPS" &&
        configValues["splittingRequirement"] == "No"
      ) {
        return current == 3 ? setCurrent(current - 2) : setCurrent(current - 1);
      } else if (
        configValues["sourceProtocol"] == "HTTPS" &&
        configValues["splittingRequirement"] == "Yes"
      ) {
        return setCurrent(current - 1);
      } else if (
        configValues["sourceProtocol"] == "SFTP" &&
        configValues["splittingRequirement"] == "No"
      ) {
        return setCurrent(current - 3);
      } else {
        if (
          configValues["sourceProtocol"] == null &&
          configValues["splittingRequirement"] == "Yes"
        ) {
          return current == 2
            ? setCurrent(current - 2)
            : current == 3
              ? setCurrent(current - 1)
              : setCurrent(current - 1);
        } else if (
          configValues["sourceProtocol"] == null &&
          configValues["splittingRequirement"] == "No"
        ) {
          return current == 3
            ? setCurrent(current - 3)
            : setCurrent(current - 1);
        }
      }
    } else {
      return current == 2 ? setCurrent(current - 2) : setCurrent(current - 1); //setCurrent(current - 1);
    }
  };
  const next = (value, formDataValues) => {
    if (value && Object.keys(formDataValues).length) {
      if (
        formDataValues["sourceProtocol"] == "SFTP" &&
        formDataValues["splittingRequirement"] == "Yes"
      ) {
        return current == 0 ? setCurrent(current + 2) : setCurrent(current + 1);
      } else if (
        configValues["sourceProtocol"] == "HTTPS" &&
        configValues["splittingRequirement"] == "No"
      ) {
        return current == 1 ? setCurrent(current + 2) : setCurrent(current + 1);
      } else if (
        formDataValues["sourceProtocol"] == "HTTPS" &&
        formDataValues["splittingRequirement"] == "Yes"
      ) {
        return setCurrent(current + 1);
      } else if (
        formDataValues["sourceProtocol"] == "SFTP" &&
        formDataValues["splittingRequirement"] == "No"
      ) {
        return setCurrent(current + 3);
      } else {
        if (value) {
          if (
            (formDataValues["sourceProtocol"] == null ||
              configValues["sourceProtocol"] == null) &&
            (formDataValues["splittingRequirement"] == "Yes" ||
              configValues["splittingRequirement"] == "Yes")
          ) {
            return current == 0
              ? setCurrent(current + 2)
              : current == 2
                ? setCurrent(current + 1)
                : setCurrent(current + 1);
          } else if (
            (formDataValues["sourceProtocol"] == null ||
              configValues["sourceProtocol"] == null) &&
            (formDataValues["splittingRequirement"] == "No" ||
              configValues["splittingRequirement"] == "No")
          ) {
            return current == 0
              ? setCurrent(current + 3)
              : setCurrent(current + 1);
          }
        }
      }
    } else {
      if (value)
        return current == 0 ? setCurrent(current + 2) : setCurrent(current + 1); //setCurrent(current + 1);
    }
    //setCurrent(current + 1);
    setFormData(value === false ? false : true);
  };

  const configValues = useSelector((state) => state.datafeedInfo.congigUi);

  const breadcrumb = [
    { name: "Entities", url: "/masterData" },
    { name: sessionStorage.getItem("feedShortName"), url: "/masterData" },
    { name: getViewName(configValues) },
  ];

  const configEdit = getFlag("currentUserRole", configData);

  const handleUpdatedData = (data, isUpdatedDataPassed) => {
    if (isUpdatedDataPassed !== true) {
      window.setTimeout(handleUpdatedData, 2000);
    }
    else {
      setFlag(handleUpdates(data, configData));
    }
  }

  const steps = [
    {
      title: "General Configuration",
      content: <GeneralConfiguration passUpdates={handleUpdatedData} isUpdate={configEdit} next={next} formData={formData} />,
    },
    {
      title: "API Configuration",
      content: (
        <ApiConfiguration next={next} formData={formData} previous={previous} />
      ),
    },
    {
      title: "Splitting Configuration",
      content: (
        <SplittingConfiguration
          next={next}
          formData={formData}
          previous={previous}
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
      sourcePort: configValues["sourcePortInteger"],
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
        configValues["configurationStatus"] === "Active" ||
          configValues["configurationStatus"] == undefined
          ? true
          : false,
      isProxyUsed: configValues["proxyRequirement"] === "Yes" ? true : false,
      proxyHost:
        configValues["proxyHostname"] != ""
          ? configValues["proxyHostname"]
          : null,
      proxyPort:
        configValues["proxyPort"] != "" ? configValues["proxyPort"] : null,
      fileSuffix:
        configValues["filenameDateSuffix"] == "Yes" ? `'.'+formatDateString('yyyyMMdd', 0)` : null,
      fileExtension: configValues["filenameExtension"], 
      isAsyncRoute: configValues["asynchronousRoute"] === "True" ? true : false,
      isChecksum: configValues["isChecksum"],
      lastUpdatedBy: localStorage.getItem("psid"),
      storageLocation:
        configValues["storageLocation"] != ""
          ? configValues["storageLocation"]
          : "",
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
        configValues["exitingSchema"] == "No" ? "" : configValues["schemaId"],
      vendorRequestConfig: configValues["vendorRequestConfig"],
    };
    /*let historyLoadDetails={
      dataFeedId:configValues["dataFeedId"],
      startDate:configValues["historicLoadStartDate"]
    }*/

    const allDataFeedDetails = await dispatch(checkIfRouteIsRunning());

    //debugger;
    if (configValues["splittingRequirement"] == "Yes") {
      if (configValues["exitingSchema"] == "Yes") {
        const res = await dispatch(startConfigUi(isUpdate, finalValues, isRunning(allDataFeedDetails, finalValues)));
        if (res && res.data) {
          dispatch(clearConfigData());
          history.push("/masterData");
        }
      } else {
        //console.log("upload required for schema")
        const splittingSchemaDetail = {
          schema: configValues["schemaDataObj"],
          schemaMetaData: configValues["schemaMetaDataObj"],
        };
        //console.log("schemadata Obj",splittingSchemaDetail);
        const resSplit = await dispatch(
          startConfigUiSplit(splittingSchemaDetail)
        );
        //console.log("response",resSplit);
        if (resSplit && resSplit.schemaName != null) {
          finalValues.schemaId = resSplit.schemaName;
          const res = await dispatch(startConfigUi(isUpdate, finalValues, isRunning(allDataFeedDetails, finalValues)));
          if (res && res.data) {
            dispatch(clearConfigData());
            history.push("/masterData");
          }
        }
      }
    } else {
      finalValues.schemaId = "";
      finalValues.splittingSourceExpression = `direct://${finalValues.routeName}`;
      finalValues.splittingPathExpression = null;
      finalValues.splitterCanonicalClass = null;
      const res = await dispatch(startConfigUi(isUpdate, finalValues, isRunning(allDataFeedDetails, finalValues)));
      if (res && res.data.status !== "EXCEPTION") {
        dispatch(clearConfigData());
        history.push("/masterData");
      }
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

  return (
    <div id="main">
      <Headers />
      <div className="header-one" style={{ height: "auto" }}>
        <div className="breadcrumb-parent">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-top-parent">
            <Button type="default" onClick={() => cancelHandler()}>
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={
                addConfigButton ||
                current != steps.length - 1 ||
                flag
              }
              onClick={submitConfig}
            >
              Submit
            </Button>
          </div>
        </div>

        <PageHeader
          title={getOperationText()}
          ghost={false}
          className="pt-10 pb-0"
          onBack={() => {
            dispatch(clearConfigData());
            history.push("/masterData");
          }}
        >
          <Descriptions
            className="dashboard-vendors-descriptions config"
            size="default"
            title=""
            column={4}
          >
            <Descriptions.Item
              label={<b>Data Feed ID </b>}
              style={{ width: "30%" }}
            >
              {configValues && configValues["dataFeedId"]
                ? configValues["dataFeedId"]
                : params.id}
            </Descriptions.Item>
            <Descriptions.Item label={<b>Data Feed Status </b>}>
              {sessionStorage.getItem("feedStatus") === "Active" ? (
                <Badge className="style-badge" status="success" text="Active" />
              ) : (
                <Badge
                  className="style-badge"
                  status="error"
                  text={sessionStorage.getItem("feedStatus")}
                />
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<b>Configuration created on </b>}>
              {configValues && configValues["configurationCreatedOn"]
                ? moment(configValues["configurationCreatedOn"]).format(
                  "DD MMM YYYY"
                )
                : moment(new Date()).format("DD MMM YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label={<b>Updated on </b>}>
              {configValues && configValues["lastUpdatedOn"]
                ? moment(configValues["lastUpdatedOn"]).format(
                  "DD MMM YYYY"
                )
                : "NA"}
            </Descriptions.Item>

            {configValues && configValues["dataFeedConfigurationId"] ? (
              <Descriptions.Item label={<b>Data Feed Configuration ID </b>}>
                {configValues && configValues["dataFeedConfigurationId"]
                  ? configValues["dataFeedConfigurationId"]
                  : params.id}
              </Descriptions.Item>
            ) : (
              ""
            )}
            <Descriptions.Item label={<b>Configuration Status</b>}>
              {configValues && configValues["configurationStatus"] ? (
                configValues["configurationStatus"] === "Active" ? (
                  <Badge
                    className="style-badge"
                    status="success"
                    text="Active"
                  />
                ) : (
                  <Badge
                    className="style-badge"
                    status="error"
                    text="Inactive"
                  />
                )
              ) : (
                "NA"
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<b>Created by </b>}>
              {configValues && configValues["createdBy"]
                ? configValues["createdBy"]
                : localStorage.getItem("psid")}
            </Descriptions.Item>
            <Descriptions.Item label={<b>Updated by </b>}>
              {configValues && configValues["lastUpdatedBy"]
                ? configValues["lastUpdatedBy"]
                : "NA"}
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
      </div>

      <div className="form-layout content-wrapper">
        <Steps current={current} size="small">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="dashboard-configurations">
          <div className="steps-content">{steps[current].content}</div>
          <div className="steps-action" style={{ padding: "10px 0" }}>
            {current > 0 && (
              <Button
                style={{ margin: "0 8px" }}
                disabled={addConfigButton}
                onClick={() => previous()}
              >
                Previous
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConfiguration;