import { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Box, Grid } from "@mui/material";
import { FieldLabel, FormField } from "../../design-system";
import { vendorContacts } from "../../store/actions/contractAction";
import "./VendorContacts.css";

const VendorContacts = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.contract);

  const { control, setValue, getValues, reset, trigger } = useForm({
    defaultValues: {
      agreementLimitations: "",
      billingModel: "Shared cost",
    },
    mode: "onChange",
  });

  // Adapter exposing the antd form API expected by the shared bindData helper.
  const formApi = useMemo(
    () => ({
      setFieldsValue: (obj) =>
        Object.keys(obj).forEach((k) => setValue(k, obj[k])),
      getFieldValue: (name) => getValues(name),
      getFieldsValue: () => getValues(),
      resetFields: () => reset(),
    }),
    [setValue, getValues, reset]
  );

  useEffect(() => {
    formApi.setFieldsValue({
      billingModel: "Shared cost",
    });
    // Bind ONLY this step's fields — binding the whole record would leak every
    // agreement column into getValues() and hence into the Review screen.
    const src = reduxData.vendorContacts.length
      ? reduxData.vendorContacts
      : reduxData.selectedContract;
    if (src && src.length && src[0]) {
      const d = src[0];
      formApi.setFieldsValue({
        agreementLimitations: d.agreementLimitations || "",
        ...(d.billingModel ? { billingModel: d.billingModel } : {}),
      });
    }
  }, [reduxData.vendorContacts, reduxData.selectedContract, formApi]);

  const onFinish = (values) => {
    dispatch(vendorContacts([values]));
    props.next(true);
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

  // Let the controller persist the current (unvalidated) input when Previous
  // is clicked, so nothing typed since the last Next is lost.
  useEffect(() => {
    if (!props.registerDraftSaver) return;
    props.registerDraftSaver(() => dispatch(vendorContacts([getValues()])));
    return () => props.registerDraftSaver(null);
  });

  return (
    <Box component="form" noValidate>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 11 }}>
          <FieldLabel text="Agreement Limitations" tooltip="Agreement Limitations" />
          <FormField
            name="agreementLimitations"
            type="textarea"
            rows={6}
            control={control}
            inputProps={{ maxLength: 1000 }}
            placeholder="Agreement Limitations"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(VendorContacts);
