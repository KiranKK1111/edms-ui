import { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { FormField } from "../../design-system";
import { usage, updateUsage } from "../../store/actions/requestAccessActions";
import { bindData } from "./bindData";
import dayjs from "dayjs";
import "../../design-system/dayjs";

const dateFormat = "DD-MM-YYYY";

const SUBSCRIPTION_CYCLE_OPTIONS = ["Weekly", "Monthly", "Annually"];
const ALERTS_OPTIONS = ["Yes", "No"];
const SUBSCRIPTION_STATUS_OPTIONS = [
  "Active",
  "Pending",
  "Expired",
  "Suspended",
];

const Usage = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.requestAccess);
  const location = useLocation();

  const { control, setValue, getValues, trigger } = useForm({
    defaultValues: {
      subscriptionCycle: "Weekly",
      billingModel: "Shared cost",
      estRechargeCostPerAnnum: "",
      alertsAndNotifications: "Yes",
      expirationDate: null,
      subscriptionStatus: "",
    },
    mode: "onChange",
  });

  // Adapter so the shared bindData() (built for antd's setFieldsValue) can keep
  // populating fields without modification.
  const formAdapter = {
    setFieldsValue: (obj) =>
      Object.keys(obj).forEach((key) => setValue(key, obj[key])),
    getFieldValue: (name) => getValues(name),
    getFieldsValue: () => getValues(),
  };

  const { contractExpDate, licenseStatus } = reduxData.tableInfo;
  const defaultDate = dayjs(contractExpDate).format("DD-MM-YYYY");

  useEffect(() => {
    if (props.formData) {
      trigger().then((ok) => {
        if (ok) {
          dispatch(usage(getValues()));
          props.next(true);
        }
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData]);

  useEffect(() => {
    const locationObj = location.state.data;
    let cost = 0;
    if (locationObj && locationObj.license && locationObj.license.licenseCost) {
      cost = locationObj.license.licenseCost / locationObj.totalSubscribers + 1;
    } else {
      cost = cost + 1;
    }

    cost = Math.ceil(cost);
    setValue("billingModel", "Shared cost");
    setValue("expirationDate", dayjs(contractExpDate));
    setValue("subscriptionStatus", licenseStatus);
    setValue("alertsAndNotifications", "Yes");
    setValue("subscriptionCycle", "Weekly");
    setValue("estRechargeCostPerAnnum", cost);

    bindData(reduxData.usage, formAdapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function disabledDate(current) {
    return (
      current > dayjs(defaultDate, dateFormat) ||
      current.valueOf() < Date.now()
    );
  }

  function onChange(date) {
    dispatch(
      updateUsage({
        expirationDate: date,
      })
    );
  }

  const selectBefore = (
    <Select
      defaultValue="USD"
      size="small"
      variant="standard"
      disableUnderline
      className="select-before"
      sx={{ mr: 1 }}
    >
      <MenuItem value="USD">USD</MenuItem>
      <MenuItem value="EUR">EUR</MenuItem>
      <MenuItem value="GBP">GBP</MenuItem>
    </Select>
  );

  const onBlurHandler = (e) => {
    let data = {};
    const { name, value } = e.target;
    data[name] = value;
    dispatch(updateUsage(data));
  };

  const onSelectChangeHandler = (name, value) => {
    let data = {};
    data[name] = value;
    dispatch(updateUsage(data));
  };

  return (
    <Box component="form" name="usage-one">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormField
              name="subscriptionCycle"
              label="Subscription Cycle"
              type="select"
              control={control}
              required="Subscription Cycle is mandatory."
              placeholder="Weekly"
              options={SUBSCRIPTION_CYCLE_OPTIONS}
              onChange={(e) =>
                onSelectChangeHandler("subscriptionCycle", e.target.value)
              }
            />
            <FormField
              name="billingModel"
              label="Billing Model"
              control={control}
              placeholder="Billing Model"
              disabled
            />
            <FormField
              name="estRechargeCostPerAnnum"
              label="Est.Cost Per Annum"
              control={control}
              placeholder="Est.Cost Per Annum"
              required="Est. cost per annum cycle is mandatory."
              rules={{
                pattern: {
                  value: /^[0-9]*$/i,
                  message: "Please enter a valid Est. cost per annum",
                },
              }}
              startAdornment={
                <InputAdornment position="start">{selectBefore}</InputAdornment>
              }
              onBlur={(e) => onBlurHandler(e)}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormField
              name="alertsAndNotifications"
              label="Alerts & Notifications"
              type="select"
              control={control}
              placeholder="Yes"
              options={ALERTS_OPTIONS}
              onChange={(e) =>
                onSelectChangeHandler("alertsAndNotifications", e.target.value)
              }
            />
            <FormField
              name="expirationDate"
              label="Expiration Date"
              type="date"
              control={control}
              required="Expiration date is mandatory."
              format={dateFormat}
              shouldDisableDate={(e) => disabledDate(e)}
              onChange={onChange}
            />
            <FormField
              name="subscriptionStatus"
              label="Subscription Status"
              type="select"
              control={control}
              placeholder="Licence"
              disabled={
                reduxData.businessRequirements[0].subscriptionId === ""
              }
              options={SUBSCRIPTION_STATUS_OPTIONS}
              onChange={(e) =>
                onSelectChangeHandler("subscriptionStatus", e.target.value)
              }
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Usage);
