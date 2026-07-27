import React, { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, Divider, Grid } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { FieldLabel, FormField, imperativeConfirm } from "../../design-system";
import { toast as message } from "../../design-system/toast";
import "./GeneralConfiguration.css";
import { configUiFn } from "../../store/actions/datafeedAction";
import { tokenEx } from "../../test/regEx";

const REQUEST_METHOD_OPTIONS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
];

const TOKEN_REQ_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const ApiConfiguration = (props) => {
  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const [requestMethod, setRequestMethod] = useState("POST");
  const [tokenReq, setTokenReq] = useState("No");

  const [uploadOn, setUploadOn] = useState(false);
  const [editOn, setEditOn] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showFileNew, setShowFileNew] = useState(false);

  const [requestBodyObj, setRequestBodyObj] = useState();
  const [requestBodyFileName, setRequestBodyFileName] = useState("");

  const { control, watch, setValue, getValues, trigger } = useForm({
    defaultValues: {
      requestMethod: "POST",
      requestParameter: "",
      requestHeaders: "",
      requestBody: "",
      tokenReq: "No",
      userName: "",
      grantType: "",
      tokenURL: "",
      passwordProperty: "",
      contentType: "",
      requestBodyAuth: "",
      tokenResponseKey: "",
      tokenPrefix: "",
    },
    mode: "onChange",
  });

  const tokenReqWatch = watch("tokenReq");

  const isTokenReq = (event) => {
    setTokenReq(event.target.value);
  };
  const isRequestMethod = (event) => {
    setRequestMethod(event.target.value);
  };
  const handleFile = (e) => {
    setRequestBodyObj(e.target.files[0]);
    setShowFileNew(true);
    setUploadOn(true);
  };

  // Replaces antd Upload beforeUpload — read file content into the requestBody field.
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const validTypes = ["text/plain", "text/csv", "application/json", ""];
    const validExts = /\.(json|txt|csv)$/i;
    if (!validExts.test(file.name)) {
      message.error("Please upload a .json or .txt file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setValue("requestBody", content);
      setRequestBodyFileName(file.name);
      setRequestBodyObj(file);
      setShowFileNew(true);
      setUploadOn(true);
    };
    reader.onerror = () => {
      message.error("Failed to read file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const bindData = (data) => {
    const items = Object.keys(data);
    if (items.length) {
      items.forEach((subItem) => {
        if (subItem == "requestBodyObj") {
          setRequestBodyObj(data[subItem]);
          setShowFileNew(true);
        } else if (subItem == "requestBodyFileName") {
          setRequestBodyFileName(data[subItem] || "");
          if (data[subItem]) setUploadOn(true);
        } else if (subItem == "requestMethod") {
          setRequestMethod(data[subItem] != "" ? data[subItem] : "POST");
        }
        setValue(subItem, data[subItem]);
      });
    }
  };

  useEffect(() => {
    if (!props.formData && Object.keys(configValues).length > 0) {
      setValue(
        "requestMethod",
        configValues.hasOwnProperty("requestMethod")
          ? configValues["requestMethod"]
          : "POST"
      );
      setValue(
        "tokenReq",
        configValues.hasOwnProperty("tokenReq")
          ? configValues["tokenReq"]
          : "No"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Object.keys(configValues).length) {
      bindData(configValues);
      setTokenReq(configValues.tokenReq);
      if (configValues.requestBody != "") {
        setUploadOn(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configValues]);

  const onFinish = (values) => {
    if (values["tokenReq"] === "No") {
      values.tokenURL = "";
      values.userName = "";
      values.passwordProperty = "";
      values.contentType = "";
      values.requestBodyAuth = "";
      values.tokenResponseKey = "";
      values.tokenPrefix = "";
    }
    values.requestBodyObj = requestBodyObj;
    values.requestBodyFileName = requestBodyFileName;
    let finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
  };

  useEffect(() => {
    if (props.formData) {
      trigger().then((ok) => {
        if (ok) onFinish(getValues());
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData]);

  // Parent flips `prevData` when Previous is clicked: persist the draft as-is
  // (no validation, no field clearing — possibly incomplete input must survive
  // the round trip) and then navigate back.
  useEffect(() => {
    if (props.prevData) {
      const values = getValues();
      values.requestBodyObj = requestBodyObj;
      values.requestBodyFileName = requestBodyFileName;
      const finalData = { ...configValues, ...values };
      dispatch(configUiFn(finalData));
      props.previous(true, finalData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prevData]);

  const handleDeleteFileUpload = () => {
    setUploadOn(false);
    setShowFileNew(false);
    setRequestBodyObj();
    setRequestBodyFileName("");
    setValue("requestBody", "");
  };

  const handleDeleteFile = async (record, type) => {
    if (type === "upload") {
      const ok = await imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file is already existing. Replace? ",
        okText: "OK",
        okColor: "error",
      });
      if (ok) {
        handleDeleteFileUpload();
      } else {
        setUploadOn(true);
        setShowFileNew(true);
      }
    } else {
      const ok = await imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file/link is already existing. Replace? ",
        okText: "OK",
        okColor: "error",
      });
      if (ok) {
        setShowPdf(false);
        setUploadOn(false);
      } else {
        setShowPdf(true);
        setUploadOn(false);
      }
    }
  };

  const uploadDisabled =
    (showPdf || uploadOn || showFileNew) &&
    requestBodyObj &&
    requestBodyObj.name;

  return (
    <Box
      component="form"
      noValidate
      className="config-form"
      style={{
        overflowWrap: "break-word",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }}
    >
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Request Details
          </h3>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel text="Request method" tooltip="JSON request method." />
          <FormField
            name="requestMethod"
            type="radio"
            row
            control={control}
            onChange={isRequestMethod}
            options={REQUEST_METHOD_OPTIONS}
          />

          <Box sx={{ mt: 2 }}>
            <FieldLabel text="Request parameters" />
            <FormField name="requestParameter" control={control} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Request body"
            tooltip="Enter the request body as JSON text, or upload a .json/.txt file. When a file is uploaded its content is read and stored. Either option is optional."
          />
          <Box sx={{ mb: 1 }}>
            <FormField
              name="requestBody"
              type="textarea"
              rows={3}
              control={control}
              placeholder={uploadOn && requestBodyFileName ? `Content loaded from: ${requestBodyFileName}` : "Enter request body (JSON), or upload a file below"}
              inputProps={{ maxLength: 5000, readOnly: !!(uploadOn && requestBodyFileName) }}
              sx={uploadOn && requestBodyFileName ? { bgcolor: "var(--color-bg-subtle, #f6f8fa)" } : {}}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={!!(uploadOn && requestBodyFileName)}
              >
                Upload JSON / Text file
                <input
                  type="file"
                  hidden
                  accept=".json,.txt"
                  onChange={handleFileChange}
                />
              </Button>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Optional — upload a .json or .txt file to populate the request body
              </div>
            </Box>
            {showFileNew && requestBodyFileName && (
              <Button
                type="button"
                className="link-button talign"
                onClick={() => handleDeleteFile(requestBodyObj, "upload")}
              >
                <strong
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                  {requestBodyFileName}
                  <DeleteIcon
                    fontSize="small"
                    style={{
                      border: "1px solid var(--color-error)",
                      color: "var(--color-error)",
                    }}
                  />
                </strong>
              </Button>
            )}
          </Box>

          <FieldLabel text="Request headers" />
          <FormField
            name="requestHeaders"
            type="textarea"
            rows={3}
            control={control}
            inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Authentication Details
          </h3>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Token requirement"
            tooltip="Enter yes if a token is required."
          />
          <FormField
            name="tokenReq"
            type="radio"
            row
            control={control}
            onChange={isTokenReq}
            options={TOKEN_REQ_OPTIONS}
          />
          {tokenReqWatch === "Yes" ? (
            <Box sx={{ mt: 2 }}>
              <FieldLabel
                text="Username"
                tooltip="Username to be used for token authentication."
              />
              <FormField name="userName" control={control} />
              <Box sx={{ mt: 2 }}>
                <FieldLabel
                  text="Grant type"
                  tooltip="The OAuth grant type used for token authentication."
                />
                <FormField name="grantType" control={control} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <FieldLabel
                  text="Token response key"
                  tooltip="The key in the token endpoint response JSON that contains the access token (e.g. 'access_token')."
                />
                <FormField name="tokenResponseKey" control={control} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <FieldLabel
                  text="Token prefix"
                  tooltip="The prefix prepended to the token value in the Authorization header (e.g. 'Bearer')."
                />
                <FormField name="tokenPrefix" control={control} />
              </Box>
            </Box>
          ) : (
            ""
          )}
        </Grid>
        {tokenReqWatch === "Yes" ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <FieldLabel
              text="Token URL"
              tooltip={`The token URL to be used.  For example example: "https://selectapi.datascope.refinitiv.com/RestApi/v1/Authentication/RequestToken"`}
            />
            <FormField
              name="tokenURL"
              control={control}
              rules={{
                pattern: {
                  value: new RegExp(tokenEx),
                  message: "Not a valid Token URL",
                },
              }}
            />
            <Box sx={{ mt: 2 }}>
              <FieldLabel
                text="Password property"
                tooltip="The password property used to connect to the password vault.  You will need to get this from the dev team."
              />
              <FormField name="passwordProperty" control={control} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <FieldLabel
                text="Content type"
                tooltip="The Content-Type header value for the token request (e.g. 'application/json', 'application/x-www-form-urlencoded')."
              />
              <FormField name="contentType" control={control} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <FieldLabel
                text="Request body"
                tooltip="The request body sent to the token endpoint to obtain an access token."
              />
              <FormField
                name="requestBodyAuth"
                type="textarea"
                rows={3}
                control={control}
                inputProps={{ maxLength: 2000 }}
              />
            </Box>
          </Grid>
        ) : (
          ""
        )}
      </Grid>
    </Box>
  );
};

export default memo(ApiConfiguration);
