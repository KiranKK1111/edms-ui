import { useSelector } from "react-redux";
import { Box, Chip, Divider, Grid } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import dayjs from "../../design-system/dayjs";
import { toast as message } from "../../design-system/toast";
import "./ReviewSubmit.css";
import { useEffect, useState } from "react";
import { checkForString } from "../../utils/warningUtils";
import { DATA_OPERATIONS } from "../../utils/Constants";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const ReviewItem = ({ label, children, size }) => (
  <Grid size={size}>
    <span className="label-review">{label}:</span> {children}
  </Grid>
);

const ReviewSubmit = (props) => {
  const [loading, setLoading] = useState();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const loadingConfig = useSelector((state) => state.datafeedInfo);
  let splitterCanonicalClass;
  const key = "updatable";
  useEffect(() => {
    if (loadingConfig.loadingConfig) {
      window.setTimeout(loadingConfig.loadingConfig, 100);
    } else {
      if (
        !checkForString("currentUserRole", DATA_OPERATIONS) &&
        isEmpty(loadingConfig.congigUi)
      ) {
        message.warning("No Configuration Data");
      }
    }
  }, [loadingConfig]);
  const mainConfig_set1 = [
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
    {
      label: "On-Demand Vendor request configuration",
      value: "vendorRequestConfig",
      show: true,
    },
  ];

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
    { label: "Request parameters", value: "requestParameter", type: "text" },
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
      value: "userName",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Password property",
      value: "passwordProperty",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Content type",
      value: "contentType",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Request body",
      value: "requestBodyAuth",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Token response key",
      value: "tokenResponseKey",
      show: configValues["tokenReq"] == "Yes" ? true : false,
    },
    {
      label: "Token prefix",
      value: "tokenPrefix",
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
      <Box
        className="label-wrap"
        style={{
          overflowWrap: "break-word",
          wordWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        <>
          <Grid container spacing={2}>
            {mainConfig_set1.map((item) =>
              item.value == "storageLocation" ? (
                <ReviewItem
                  key={item.label}
                  size={8}
                  label={item.label}
                >
                  {configValues[item.value]}
                </ReviewItem>
              ) : (
                <ReviewItem key={item.label} size={4} label={item.label}>
                  {item.value === "startDate" || item.value === "expiryDate"
                    ? dayjs(new Date(configValues[item.value])).format(
                        "DD MMM YYYY"
                      )
                    : configValues[item.value]}
                </ReviewItem>
              )
            )}
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            {mainConfig_set2.map((item) => (
              <ReviewItem
                key={item.label}
                size={item.value == "sourceFolder" ? 8 : 4}
                label={item.label}
              >
                {configValues[item.value]}
              </ReviewItem>
            ))}
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            {mainConfig_set3.map((item) =>
              item.value == "filenameFormat" ? (
                <ReviewItem key={item.label} size={8} label={item.label}>
                  {configValues[item.value]}
                </ReviewItem>
              ) : (
                <ReviewItem key={item.label} size={4} label={item.label}>
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
                </ReviewItem>
              )
            )}
          </Grid>
          <Divider sx={{ my: 1 }} />
          <h3>Proxy</h3>
          <Grid container spacing={2}>
            {proxy.map((item) =>
              item.show ? (
                <ReviewItem key={item.label} size={4} label={item.label}>
                  {configValues[item.value]}
                </ReviewItem>
              ) : (
                ""
              )
            )}
          </Grid>
          <Divider sx={{ my: 1 }} />
          <h3>On-Demand Vendor request</h3>
          <Grid container spacing={2}>
            {vendorRequest.map((item) =>
              item.show ? (
                <ReviewItem key={item.label} size={4} label={item.label}>
                  {item.value == "vendorRequestConfig"
                    ? configValues[item.value] == "Y"
                      ? "Yes"
                      : "No"
                    : configValues[item.value]}
                </ReviewItem>
              ) : (
                ""
              )
            )}
          </Grid>
          <Divider sx={{ my: 1 }} />
          {configValues["histLoad"] == "Yes" ? (
            <>
              <h3>Historic Load</h3>
              <Grid container spacing={2}>
                {history.map((item) =>
                  item.show ? (
                    <ReviewItem key={item.label} size={4} label={item.label}>
                      {item.value == "historicLoadStartDate"
                        ? dayjs(new Date(configValues[item.value])).format(
                            "DD MMM YYYY"
                          )
                        : configValues[item.value]}
                    </ReviewItem>
                  ) : (
                    ""
                  )
                )}
              </Grid>
              <Divider sx={{ my: 1 }} />
            </>
          ) : (
            ""
          )}
        </>
        {configValues["sourceProtocol"] == "HTTPS" ? (
          <>
            <h3>Request Details</h3>
            <Grid container spacing={2}>
              {apiConfiguration.map((item) => (
                <ReviewItem key={item.label} size={4} label={item.label}>
                  {configValues[item.value]}
                </ReviewItem>
              ))}
            </Grid>
            {/* Request body — show file name chip if uploaded via file, else show inline text */}
            <Box sx={{ mt: 1, mb: 1 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <span className="label-review">Request body:</span>{" "}
                  {configValues["requestBodyFileName"] ? (
                    <Chip
                      size="small"
                      icon={<AttachFileIcon fontSize="small" />}
                      label={configValues["requestBodyFileName"]}
                      variant="outlined"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  ) : configValues["requestBody"] ? (
                    <Box
                      component="pre"
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: "var(--color-bg-subtle, #f6f8fa)",
                        border: "1px solid var(--color-border-secondary)",
                        borderRadius: 1,
                        fontSize: 12,
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        maxHeight: 200,
                      }}
                    >
                      {configValues["requestBody"]}
                    </Box>
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                  )}
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 1 }} />
            <h3>Authentication Details</h3>
            <Grid container spacing={2}>
              {authConfiguration.map((item) =>
                item.show ? (
                  <ReviewItem key={item.label} size={4} label={item.label}>
                    {configValues[item.value]}
                  </ReviewItem>
                ) : (
                  ""
                )
              )}
            </Grid>
            <Divider sx={{ my: 1 }} />
          </>
        ) : (
          ""
        )}
        {configValues["splittingRequirement"] === "Yes" ? (
          <>
            <h3>Splitting Configuration</h3>
            <Grid container spacing={2}>
              {splitConfigurationSchema.map((item) =>
                item.show ? (
                  <ReviewItem key={item.label} size={6} label={item.label}>
                    {configValues[item.value]}
                  </ReviewItem>
                ) : (
                  ""
                )
              )}
            </Grid>
            <Grid container spacing={2}>
              {splitConfiguration.map((item) =>
                item.show ? (
                  <ReviewItem key={item.label} size={6} label={item.label}>
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
                  </ReviewItem>
                ) : (
                  ""
                )
              )}
            </Grid>
          </>
        ) : (
          ""
        )}
      </Box>
    </div>
  );
};

export default ReviewSubmit;
