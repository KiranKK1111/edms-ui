import { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider,
} from "@mui/material";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import { FormField } from "../../design-system";
import {
  businessRequirements,
} from "../../store/actions/requestAccessActions";
import { bindData } from "./bindData";
import {
  clarityIdValidation,
  checkValueExist,
  itamIdValidation,
} from "./validationsRequestAccess";

let noOfSubscriptionsVal = "No. of Licences";
const mediaQuery = window.matchMedia("(min-width: 1400px)");
if (mediaQuery.matches) {
  noOfSubscriptionsVal = "No. of Licences";
}

const SUBSCRIPTION_TYPE_OPTIONS = [
  { value: "Individual Subscription", label: "Individual Subscription" },
  { value: "Application Subscription", label: "Application Subscription" },
];

const TooltipIcon = ({ title }) => (
  <Tooltip title={title}>
    <HelpOutlineOutlined
      fontSize="small"
      sx={{ color: "var(--color-primary)", ml: 0.5 }}
    />
  </Tooltip>
);

export function ruleForSubscriptionFor(subFor, value) {
  if (!subFor) {
    if (!value) {
      return Promise.reject(new Error("Please enter a service account ID"));
    }
    if (value.includes(" ")) {
      return Promise.reject(new Error("Application service account ID cannot contain spaces"));
    }
    return Promise.resolve();
  }
  else {
    return Promise.resolve();
  }
}

const BusinessRequirements = (props) => {
  const [valObj, setValObj] = useState({});
  const [searchWord, setSearchWord] = useState("");
  const [itamIdWord, setItamIdWord] = useState("");
  const configValues = useSelector((state) => state.datafeedInfo.congigUi);

  const [subFor, setSubFor] = useState(null);
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.requestAccess);
  const { formData } = props;
  const [flag, setFlag] = useState();

  const psid = localStorage.getItem("psid");

  const { control, setValue, getValues, trigger } = useForm({
    defaultValues: {
      subscriptionId: "",
      clarityId: "",
      subscriptionType: "Individual Subscription",
      subscriptionFor: "",
      serviceAccountName: "",
      reasonForSubscription: "",
      numberOfEndUserSubscriptions: "",
      projectName: "",
      department: "",
      status: "Pending",
      vendorRequest: "N",
    },
    mode: "onChange",
  });

  // Adapter so the shared bindData() (built for antd's setFieldsValue) and the
  // existing init logic keep working unchanged against react-hook-form.
  const formAdapter = {
    setFieldsValue: (obj) =>
      Object.keys(obj).forEach((key) => setValue(key, obj[key])),
    getFieldValue: (name) => getValues(name),
    getFieldsValue: () => getValues(),
  };

  useEffect(() => {
    formAdapter.setFieldsValue({
      subscriptionId:
        reduxData.businessRequirements > 0
          ? reduxData.businessRequirements[0].subscriptionId
          : "",
      subscriptionType: "Individual Subscription",
      status: "Pending",
      vendorRequest: configVal(formAdapter.getFieldValue("subscriptionType")) ? "N" : "N",
    });

    bindData(reduxData.businessRequirements, formAdapter);
    const fields = formAdapter.getFieldsValue();
    const keys = Object.keys(fields);
    const validationObj = keys.map((item) => {
      return {
        [item]: {
          error: false,
          message: "",
        },
      };
    });
    const merge1 = Object.assign({}, ...validationObj);
    setValObj(merge1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData]);

  useEffect(() => {
    if (formData) {
      trigger().then((ok) => {
        const errors = Object.keys(valObj).some(
          (item) => valObj[item].error === true
        );
        if (ok && !errors) {
          dispatch(businessRequirements(getValues()));
          props.next(true);
        }
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const val = await checkValueExist(searchWord, "clarityId");
      const myObj = clarityIdValidation(valObj, val);
      if (myObj !== undefined) setValObj(myObj);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchWord]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const val = await checkValueExist(itamIdWord, "itamId");
      const myObj = itamIdValidation(valObj, val);
      if (myObj !== undefined) setValObj(myObj);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [itamIdWord]);

  const onBlurHandler = (e) => {
    let data = {};
    const { name, value } = e.target;
    data[name] = value;
  };

  const configVal = (val) => {
    return val && val.toLowerCase() === "individual subscription"
      ? true
      : false;
  };

  const configVRConfig = (val) => {
    return val && val.toLowerCase() === "y"
      ? true
      : false;
  };

  useEffect(() => {
    setSubFor(configVal(formAdapter.getFieldValue("subscriptionType")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (subFor) {
      setFlag("N")
      formAdapter.setFieldsValue({
        subscriptionFor: psid,
      });
    }
    else {
      setFlag(formAdapter.getFieldValue("vendorRequest"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subFor]);

  const subTypeFn = (val) => {
    formAdapter.setFieldsValue({
      subscriptionFor: "",
      vendorRequest: 'N'
    });
    setSubFor(configVal(val));
  };
  useEffect(() => {
    setSubFor(configVal(formAdapter.getFieldValue("subscriptionType")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subFor) {
      setFlag("N")
      formAdapter.setFieldsValue({
        subscriptionFor: psid,
      });
    }
    else {
      setFlag(formAdapter.getFieldValue("vendorRequest"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subFor]);

  const getVendorRequestConfig = () => {
    if (configValues && configValues.vendorRequestConfig) {
      return configVRConfig(configValues.vendorRequestConfig)
    }
  }

  const handlePrecheck = () => {
    return (!subFor && getVendorRequestConfig()) ? true : false;
  }

  const handleVendorRequest = (e) => {
    setFlag(e.target.value);
  }

  props.setSubscriptionFor(subFor);
  props.setVendorRequest(flag);

  return (
    <div className="business">
      <Box component="form" name="br-one">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormField
                name="subscriptionId"
                label="Subscription ID"
                control={control}
                placeholder="Subscription ID will be generated after submission"
                disabled
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <FormField
                    name="clarityId"
                    label="Clarity ID"
                    control={control}
                    placeholder="Clarity ID"
                  />
                </Box>
                <TooltipIcon title="Enter the clarity ID of the project this subscription is under" />
              </Box>

              <FormField
                name="subscriptionType"
                label="Subscription type"
                type="select"
                control={control}
                required="Subscription Type is mandatory."
                options={SUBSCRIPTION_TYPE_OPTIONS}
                onChange={(e) => subTypeFn(e.target.value)}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <FormField
                    name="subscriptionFor"
                    label="Subscription for"
                    control={control}
                    placeholder="Subscription for"
                    disabled={subFor}
                    onBlur={(e) => onBlurHandler(e)}
                    rules={{
                      validate: async (value) => {
                        try {
                          await ruleForSubscriptionFor(subFor, value);
                          return true;
                        } catch (err) {
                          return err.message;
                        }
                      },
                    }}
                  />
                </Box>
                <TooltipIcon title="For application subscription, enter service account ID. For your own subscription, select 'Myself'." />
                <FormControlLabel
                  sx={{ m: 0, whiteSpace: "nowrap" }}
                  labelPlacement="start"
                  control={
                    <Checkbox
                      size="small"
                      disabled={!subFor}
                      checked={!!subFor}
                    />
                  }
                  label="Myself"
                />
              </Box>

              {!subFor ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <FormField
                      name="serviceAccountName"
                      label="Service account name"
                      control={control}
                      placeholder="Service account name"
                    />
                  </Box>
                  <TooltipIcon title="Enter the service account name" />
                </Box>
              ) : null}

              <FormField
                name="reasonForSubscription"
                label="Reason for Subscription"
                type="textarea"
                rows={4}
                control={control}
                placeholder="Reason for Subscription"
                required="Reason for Subscription is mandatory(Max 500 characters)"
                rules={{
                  maxLength: {
                    value: 500,
                    message:
                      "Reason for Subscription should not be more than 500 characters",
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <FormField
                    name="numberOfEndUserSubscriptions"
                    label={noOfSubscriptionsVal}
                    control={control}
                    placeholder="No. of Licences"
                    required="No. of Licences is mandatory"
                    rules={{
                      pattern: {
                        value: new RegExp("^[0-9]+$"),
                        message: "Only numbers are allowed",
                      },
                    }}
                    onBlur={(e) => onBlurHandler(e)}
                  />
                </Box>
                <TooltipIcon title="Number of Licences used in this Subscription." />
              </Box>

              <FormField
                name="projectName"
                label="Project name"
                control={control}
                placeholder="Project name"
                rules={{
                  pattern: {
                    value: /^[a-zA-Z0-9\s]+$/i,
                    message: "Only alphabets and numbers are allowed",
                  },
                }}
                onBlur={(e) => onBlurHandler(e)}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <FormField
                    name="department"
                    label="Department"
                    control={control}
                    placeholder="Department"
                    required="Department is mandatory"
                    rules={{
                      pattern: {
                        value: /^[a-z\d\-_\s]+$/i,
                        message: "Please enter a valid Department",
                      },
                    }}
                    onBlur={(e) => onBlurHandler(e)}
                  />
                </Box>
                <TooltipIcon title="Please specify the department that this data feed will be subscribed for" />
              </Box>

              <FormField
                name="status"
                label="Status"
                control={control}
                placeholder="Status"
                required="Please enter a valid status"
                disabled
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />
        <h4 style={{ "fontWeight": "bold" }}>On-Demand Vendor request</h4>
        <FormField
          name="vendorRequest"
          label="Enable On-Demand Vendor request:"
          type="radio"
          row
          control={control}
          disabled={!handlePrecheck()}
          options={[
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ]}
          onChange={handleVendorRequest}
        />
      </Box>
    </div>
  );
};

export default memo(withRouter(BusinessRequirements));
