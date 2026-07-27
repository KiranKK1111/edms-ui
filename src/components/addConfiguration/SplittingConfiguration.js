import React, { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, Grid } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { FieldLabel, FormField, imperativeConfirm } from "../../design-system";
import { toast as message } from "../../design-system/toast";
import "./SplittingConfiguration.css";
import { configUiFn, getSchemasID } from "../../store/actions/datafeedAction";

const DEFAULT_DATAFEED_TYPE =
  "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute";

const EXISTING_SCHEMA_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const DATAFEED_TYPE_OPTIONS = [
  { value: "com.scb.edms.edmsdataflowsvc.routes.FundamentalsRoute", label: "xml" },
  { value: "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute", label: "json" },
  { value: "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute", label: "xpath" },
  { value: "com.scb.edms.edmsdataflowsvc.routes.CSVInitialRoute", label: "csv" },
];

// Reject whitespace-only input (parity with the old antd validator).
const noWhitespace = (value) =>
  /^\s+$/.test(value) ? "Not a valid input" : true;

const SplittingConfiguration = (props) => {
  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);
  const [exitingSchema, setExitingSchema] = useState("No");
  const [schemaId, setSchemaId] = useState("NA");
  const [dataFeedType, setDataFeedType] = useState(DEFAULT_DATAFEED_TYPE);
  const [uploadSchemaDataOn, setUploadSchemaDataOn] = useState(false);
  const [uploadSchemaMetaDataOn, setUploadSchemaMetaDataOn] = useState(false);

  const [editSchemaDataOn, setEditSchemaDataOn] = useState(false);
  const [editSchemaMetaDataOn, setEditSchemaMetaDataOn] = useState(false);
  const [showSchemaDataPdf, setShowSchemaDataPdf] = useState(false);
  const [showSchemaMetaDataPdf, setShowSchemaMetaDataPdf] = useState(false);
  const [showSchemaDataFileNew, setShowSchemaDataFileNew] = useState(false);
  const [showSchemaMetaDataFileNew, setShowSchemaMetaDataFileNew] =
    useState(false);
  const [schemaDataObj, setSchemaDataObj] = useState();
  const [schemaMetaDataObj, setSchemaMetaDataObj] = useState();

  const { control, watch, setValue, getValues, trigger } = useForm({
    defaultValues: {
      exitingSchema: "No",
      schemaId: "NA",
      dataFeedType: DEFAULT_DATAFEED_TYPE,
      splittingPathExpression: "",
      splittingSourceExpression: "",
    },
    mode: "onChange",
  });

  const exitingSchemaWatch = watch("exitingSchema");

  useEffect(() => {
    if (!props.formData && Object.keys(configValues).length > 0) {
      let dataFeedTypeText =
        configValues.hasOwnProperty("splitterCanonicalClass") ||
          configValues.hasOwnProperty("dataFeedType")
          ? configValues["splitterCanonicalClass"] != undefined &&
            configValues["splitterCanonicalClass"] != "string"
            ? configValues["splitterCanonicalClass"]
            : configValues["dataFeedType"] != undefined &&
              configValues["dataFeedType"] != "string"
              ? configValues["dataFeedType"]
              : DEFAULT_DATAFEED_TYPE
          : DEFAULT_DATAFEED_TYPE;
      setValue(
        "exitingSchema",
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string" &&
          configValues["schemaId"] != "NA" &&
          configValues["schemaId"] != null
          ? "Yes"
          : "No"
      );
      setValue("dataFeedType", dataFeedTypeText);
      setValue(
        "schemaId",
        configValues.hasOwnProperty("schemaId")
          ? configValues["schemaId"] != undefined &&
            configValues["schemaId"] != "string"
            ? configValues["schemaId"]
            : "NA"
          : "NA"
      );
      setDataFeedType(dataFeedTypeText);
      setExitingSchema(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string" &&
          configValues["schemaId"] != "NA" &&
          configValues["schemaId"] != null
          ? "Yes"
          : "No"
      );
      dispatch(getSchemasID());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schemas = useSelector((state) => state.datafeedInfo.allSchemas);

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
  // (no validation — possibly incomplete input must survive the round trip)
  // and then navigate back.
  useEffect(() => {
    if (props.prevData) {
      const values = getValues();
      values.schemaDataObj = schemaDataObj != undefined ? schemaDataObj : {};
      values.schemaMetaDataObj =
        schemaMetaDataObj != undefined ? schemaMetaDataObj : {};
      const finalData = { ...configValues, ...values };
      dispatch(configUiFn(finalData));
      props.previous(true, finalData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prevData]);

  const bindData = (data) => {
    const items = Object.keys(data);
    if (items.length) {
      items.forEach((subItem) => {
        if (subItem == "schemaDataObj") {
          setSchemaDataObj(data[subItem]);
          setShowSchemaDataFileNew(true);
        } else if (subItem == "schemaMetaDataObj") {
          setSchemaMetaDataObj(data[subItem]);
          setShowSchemaMetaDataFileNew(true);
        } else if (subItem == "splitterCanonicalClass") {
          setDataFeedType(data[subItem]);
        } else if (subItem == "schemaId") {
          setSchemaId(
            data[subItem] != "string" && data[subItem] != undefined
              ? data[subItem]
              : "NA"
          );
        }
        setValue(
          subItem,
          subItem == "schemaId"
            ? data[subItem] != "string" && data[subItem] != undefined
              ? data[subItem]
              : "NA"
            : data[subItem]
        );
      });
    }
  };

  useEffect(() => {
    if (Object.keys(configValues).length) {
      bindData(configValues);
      setExitingSchema(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string" &&
          configValues["schemaId"] != "NA" &&
          configValues["schemaId"] != null
          ? "Yes"
          : "No"
      );
      setSchemaMetaDataObj(configValues.schemaMetaDataObj);
      setSchemaDataObj(configValues.schemaDataObj);
      setSchemaId(
        configValues["schemaId"] != undefined &&
          configValues["schemaId"] != "string"
          ? configValues.schemaId
          : "NA"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configValues]);

  const onFinish = (values) => {
    if (values["exitingSchema"] === "No") {
      values.schemaId = "NA";
    }
    if (values["exitingSchema"] === "Yes") {
      values.schemaId = schemaId;
    }
    values.schemaDataObj = schemaDataObj != undefined ? schemaDataObj : {};
    values.schemaMetaDataObj =
      schemaMetaDataObj != undefined ? schemaMetaDataObj : {};
    let finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
  };

  const isExitingSchema = (event) => {
    setExitingSchema(event.target.value);
    if (event.target.value == "No") {
      setSchemaId("NA");
    }
  };

  const handleSelect = (value, type) => {
    if (type == "schema") {
      setSchemaId(value);
    } else {
      setDataFeedType(value);
    }
  };

  const handleSchemaData = (e, type) => {
    if (type == "schemaData") {
      setSchemaDataObj(e.target.files[0]);
      setShowSchemaDataFileNew(true);
      setUploadSchemaDataOn(true);
    } else {
      setSchemaMetaDataObj(e.target.files[0]);
      setShowSchemaMetaDataFileNew(true);
      setUploadSchemaMetaDataOn(true);
    }
  };

  // Replaces antd Upload beforeUpload — enforce the 100MB size cap then store.
  const handleSchemaFileChange = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      message.error(
        "File not uploaded due to: Max File size upload allowed is 100MB"
      );
      e.target.value = "";
      return;
    }
    handleSchemaData(e, type);
    e.target.value = "";
  };

  const handleDeleteSchemaDataFileUpload = (data, objectType) => {
    if (objectType == "schemaData") {
      setUploadSchemaDataOn(false);
      setShowSchemaDataFileNew(false);
      setSchemaDataObj();
    } else {
      setUploadSchemaMetaDataOn(false);
      setShowSchemaMetaDataFileNew(false);
      setSchemaMetaDataObj();
    }
  };

  const handleDeleteSchemaDataFile = async (record, type, objectType) => {
    if (type === "upload") {
      let objType =
        objectType === "schemaMetaData"
          ? ["showSchemaDataFileNew"]
          : ["showSchemaMetaDataFileNew"];
      let uploadOn =
        objectType === "schemaMetaData"
          ? ["schemaMetaDataUploadOn"]
          : ["schemaDataUploadOn"];
      let fileObj =
        objectType === "schemaMetaData"
          ? ["schemaDataFileObj"]
          : ["schemaMetaDataFileObj"];
      var data = {
        [objType]: false,
        [uploadOn]: false,
        [fileObj]: {},
      };
      const ok = await imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file/link is already existing. Replace? ",
        okText: "OK",
        okColor: "error",
      });
      if (ok) {
        handleDeleteSchemaDataFileUpload(data, objectType);
      } else {
        if (objectType === "schemaMetaData") {
          setUploadSchemaMetaDataOn(true);
          setShowSchemaMetaDataFileNew(true);
        } else {
          setUploadSchemaDataOn(true);
          setShowSchemaDataFileNew(true);
        }
      }
    } else {
      const ok = await imperativeConfirm({
        title: "Do you want to replace the item",
        content: "This file/link is already existing. Replace? ",
        okText: "OK",
        okColor: "error",
      });
      if (ok) {
        setShowSchemaDataPdf(false);
        setUploadSchemaDataOn(false);
      } else {
        setShowSchemaDataPdf(true);
        setUploadSchemaDataOn(false);
      }
    }
  };

  const splittingPathRequired =
    dataFeedType ==
      "com.scb.edms.edmsdataflowsvc.routes.JSONSplitValidateRoute" ||
    dataFeedType == "json" ||
    dataFeedType == "xpath" ||
    dataFeedType ==
      "com.scb.edms.edmsdataflowsvc.routes.XpathSplitValidateRoute";

  const schemaDataDisabled =
    exitingSchema == "Yes"
      ? true
      : false &&
        (showSchemaDataPdf ||
          uploadSchemaDataOn ||
          showSchemaDataFileNew) &&
        schemaDataObj &&
        schemaDataObj?.name;

  const schemaMetaDataDisabled =
    exitingSchema == "Yes"
      ? true
      : false &&
        (showSchemaMetaDataPdf ||
          uploadSchemaMetaDataOn ||
          showSchemaMetaDataFileNew) &&
        schemaMetaDataObj &&
        schemaMetaDataObj.name;

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
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <h3
            className="content-header"
            style={{ paddingBottom: "16px", fontWeight: "bold" }}
          >
            Splitting Configuration
          </h3>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Existing schema"
            tooltip="Specify if the schema already exists or will a new schema data need to be created.  Yes = schema already exists."
          />
          <FormField
            name="exitingSchema"
            type="radio"
            row
            control={control}
            required="Existing schema is mandatory !"
            onChange={isExitingSchema}
            options={EXISTING_SCHEMA_OPTIONS}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Schema ID"
            tooltip="Choose the existing schema id from the dropdown list if it's an existing schema.  For new schemas, this will be blank and will be auto-generated upon submission."
          />
          {exitingSchemaWatch === "Yes" ? (
            <FormField
              name="schemaId"
              type="select"
              control={control}
              required="Schema ID is mandatory !"
              onChange={(e) => handleSelect(e.target.value, "schema")}
              options={
                schemas && schemas.length > 0
                  ? schemas.map((s) => ({
                      value: s.schemaName,
                      label: s.schemaName,
                    }))
                  : [{ value: "NA", label: "NA" }]
              }
            />
          ) : (
            <FormField
              name="schemaId"
              type="select"
              control={control}
              required="Schema ID is mandatory !"
              disabled
              options={[{ value: "NA", label: "NA" }]}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel text="Schema data" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={!!schemaDataDisabled}
              >
                Click to Upload
                <input
                  type="file"
                  hidden
                  accept=".csv,.json,.xml,.xpath,.xsd"
                  onChange={(e) => handleSchemaFileChange(e, "schemaData")}
                />
              </Button>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Supported formats : .json, .xsd
              </div>
            </Box>
            {showSchemaDataFileNew && schemaDataObj && schemaDataObj?.name && (
              <Button
                type="button"
                className="link-button talign"
                onClick={() =>
                  handleDeleteSchemaDataFile(
                    schemaDataObj,
                    "upload",
                    "schemaData"
                  )
                }
              >
                <strong
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                  {schemaDataObj && schemaDataObj?.name ? schemaDataObj?.name : ""}
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
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel text="Data format" />
          <FormField
            name="dataFeedType"
            type="select"
            control={control}
            required="Data Feed type is mandatory !"
            onChange={(e) => handleSelect(e.target.value, "dataFeedType")}
            options={DATAFEED_TYPE_OPTIONS}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel text="Schema metadata" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={!!schemaMetaDataDisabled}
              >
                Click to Upload
                <input
                  type="file"
                  hidden
                  accept=".csv,.json,.xml,.xpath"
                  onChange={(e) => handleSchemaFileChange(e, "schemaMetaData")}
                />
              </Button>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Supported format : .json
              </div>
            </Box>
            {showSchemaMetaDataFileNew &&
              schemaMetaDataObj &&
              schemaMetaDataObj.name && (
                <Button
                  type="button"
                  className="link-button talign"
                  onClick={() =>
                    handleDeleteSchemaDataFile(
                      schemaMetaDataObj,
                      "upload",
                      "schemaMetaData"
                    )
                  }
                >
                  <strong
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AttachFileIcon fontSize="small" />
                    {schemaMetaDataObj && schemaMetaDataObj.name
                      ? schemaMetaDataObj.name
                      : ""}
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
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Splitting path expression"
            tooltip="Camel expression for polling the source of the data for splitting.  Must be a valid camel expression."
          />
          <FormField
            name="splittingPathExpression"
            control={control}
            required={
              splittingPathRequired
                ? "Splitting path expression is mandatory !"
                : false
            }
            rules={splittingPathRequired ? { validate: noWhitespace } : {}}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FieldLabel
            text="Splitting source expression"
            tooltip={`Enter in this format: "direct://"+Vendor+"-"+ "dataset" + feedname+"splitting-queue".`}
          />
          <FormField
            name="splittingSourceExpression"
            control={control}
            required="Splitting source expression is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(SplittingConfiguration);
