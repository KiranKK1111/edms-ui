import { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Divider, Grid } from "@mui/material";
import dayjs from "../../design-system/dayjs";
import cronstrue from "cronstrue";
import { FieldLabel, FormField } from "../../design-system";
import "./GeneralConfiguration.css";
import { configUiFn } from "../../store/actions/datafeedAction";
import { cornEx } from "../../test/regEx";

const SOURCE_PROCESSOR_OPTIONS = [
  { value: "sftpProcessor", label: "sftpProcessor" },
  { value: "sftpProcessorMTime", label: "sftpProcessorMTime" },
  { value: "httpProcessor", label: "httpProcessor" },
  { value: "ftpsProcessor", label: "ftpsProcessor" },
  { value: "dssRestProcessor", label: "DssRestProcessor" },
];

const SOURCE_PROTOCOL_OPTIONS = [
  { value: "SFTP", label: "SFTP" },
  { value: "HTTPS", label: "HTTPS" },
];

const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const ROUTE_TYPE_OPTIONS = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "One-time", label: "One-time" },
];

const SPLITTING_OPTIONS = [
  { value: "No", label: "Not applicable" },
  { value: "Yes", label: "Applicable" },
];

const TRUE_FALSE_OPTIONS = [
  { value: "True", label: "True" },
  { value: "False", label: "False" },
];

const CHECKSUM_OPTIONS = [
  { value: true, label: "True" },
  { value: false, label: "False" },
];

const VENDOR_REQUEST_OPTIONS = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
];

const DEFAULTS = {
  createdBy: "",
  storageLocation: "",
  configurationCreatedOn: "",
  dataFeedId: "",
  routeName: "",
  sourceProtocol: "SFTP",
  sourceProcessor: "sftpProcessor",
  asynchronousRoute: "False",
  splittingRequirement: "No",
  proxyRequirement: "No",
  histLoad: "No",
  routeType: "Scheduled",
  filenameFormat: "NotUsed",
  filenameDateSuffix: "No",
  filenameExtension: "",
  startDate: null,
  expiryDate: null,
  cronScheduler: "",
  sourceHostName: "",
  sourcePortInteger: "",
  sourceUsername: "",
  sourcePasswordProperty: "",
  sourceFolder: "",
  destinationExpression: "",
  keyLocation: "",
  proxyHostname: "",
  proxyPort: "",
  isChecksum: false,
  vendorRequestConfig: "N",
};

// Reject whitespace-only input (parity with the old antd validator).
const noWhitespace = (value) =>
  /^\s+$/.test(value) ? "Not a valid input" : true;

const GeneralConfiguration = (props) => {
  const [splittingRequirement, setSplittingRequirement] = useState("No");
  const [filenameDateSuffix, setFilenameDateSuffix] = useState("No");
  const [vendorRequestConfig, setVendorRequestConfig] = useState("N");
  const [routeType, setRouteType] = useState("Scheduled");
  const [proxyRequirement, setProxyRequirement] = useState("No");
  const [histLoad] = useState("No");
  const [startDate, setStartDate] = useState({});
  const [cronPreview, setCronPreview] = useState("");

  const dispatch = useDispatch();
  const params = useParams();
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);

  const { control, watch, setValue, getValues, reset, trigger } = useForm({
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  const isProxyReq = (event) => setProxyRequirement(event.target.value);
  const isVendorRequested = (event) =>
    setVendorRequestConfig(event.target.value);
  const onChangeRadio = (event, type) => {
    if (type === "filenameDateSuffix") setFilenameDateSuffix(event.target.value);
    else setRouteType(event.target.value);
  };
  const isSplitReq = (event) => setSplittingRequirement(event.target.value);

  const proxyRequirementWatch = watch("proxyRequirement");

  const bindData = (data) => {
    const items = Object.keys(data);
    if (!items.length) return;
    items.forEach((subItem) => {
      if (subItem === "startDate" || subItem === "expiryDate") {
        setValue(subItem, dayjs(new Date(data[subItem])));
      } else if (subItem === "routeType") {
        setValue(
          subItem,
          data[subItem] ===
            "com.scb.edms.edmsdataflowsvc.routes.ScheduledRoute" ||
            data[subItem] === "Scheduled"
            ? "Scheduled"
            : "One-time"
        );
      } else if (subItem === "configurationCreatedOn") {
        setValue(subItem, dayjs(new Date(data[subItem])).format("DD/MMM/YYYY"));
      } else if (subItem === "filenameDateSuffix") {
        setValue(subItem, data[subItem]);
      } else if (subItem === "sourceProtocol") {
        setValue(subItem, data[subItem] == null ? "SFTP" : data[subItem]);
      } else if (subItem === "splittingRequirement") {
        // Splitting canonical class is the source of truth: if it is present
        // (non-empty) the feed config has splitting applicable, regardless of
        // any separately-stored splittingRequirement flag.
        const splitterClass =
          data["splitterCanonicalClass"] ?? data["splittingCanonicalClass"];
        setValue(
          subItem,
          splitterClass != null && splitterClass !== "" ? "Yes" : "No"
        );
      } else {
        setValue(subItem, data[subItem]);
      }
    });
  };

  const setDefaultValues = () => {
    reset({
      ...DEFAULTS,
      createdBy: localStorage.getItem("psid"),
      configurationCreatedOn: dayjs(new Date()).format("DD/MMM/YYYY"),
      dataFeedId: params.id,
      // Route name must be entered by the user for a new configuration.
      routeName: "",
    });
  };

  useEffect(() => {
    if (configValues && Object.keys(configValues).length > 0) {
      bindData(configValues);
      setFilenameDateSuffix(configValues.filenameDateSuffix);
      setProxyRequirement(configValues.proxyRequirement);
      setSplittingRequirement(configValues.splittingRequirement);
      if (configValues.cronScheduler) {
        try {
          setCronPreview(cronstrue.toString(configValues.cronScheduler));
        } catch (err) {
          setCronPreview("");
        }
      }
    } else {
      setDefaultValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configValues]);

  const onFinish = (values) => {
    values.createdBy = localStorage.getItem("psid");
    values.dataFeedId = params.id;
    values.proxyHostname =
      values.proxyRequirement === "Yes" ? values.proxyHostname : "";
    values.proxyPort =
      values.proxyRequirement === "Yes" ? values.proxyPort : "";
    values.histLoad = histLoad;
    values.filenameDateSuffix = filenameDateSuffix;
    values.routeType = routeType;
    values.isChecksum = values.isChecksum === true || values.isChecksum === "true";
    const finalData = { ...configValues, ...values };
    dispatch(configUiFn(finalData));
    props.next(true, finalData);
    props.passUpdates(values, true);
  };

  // Parent flips `formData` to true when Next is clicked. Validate, then on
  // success persist + advance to the next step.
  useEffect(() => {
    if (props.formData) {
      trigger().then((ok) => {
        if (ok) onFinish(getValues());
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData]);

  const startDateSetup = (event) => {
    event ? setStartDate(dayjs(event).format("YYYY/MM/DD")) : setStartDate({});
  };

  const handleCronChange = (e) => {
    const v = e && e.target ? e.target.value : "";
    if (!v) {
      setCronPreview("");
      return;
    }
    try {
      setCronPreview(cronstrue.toString(v));
    } catch (err) {
      setCronPreview("");
    }
  };

  const colThird = { xs: 12, sm: 6, md: 4 };
  const colTwoThirds = { xs: 12, md: 8 };

  return (
    <Box component="form" noValidate className="config-form">
      <h3 className="content-header">Main Configuration</h3>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="Start date"
            required
            tooltip="Day from which the Configuration will take effect. This is when the route will start. Only applicable when the Configuration is Active."
          />
          <FormField
            name="startDate"
            type="date"
            control={control}
            required="Start date is mandatory !"
            disabled={props.isUpdate}
            onChange={startDateSetup}
            shouldDisableDate={(current) =>
              current && current < dayjs().startOf("day")
            }
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Expiry date"
            required
            tooltip="Day from which the Configuration will be disabled. Last day when the route will be used."
          />
          <FormField
            name="expiryDate"
            type="date"
            control={control}
            required="Expiry Date is mandatory !"
            shouldDisableDate={(current) =>
              current && current < dayjs(startDate).startOf("day")
            }
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Key location"
            tooltip="If the key is available, enter the file location of EFS, otherwise null."
          />
          <FormField
            name="keyLocation"
            control={control}
            disabled={props.isUpdate}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid size={colThird}>
          <FieldLabel
            text="Cron scheduler"
            required
            tooltip="This is a cron expression. You can use a site like http://www.cronmaker.com/?1 to generate cron."
          />
          <FormField
            name="cronScheduler"
            control={control}
            required="Cron scheduler is mandatory !"
            onChange={handleCronChange}
            rules={{
              pattern: {
                value: new RegExp(cornEx.source),
                message: "Not a valid cron expression!",
              },
            }}
          />
          {cronPreview ? (
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                fontStyle: "italic",
              }}
            >
              {cronPreview}
            </span>
          ) : null}
        </Grid>
        <Grid size={colTwoThirds}>
          <FieldLabel
            text="Storage location"
            required
            tooltip="This will be where the Data Feeds downloaded from the vendor will be stored."
          />
          <FormField
            name="storageLocation"
            control={control}
            disabled={props.isUpdate}
            required="Storage location property is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
      </Grid>

      <Divider />

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel text="Source processor" required />
          <FormField
            name="sourceProcessor"
            type="select"
            control={control}
            disabled={props.isUpdate}
            placeholder="Select"
            required="Source processor is mandatory !"
            options={SOURCE_PROCESSOR_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Source hostname"
            required
            tooltip="This will be the data source hostname or ip address. Example: Refinitive 10.192.191.25."
          />
          <FormField
            name="sourceHostName"
            type="textarea"
            rows={3}
            control={control}
            required="Source hostname is mandatory !"
            inputProps={{ maxLength: 1000 }}
            rules={{
              pattern: {
                value: new RegExp(
                  "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(https?:\\/\\/)?(www\\.|ftp\\.|sftp\\.)?[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,})+(\\/[a-zA-Z0-9\\-_.~+\\/=?]*)?$",
                  "i"
                ),
                message: "Not a valid host name",
              },
            }}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Source port"
            required
            tooltip="Port number of the source hostname."
          />
          <FormField
            name="sourcePortInteger"
            control={control}
            disabled={props.isUpdate}
            required="Source port integer is mandatory !"
            rules={{
              pattern: {
                value: new RegExp("^[0-9]+$"),
                message: "Only numbers and positive numbers are allowed",
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel text="Source protocol" />
          <FormField
            name="sourceProtocol"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            options={SOURCE_PROTOCOL_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Source username"
            required
            tooltip="User login to be used when connecting to the source hostname."
          />
          <FormField
            name="sourceUsername"
            control={control}
            required="Source username is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Source password property"
            required
            tooltip="The password property used to connect to the password vault. You will need to get this from the Data Engineering team."
          />
          <FormField
            name="sourcePasswordProperty"
            control={control}
            disabled={props.isUpdate}
            required="Source password property is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={colTwoThirds}>
          <FieldLabel
            text="Source folder"
            required
            tooltip="Source folder with dynamic date template e.g. /inbox/ + formatDateString(yyyy-MM, 0)"
          />
          <FormField
            name="sourceFolder"
            control={control}
            required="Source folder property is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
      </Grid>

      <Divider />

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="Filename format"
            required
            tooltip="Format of the filename. Prepared based on the vendor file format. Example: News\.[A-Z0-9]+\.([0-9]{8})\.([0-9]{4})\.txt\.gz"
          />
          <FormField
            name="filenameFormat"
            control={control}
            required="Filename format is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Filename date suffix"
            tooltip="If vendor filename format does not include the date, please choose No."
          />
          <FormField
            name="filenameDateSuffix"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            onChange={(e) => onChangeRadio(e, "filenameDateSuffix")}
            options={YES_NO_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Filename extension"
            tooltip="If vendor filename must include the extension, please provide it here."
          />
          <FormField
            name="filenameExtension"
            control={control}
            disabled={props.isUpdate}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="Route name"
            required
            tooltip="The unique route name for the feed."
          />
          <FormField
            name="routeName"
            control={control}
            disabled={props.isUpdate}
            required="Route name is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel text="Route type" required />
          <FormField
            name="routeType"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            required="Route type is mandatory !"
            onChange={(e) => onChangeRadio(e, "routeType")}
            options={ROUTE_TYPE_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Destination expression"
            required
            tooltip="Camel expression for writing to the storage location, for example: bean:s3Processor?method=process."
          />
          <FormField
            name="destinationExpression"
            control={control}
            disabled={props.isUpdate}
            required="Destination Expression is mandatory !"
            rules={{ validate: noWhitespace }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="Splitting requirement"
            required
            tooltip="Choose Applicable if the Data Feed will be split."
          />
          <FormField
            name="splittingRequirement"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            required="Splitting requirement is mandatory !"
            onChange={isSplitReq}
            options={SPLITTING_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel
            text="Asynchronous route"
            tooltip="Please discuss with Data Engineering team before setting this to True."
          />
          <FormField
            name="asynchronousRoute"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            options={TRUE_FALSE_OPTIONS}
          />
        </Grid>
        <Grid size={colThird}>
          <FieldLabel text="Checksum" required />
          <FormField
            name="isChecksum"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            rules={{
              validate: (v) =>
                v === true ||
                v === false ||
                v === "true" ||
                v === "false"
                  ? true
                  : "Checksum is mandatory !",
            }}
            options={CHECKSUM_OPTIONS}
          />
        </Grid>
      </Grid>

      <Divider />

      <h3 className="content-header">Proxy</h3>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="Proxy requirement"
            tooltip="Enable if the Data Feed required a proxy host and proxy port to be entered."
          />
          <FormField
            name="proxyRequirement"
            type="radio"
            row
            control={control}
            disabled={props.isUpdate}
            onChange={isProxyReq}
            options={YES_NO_OPTIONS}
          />
        </Grid>
        {proxyRequirementWatch === "Yes" && (
          <Grid size={colThird}>
            <FieldLabel
              text="Proxy hostname"
              required
              tooltip="This is the proxy host / ip"
            />
            <FormField
              name="proxyHostname"
              type="textarea"
              rows={3}
              control={control}
              disabled={props.isUpdate}
              required="Proxy hostname is mandatory !"
              inputProps={{ maxLength: 1000 }}
              rules={{
                pattern: {
                  value: new RegExp(
                    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^((ftp|https):\/\/)?(www.|ftp.|sftp.)?(?!.*(ftp|http|https|www.))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?\/?$/
                  ),
                  message: "Not a valid host name",
                },
              }}
            />
          </Grid>
        )}
        {proxyRequirementWatch === "Yes" && (
          <Grid size={colThird}>
            <FieldLabel text="Proxy port" required />
            <FormField
              name="proxyPort"
              control={control}
              disabled={props.isUpdate}
              required="Proxy port is mandatory !"
              rules={{
                pattern: {
                  value: new RegExp("^[0-9]+$"),
                  message: "Only numbers and positive numbers are allowed",
                },
              }}
            />
          </Grid>
        )}
      </Grid>

      <Divider />

      <h3 className="content-header">On-Demand Vendor request</h3>

      <Grid container spacing={3}>
        <Grid size={colThird}>
          <FieldLabel
            text="On-Demand Vendor request configuration"
            tooltip="Enable if the Data Feed required an On-Demand Vendor request configuration."
          />
          <FormField
            name="vendorRequestConfig"
            type="radio"
            row
            control={control}
            onChange={isVendorRequested}
            options={VENDOR_REQUEST_OPTIONS}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(GeneralConfiguration);
