import { HelpOutlineOutlined } from "@mui/icons-material";
import { Box, Grid, Tooltip } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FormField } from "../../../design-system";
import { dataset } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

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

function Dataset(props) {
  const reduxData1 = useSelector((state) => state.license);
  const [personalData] = useState(props.personalData);
  const [dataValidity] = useState(props.dataValidity);
  const [metaData] = useState(props.metaData);
  const params = useParams();

  const [securityRating, setSecurityRating] = useState(null);

  const [metaDataViewPermission] = useState(props.metaDataViewPermission);

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);

  const { formData } = props;

  const { control, setValue, getValues, reset, trigger } = useForm({
    defaultValues: {
      personalData: "yes",
      securityRating: "",
      dataValidity: "yes",
      metaData: "yes",
      metaDataViewPermission: "yes",
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
    if (!params.id) {
      form.setFieldsValue({
        personalData: "yes",
        dataValidity: "yes",
        metaData: "yes",
        metaDataViewPermission: "yes",
      });
    }

    const selectedData =
      reduxData.dataset && reduxData.dataset.length
        ? reduxData.dataset
        : reduxData1.selectedLicense;

    if (typeof selectedData === "object" && Object.keys(selectedData).length) {
      bindData(selectedData, form);
      setSecurityRating(
        selectedData[0] && selectedData[0].securityRating
          ? selectedData[0].securityRating
          : null
      );
    } else {
      bindData([], form);

      form.setFieldsValue({
        personalData: "yes",
        dataValidity: "yes",
        metaData: "yes",
        metaDataViewPermission: "yes",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData) {
      trigger().then((ok) => {
        if (ok) {
          const v = getValues();
          dispatch(
            dataset([
              {
                personalData: v.personalData,
                securityRating: v.securityRating,
                dataValidity: v.dataValidity,
                metaData: v.metaData,
                metaDataViewPermission: v.metaDataViewPermission,
              },
            ])
          );
          props.next(true);
        }
      });

      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Preserve the antd Radio.Group onChange contract (handleChange reads
  // e.target.name and e.target.value in the parent).
  const handleRadioChange = (name) => (e) =>
    props.handleChange({ target: { name, value: e.target.value } });

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="personalData"
            type="radio"
            row
            control={control}
            label={labelWithTip("Dataset contains Personal Data")}
            options={YES_NO_OPTIONS}
            onChange={handleRadioChange("personalData")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="securityRating"
            type="select"
            control={control}
            label={labelWithTip("Information Security Rating")}
            required="Information Security Rating is mandatory !"
            placeholder="Select your security rating"
            onChange={(e) => props.handleInformationSecurityRating(e.target.value)}
            options={[
              { value: "C1-Public data", label: "Public data" },
              { value: "C2-Internal data", label: "Internal data" },
              { value: "C3-Confidential data", label: "Confidential data" },
              { value: "C4-Restrcited data", label: "Restricted data" },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="dataValidity"
            type="radio"
            row
            control={control}
            label={labelWithTip("Data Validity")}
            options={YES_NO_OPTIONS}
            onChange={handleRadioChange("dataValidity")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="metaData"
            type="radio"
            row
            control={control}
            label={labelWithTip("Metadata Available")}
            options={YES_NO_OPTIONS}
            onChange={handleRadioChange("metaData")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="metaDataViewPermission"
            type="radio"
            row
            control={control}
            label={labelWithTip("Metadata Viewing Permission")}
            options={YES_NO_OPTIONS}
            onChange={handleRadioChange("metaDataViewPermission")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dataset;
