import { useSelector } from "react-redux";
import { Col, Row, Divider, Form, message } from "antd";
import lo from "lodash";
import moment from "moment";
import "./ReviewSubmit.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { checkForString } from "../../utils/warningUtils";
import { DATA_OPERATIONS } from "../../utils/Constants";
const ReviewSubmit = (props) => {
  const [loading, setLoading] = useState();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const location = useLocation();
  const loadingConfig = useSelector(
    (state) => state.datafeedInfo
  );
  let splitterCanonicalClass;
  const layout = {
    // labelCol: {
    // span: 10,
    //},
    wrapperCol: {
      span: 14,
    },
    labelWrap: true,
  };
  const key = "updatable";
  useEffect(() => {
    if (loadingConfig.loadingConfig) {
      window.setTimeout(loadingConfig.loadingConfig, 100);
    }
    else {
      if (!checkForString("currentUserRole", DATA_OPERATIONS) && lo.isEmpty(loadingConfig.congigUi)) {
        message.warning({
          content: "No Configuration Data",
          key,
        });
      }
    }
  }, [loadingConfig]);
  const mainConfig_set1 = [
    //"dataFeedId",
    //"dataFeedConfigurationId",
    //"storageLocation",
    //"configurationCreatedOn",
    //"createdBy",
    { label: "Start date", value: "startDate" },
    { label: "Expiry date", value: "expiryDate" },
    { label: "Key location", value: "keyLocation" },
    { label: "Cron scheduler", value: "cronScheduler" },
    { label: "Storage location", value: "storageLocation" },
  ];

  const mainConfig_set2 = [
    { label: "Source processor", value: "sourceProcessor" },
    { label: "Source hostname", value: "sourceHostName" },
    { label: "Source port", value: "sourcePortInteger" },
    { label: "Source protocol", value: "sourceProtocol" },
    { label: "Source username", value: "sourceUsername" },
    { label: "Source password property", value: "sourcePasswordProperty" },
    { label: "Source folder", value: "sourceFolder" },
  ];

  const mainConfig_set3 = [
    { label: "Filename format", value: "filenameFormat" },
    { label: "Filename date suffix", value: "filenameDateSuffix" },
    { label: "Route name", value: "routeName" },
    { label: "Route type", value: "routeType" },
    { label: "Destination expression", value: "destinationExpression" },
    { label: "Splitting requirement", value: "splittingRequirement" },
    { label: "Asynchronous route", value: "asynchronousRoute" },
    { label: "Checksum", value: "isChecksum" },
  ];

  const proxy = [
    { label: "Proxy requirement", value: "proxyRequirement", show: true },
    {
      label: "Proxy hostname",
      value: "proxyHostname",
      show: configValues["proxyRequirement"] == "Yes" ? true : false,
    },
    {
      label: "Proxy port",
      value: "proxyPort",
      show: configValues["proxyRequirement"] == "Yes" ? true : false,
    },
  ];

  const vendorRequest = [
    { label: "On-Demand Vendor request configuration", value: "vendorRequestConfig", show: true },
  ]

  const history = [
    { label: "History load required", value: "histLoad", show: true },
    {
      label: "History load details ID",
      value: "historyLoadDetailsID",
      show: configValues["histLoad"] == "Yes" ? true : false,
    },
    {
      label: "Historic load start date",
      value: "historicLoadStartDate",
      show: configValues["histLoad"] == "Yes" ? true : false,
    },
    {
      label: "List of files",
      value: "listOfFiles",
      show: configValues["histLoad"] == "Yes" ? true : false,
    },
  ];

  const apiConfiguration = [
    { label: "Request method", value: "requestMethod", type: "text" },
    { label: "Request body", value: "requestBodyObj", type: "file" },
    { label: "Request parameters", value: "requestParameters", type: "text" },
    { label: "Request headers", value: "requestHeaders", type: "text" },
  ];

  const authConfiguration = [
    { label: "Token requirement", value: "tokenReq", show: true },
    {
      label: "Token URL",
      value: "tokenURL",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Username",
      value: "username",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Password property",
      value: "passwordProperty",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
  ];

  const splitConfigurationSchema = [
    {
      label: "Existing schema",
      value: "exitingSchema",
      show: true,
      type: "text",
    },
  ];

  const splitConfiguration = [
    { label: "Schema ID", value: "schemaId", show: true, type: "text" },
    { label: "Schema data", value: "schemaDataObj", show: true, type: "file" },
    { label: "Data format", value: "dataFeedType", show: true, type: "text" },
    {
      label: "Schema metadata",
      value: "schemaMetaDataObj",
      show: true,
      type: "file",
    },
    {
      label: "Splitting path expression",
      value: "splittingPathExpression",
      show: true,
      type: "text",
    },
    {
      label: "Splitting source expression",
      value: "splittingSourceExpression",
      show: true,
      type: "text",
    },
  ];

  const getDataFeedTypeText = () => {
    if (
      configValues["dataFeedType"] ==
      "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute" ||
      configValues["dataFeedType"] == "xml"
    ) {
      splitterCanonicalClass = "xml";
    } else if (
      configValues["dataFeedType"] ==
      "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute" ||
      configValues["dataFeedType"] == "json"
    ) {
      splitterCanonicalClass = "json";
    } else if (
      configValues["dataFeedType"] ==
      "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute" ||
      configValues["dataFeedType"] == "xpath"
    ) {
      splitterCanonicalClass = "xpath";
    } else {
      splitterCanonicalClass = "csv";
    }
    return splitterCanonicalClass;
  };

  return (
    <div className="review-submit">
      <h3>Main Configuration</h3>
      {/*configValues && Object.keys(configValues).length && (*/}
      <Form
        name="br-one"
        {...layout}
        className="label-wrap"
        style={{
          overflowWrap: "break-word",
          wordWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        <>
          <Row gutter={[40, 0]}>
            {mainConfig_set1.map((item) => {
              return item.value == "storageLocation" ? (
                <Col key={item.label} span={16} className="storageLocation">
                  {/*<span className="label-review">
              {" "}
              {item.label}:
          </span>*/}
                  <Form.Item name={item.value} label={item.label}>
                    {configValues[item.value]}
                  </Form.Item>
                </Col>
              ) : (
                <Col key={item.label} span={8}>
                  <Form.Item name={item.value} label={item.label}>
                    {item.value === "startDate" || item.value === "expiryDate"
                      ? moment(new Date(configValues[item.value])).format(
                        "DD MMM YYYY"
                      )
                      : configValues[item.value]}
                  </Form.Item>
                  {/*<span className="label-review">
                {" "}
                {item.label}:
                </span>
              {item.value === "startDate" || item.value === "expiryDate"
                ? moment(new Date(configValues[item.value])).format("DD MMM YYYY")
          : configValues[item.value]}*/}
                </Col>
              )
            }
            )}
          </Row>
          <Divider plain></Divider>
          <Row gutter={[40, 0]}>
            {mainConfig_set2.map((item) => (
              <Col
                key={item.label}
                span={item.value == "sourceFolder" ? 16 : 8}
                className={item.value == "sourceFolder" ? "sourcefolder" : ""}
              >
                <Form.Item name={item.value} label={item.label}>
                  {configValues[item.value]}
                </Form.Item>
                {/*<span className="label-review"> {item.label}:</span>
              {configValues[item.value]}*/}
              </Col>
            ))}
          </Row>
          <Divider plain></Divider>
          <Row gutter={[40, 0]}>
            {mainConfig_set3.map((item) =>
              item.value == "filenameFormat" ? (
                <Col key={item.label} span={16} className="sourcefolder">
                  <Form.Item name={item.value} label={item.label}>
                    {configValues[item.value]}
                  </Form.Item>
                  {/*<span className="label-review"> {item.label}:</span>
            {configValues[item.value]}*/}
                </Col>
              ) : (
                <Col key={item.label} span={8}>
                  <Form.Item name={item.value} label={item.label}>
                    {item.value == "routeType"
                      ? configValues[item.value] ==
                        "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute" ||
                        configValues[item.value] == "Scheduled"
                        ? "Scheduled"
                        : "One-time"
                      : item.value == "splittingRequirement"
                        ? configValues[item.value] == "Yes"
                          ? "Applicable"
                          : "Not applicable"
                        : configValues[item.value] === true
                          ? "True"
                          : configValues[item.value] === false
                            ? "False"
                            : configValues[item.value]}
                  </Form.Item>
                  {/*<span className="label-review"> {item.label}:</span>
              {item.value=="routeType"?(configValues[item.value]=="com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute" || configValues[item.value]=="Scheduled"?"Scheduled":"One-time"):item.value=="splittingRequirement"?(configValues[item.value]=="Yes"?"Applicable":"Not applicable"):configValues[item.value]}
            */}
                </Col>
              )
            )}
          </Row>
          <Divider plain></Divider>
          <h3>Proxy</h3>
          <Row gutter={[40, 0]}>
            {proxy.map((item) =>
              item.show ? (
                <Col key={item.label} span={8}>
                  <Form.Item name={item.value} label={item.label}>
                    {configValues[item.value]}
                  </Form.Item>
                  {/*<span className="label-review"> {item.label}:</span>
              {configValues[item.value]}*/}
                </Col>
              ) : (
                ""
              )
            )}
          </Row>
          <Divider plain></Divider>
          <h3>On-Demand Vendor request</h3>
          <Row gutter={[40, 0]}>
            {vendorRequest.map((item) =>
              item.show ? (
                <Col key={item.label} span={8}>
                  <Form.Item name={item.value} label={item.label}>
                    {item.value == "vendorRequestConfig" ? configValues[item.value] == "Y"
                      ? "Yes"
                      : "No" : configValues[item.value]}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )
            )}
          </Row>
          <Divider plain></Divider>
          {configValues["histLoad"] == "Yes" ? (
            <>
              <h3>Historic Load</h3>
              <Row gutter={[40, 0]}>
                {history.map((item) =>
                  item.show ? (
                    <Col span={8}>
                      <Form.Item name={item.value} label={item.label}>
                        {item.value == "historicLoadStartDate"
                          ? moment(new Date(configValues[item.value])).format(
                            "DD MMM YYYY"
                          )
                          : configValues[item.value]}
                      </Form.Item>
                      {/*<span className="label-review"> {item.label}:</span>
              {item.value=="historicLoadStartDate"?moment(new Date(configValues[item.value])).format("DD MMM YYYY"):configValues[item.value]}*/}
                    </Col>
                  ) : (
                    ""
                  )
                )}
              </Row>
              <Divider plain></Divider>
            </>
          ) : (
            ""
          )}
        </>
        {configValues["sourceProtocol"] == "HTTPS" ? (
          <>
            <h3>Request Details</h3>
            <Row gutter={[40, 0]}>
              {apiConfiguration.map((item) => (
                <Col span={8}>
                  <Form.Item name={item.value} label={item.label}>
                    {/*<span className="label-review"> {item.label}:</span>*/}
                    {item.type == "file"
                      ? configValues[item.value].name
                      : configValues[item.value]}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Divider plain></Divider>
            <h3>Authentication Details</h3>
            <Row gutter={[40, 0]}>
              {authConfiguration.map((item) =>
                item.show ? (
                  <Col span={8}>
                    <span className="label-review"> {item.label}:</span>
                    {configValues[item.value]}
                  </Col>
                ) : (
                  ""
                )
              )}
            </Row>
            <Divider plain></Divider>
          </>
        ) : (
          ""
        )}
        {configValues["splittingRequirement"] === "Yes" ? (
          <>
            <h3>Splitting Configuration</h3>
            <Row gutter={[40, 0]}>
              {splitConfigurationSchema.map((item) =>
                item.show ? (
                  <Col span={12}>
                    <Form.Item name={item.value} label={item.label}>
                      {/*<span className="label-review"> {item.label}:</span>*/}
                      {configValues[item.value]}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )
              )}
            </Row>
            <Row gutter={[40, 0]}>
              {splitConfiguration.map((item) =>
                item.show ? (
                  <Col span={12}>
                    <Form.Item name={item.value} label={item.label}>
                      {/*<span className="label-review"> {item.label}:</span>*/}
                      {item.type === "file"
                        ? configValues[item.value] &&
                          Object.keys(configValues[item.value]).length
                          ? configValues[item.value].name
                          : ""
                        : item.value == "dataFeedType"
                          ? getDataFeedTypeText(item.value)
                          : item.value == "schemaId"
                            ? configValues["exitingSchema"] == "No"
                              ? ""
                              : configValues[item.value]
                            : configValues[item.value]}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )
              )}
            </Row>
          </>
        ) : (
          ""
        )}
      </Form>

      {/*})}*/}
    </div>
  );
};

export default ReviewSubmit;