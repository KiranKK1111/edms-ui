import { HelpOutlineOutlined } from "@mui/icons-material";
import { Box, Grid, Tooltip } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { FormField } from "../../../design-system";
import { support } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";

// Render a field label with the antd-style help tooltip affordance.
const labelWithTip = (text) => (
  <Box
    component="span"
    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
  >
    {text}
    <Tooltip title={text}>
      <HelpOutlineOutlined
        sx={{ fontSize: 16, color: "var(--color-primary)" }}
      />
    </Tooltip>
  </Box>
);

function LicenseLimitations(props) {
  const [issueManagement] = useState(props.issueManagement);
  const [notifications] = useState(props.notifications);
  const [dataExpertFullName] = useState(props.dataExpertFullName);
  const [dataExpertEmailAddress] = useState(props.dataExpertEmailAddress);
  const [datesCoveredStart] = useState(props.datesCoveredStart);
  const [datesCoveredEnd] = useState(props.datesCoveredEnd);
  const reduxData1 = useSelector((state) => state.license);
  const location = useLocation();

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);
  const params = useParams();

  const { formData } = props;

  const { control, watch, setValue, getValues, reset, trigger } = useForm({
    defaultValues: {
      licenceLimitations: "",
    },
    mode: "onChange",
  });

  // Adapter that mimics the antd form API so the shared bindData helper keeps
  // working without modification.
  const form = useMemo(
    () => ({
      setFieldsValue: (vals) =>
        Object.entries(vals).forEach(([k, v]) => setValue(k, v)),
      getFieldValue: (name) => getValues(name),
      resetFields: () => reset(),
    }),
    [setValue, getValues, reset]
  );

  useEffect(() => {
    const selectedData =
      reduxData.support && reduxData.support.length
        ? reduxData.support
        : reduxData1.selectedLicense;

    if (typeof selectedData === "object" && Object.keys(selectedData).length) {
      bindData(selectedData, form);
    } else if (location.state && location.state.record) {
      let data = [
        {
          licenceLimitations: location.state.record.licenseLimitations,
        },
      ];
      bindData(data, form);
    } else {
      bindData([], form);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData, reduxData1, location]);

  useEffect(() => {
    if (formData) {
      trigger().then((ok) => {
        if (ok) {
          const v = getValues();
          dispatch(support([{ licenceLimitations: v.licenceLimitations }]));
          props.next(true);
        }
      });

      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const limitationsLength = (watch("licenceLimitations") || "").length;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 10 }}>
          <FormField
            name="licenceLimitations"
            type="textarea"
            rows={6}
            control={control}
            label={labelWithTip("Licence Limitations")}
            placeholder="Licence Limitations"
            helperText={`${limitationsLength}/1000`}
            inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default LicenseLimitations;
