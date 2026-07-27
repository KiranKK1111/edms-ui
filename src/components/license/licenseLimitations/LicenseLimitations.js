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
    // Wizard draft (saved on Next/Previous) wins over the DB record.
    if (reduxData.support && reduxData.support.length) {
      bindData(reduxData.support, form);
      return;
    }
    // DB record: note the key is licenSe... while the form field is
    // licenCe... — map it explicitly (binding the raw record leaves the
    // field empty).
    const selected = reduxData1.selectedLicense;
    const record =
      (Array.isArray(selected) && selected.length && selected[0]) ||
      (location.state && location.state.record) ||
      null;
    if (record) {
      form.setFieldsValue({
        licenceLimitations:
          record.licenceLimitations ?? record.licenseLimitations ?? "",
      });
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

  // Let the controller persist the current (unvalidated) input when Previous
  // is clicked, so text typed since the last Next is not lost.
  useEffect(() => {
    if (!props.registerDraftSaver) return;
    props.registerDraftSaver(() =>
      dispatch(
        support([{ licenceLimitations: getValues("licenceLimitations") }])
      )
    );
    return () => props.registerDraftSaver(null);
  });

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
