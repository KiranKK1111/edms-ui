import { memo, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Box, Checkbox, FormControlLabel, Grid, InputAdornment } from "@mui/material";

import { FormField } from "../../design-system";
import { contractDetails } from "../../store/actions/contractAction";
import dayjs from "../../design-system/dayjs";
import "./VendorContacts.css";

// Preserved for external consumers (VendorData.js, tests) that import this.
export const CamelText = (input) => {
  let result = input[0].toString();
  for (let i = 1; i < input.length; i = i + 1) {
    result =
      input[i - 1] === " " || input[i - 1] === "-" || input[i - 1] === "_"
        ? result + input[i]
        : result + input[i].toLowerCase();
  }
  return result;
};

const AGREEMENT_TYPES = [
  { value: "Vendor contract", label: "Vendor Contract" },
  { value: "External Partner Agreement", label: "External Partner Agreement" },
  { value: "Internal SCB Agreement", label: "Internal SCB Agreement" },
  { value: "No Agreement", label: "No Agreement" },
];

const ContractDetails = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams();
  const reduxData = useSelector((state) => state.contract);
  const info = useSelector((state) => state.vendor);
  const { formData } = props;

  const esName = params.vendorId || params.id || "";
  const isAddAgreement = history.location.pathname.includes("addAgreement");

  const [optionSelected, setOptionSelected] = useState(false);
  const [noExpiry, setNoExpiry] = useState(false);
  const [nameValidation, setNameValidation] = useState(false);
  const [boundFromStore, setBoundFromStore] = useState(false);

  const {
    control,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      agreementId: "",
      agreementName: "",
      referenceId: "",
      referenceText: "",
      agreementType: "",
      dataSource: "",
      agreementValue: "",
      signedOn: null,
      startDate: null,
      expirationDate: null,
      ScbAgreementManagerBankId: "",
      status: "Pending",
    },
    mode: "onChange",
  });

  const entityShortNames =
    info.list && info.list.length
      ? [...new Set(info.list.map((v) => v.shortName))]
      : [];

  // Bind existing data in edit / navigate-back scenarios. The selected record
  // is dispatched by the PARENT controller's effect, which runs after this
  // component's mount effect — so this must re-run when the record lands in
  // the store (a mount-only effect would leave the edit form blank). `bound`
  // guards against clobbering user edits once a bind has happened.
  useEffect(() => {
    if (boundFromStore) return;
    setValue("status", "Pending");

    let selectedData = [];
    if (reduxData.selectedContract && reduxData.selectedContract.length) {
      const c = reduxData.selectedContract[0];
      selectedData = [
        {
          ...c,
          expirationDate: c.agreementExpiryDate,
          dataSource: c.agreementPartyId,
          referenceText: c.agreementReferenceText,
          ScbAgreementManagerBankId: c.agreementScbAgreementMgrBankId,
          signedOn: c.agreementSignedOn,
          startDate: c.agreementStartDate,
          status: c.agreementStatus,
          referenceId: c.agreementReferenceId,
        },
      ];
    }

    const source =
      reduxData.contractDetails && reduxData.contractDetails.length
        ? reduxData.contractDetails
        : selectedData;

    if (source && source.length) {
      const d = source[0];
      reset({
        agreementId: d.agreementId || "",
        agreementName: d.agreementName || "",
        referenceId: d.referenceId || "",
        referenceText: d.referenceText || "",
        agreementType: d.agreementType || "",
        dataSource: d.dataSource || "",
        agreementValue: d.agreementValue || "",
        signedOn: d.signedOn ? dayjs(new Date(d.signedOn)) : null,
        startDate: d.startDate ? dayjs(new Date(d.startDate)) : null,
        expirationDate: d.expirationDate
          ? dayjs(new Date(d.expirationDate))
          : null,
        ScbAgreementManagerBankId: d.ScbAgreementManagerBankId || "",
        status: d.status || "Pending",
      });
      if (
        d.dataSource &&
        (d.dataSource === params.vendorId || d.dataSource === params.id)
      ) {
        setOptionSelected(true);
      }
      if (!d.expirationDate) setNoExpiry(true);
      setBoundFromStore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData.selectedContract, reduxData.contractDetails]);

  // Auto-compose the agreement name and run the duplicate check whenever the
  // contributing fields change. Name = <entity>_<signedOn DDMMYYYY>_<refText>.
  const referenceText = watch("referenceText");
  const signedOn = watch("signedOn");
  useEffect(() => {
    const signedOnDate = signedOn ? dayjs(signedOn).format("DDMMYYYY") : "";
    const name = `${esName}_${signedOnDate}_${referenceText || ""}`;
    setValue("agreementName", name);

    const all = (reduxData.data && reduxData.data[0]) || [];
    const currentId = getValues("agreementId");
    const candidates = currentId
      ? all.filter((a) => String(a.agreementId) !== String(currentId))
      : all;
    const duplicate = candidates.some((a) => a.agreementName === name);
    setNameValidation(duplicate);
    if (duplicate) {
      setError("agreementName", {
        type: "manual",
        message: "Agreement name already exists under this entity",
      });
    } else {
      clearErrors("agreementName");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceText, signedOn, esName]);

  // The parent (RequestFormSteps) flips `formData` to true when Next is
  // clicked. Validate, and on success persist + advance to the next step.
  useEffect(() => {
    if (formData) {
      trigger().then((ok) => {
        if (ok && !nameValidation) {
          dispatch(contractDetails([getValues()]));
          props.next(true);
        }
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleSameAsParty = (e) => {
    const checked = e.target.checked;
    setOptionSelected(checked);
    if (checked) {
      setValue("dataSource", isAddAgreement ? params.id : params.vendorId, {
        shouldValidate: true,
      });
    }
  };

  const handleNoExpiry = (e) => {
    const checked = e.target.checked;
    setNoExpiry(checked);
    if (checked) {
      setValue("expirationDate", null);
      clearErrors("expirationDate");
    }
  };

  const disablePastDate = (date) => date && date < dayjs().endOf("day");

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="agreementId"
            label="Agreement ID"
            control={control}
            placeholder="Agreement ID will be generated after submission"
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="agreementValue"
            label="Agreement Value"
            control={control}
            placeholder="Enter Agreement Value"
            required="Agreement value is mandatory !"
            rules={{
              pattern: {
                value: /^[0-9]+$/,
                message: "Only numbers and positive numbers are allowed",
              },
            }}
            startAdornment={
              <InputAdornment position="start">USD</InputAdornment>
            }
          />
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="agreementName"
            label="Agreement Name"
            control={control}
            placeholder="Auto-generated by system"
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="signedOn"
            label="Signed On"
            type="date"
            control={control}
            required="Signed on is required !"
          />
        </Grid>

        {/* Row 3 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="referenceId"
            label="Reference ID"
            control={control}
            placeholder="Reference ID"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="startDate"
            label="Start Date"
            type="date"
            control={control}
            required="Start date is required !"
          />
        </Grid>

        {/* Row 4 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="referenceText"
            label="Reference Text"
            control={control}
            placeholder="Reference Text"
            required="Reference Text is mandatory !"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FormField
                name="expirationDate"
                label="Expiration Date"
                type="date"
                control={control}
                disabled={noExpiry}
                required={!noExpiry ? "Expiration Date is required !" : false}
              />
            </Box>
            <FormControlLabel
              sx={{ mt: 1, mr: 0, whiteSpace: "nowrap" }}
              control={
                <Checkbox
                  size="small"
                  checked={noExpiry}
                  onChange={handleNoExpiry}
                />
              }
              label="No Expiry"
            />
          </Box>
        </Grid>

        {/* Row 5 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="agreementType"
            label="Agreement Type"
            type="select"
            control={control}
            required="Agreement Type is mandatory !"
            options={AGREEMENT_TYPES}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="ScbAgreementManagerBankId"
            label="SCB Manager Bank ID"
            control={control}
            placeholder="SCB Manager Bank ID"
            required="SCB Manager Bank ID is required !"
          />
        </Grid>

        {/* Row 6 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FormField
                name="dataSource"
                label="Data Source"
                type="autocomplete"
                control={control}
                required="Please select a data source"
                disabled={optionSelected}
                options={entityShortNames}
              />
            </Box>
            <FormControlLabel
              sx={{ mt: 1, mr: 0, whiteSpace: "nowrap" }}
              control={
                <Checkbox
                  size="small"
                  checked={optionSelected}
                  onChange={handleSameAsParty}
                />
              }
              label="Same as Agreement Party"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="status"
            label="Status"
            control={control}
            placeholder="Status"
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(ContractDetails);
