import { Box, Checkbox, FormControlLabel, Grid, InputAdornment } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { connect, useDispatch, useSelector } from "react-redux";
import { FormField } from "../../../design-system";
import { licenseDetails } from "../../../store/actions/licensedataAction";
import { bindData } from "../bindData/bindData";
import "./licensedetails.css";
import countryList from "country-list";
import { useParams, useLocation } from "react-router-dom";
import dayjs from "../../../design-system/dayjs";
import { getLicenseCountById } from "../../../store/services/LicenseService";

const LICENCE_TYPE_OPTIONS = [
  { value: "Enterprise Licence", label: "Enterprise Licence" },
  { value: "User Licence", label: "User Licence" },
];

const DATA_PROCUREMENT_OPTIONS = [
  { value: "Data Leasing", label: "Data Leasing" },
  { value: "Data Purchase", label: "Data Purchase" },
  { value: "Free Data", label: "Free Data" },
];

const Licensedetails = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.licenseReq);
  const reduxData1 = useSelector((state) => state.license);
  const params = useParams();
  const { formData } = props;
  let countryListNew = countryList.getCodeList();
  countryListNew = { GO: "Global", ...countryListNew };
  const [shortNameFound, setShortNameFound] = useState(false);

  const [longNameFound, setLongNameFound] = useState(false);
  const [licenseName] = useState(props.licenseName);
  const [contractName] = useState(props.contractName);
  const [dataCoverage] = useState(props.dataCoverage);
  const [licenseType] = useState(props.licenseType);

  const [licenseCost] = useState(props.licenseCost);
  const [licenseid] = useState(props.licenseid);
  const [nameFound, setNameFound] = useState(false);
  const [checked, setChecked] = useState(false);
  const location = useLocation();
  const path = location.pathname.includes("addLicense");
  const [noOfLicensesPurchased, setNoOfLicensesPurchased] = useState("");

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
      licenceId: "",
      licenceValue: "",
      longName: "",
      expirationDate: null,
      shortName: "",
      NoOfLicencePurchased: "",
      licenceType: "",
      NoOfLicenceUsed: "",
      dataProcurementType: "",
      status: "",
      contractId: "",
      licenseStatus: "",
      "Subscription ID": "",
    },
    mode: "onChange",
  });

  // Adapter that mimics the antd form API so the shared bindData helper and
  // the existing field read/write call-sites keep working without changes.
  const form = useMemo(
    () => ({
      setFieldsValue: (vals) =>
        Object.entries(vals).forEach(([k, v]) => setValue(k, v)),
      getFieldValue: (name) => getValues(name),
      resetFields: () => reset(),
    }),
    [setValue, getValues, reset]
  );

  const onFinish = () => {
    if (!shortNameFound && !longNameFound) {
      const v = getValues();
      const payload = {
        licenceId: v.licenceId,
        licenceValue: v.licenceValue,
        longName: v.longName,
        expirationDate: v.expirationDate,
        shortName: v.shortName,
        NoOfLicencePurchased: v.NoOfLicencePurchased,
        licenceType: v.licenceType,
        dataProcurementType: v.dataProcurementType,
        status: v.status,
      };
      if (!path) {
        payload.NoOfLicenceUsed = v.NoOfLicenceUsed;
      }
      dispatch(licenseDetails([payload]));
      props.next(true);
    }
  };

  useEffect(() => {
    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);
    const ddd = dayjs("2099-12-31").format("YYYY-MM-DD[T]HH:mm:ss");
    const existingDate = dayjs(agreementRecord.agreementExpiryDate).format(
      "YYYY-MM-DD[T]HH:mm:ss"
    );
    form.setFieldsValue({
      "Subscription ID": "e6cddc38-674c-4c85-860d-5b2a873fd667",
      contractId: props.contractId,
      licenseStatus: props.licenseStatus,
      expirationDate:
        agreementRecord.agreementNoExpiryFlag.toLowerCase() === "y"
          ? dayjs.utc(ddd)
          : dayjs.utc(existingDate),
    });
    let data;
    if (
      reduxData.licenseDetailsRequirements &&
      reduxData.licenseDetailsRequirements.length
    ) {
      data = reduxData.licenseDetailsRequirements;
    } else if (location.state && location.state.record) {
      const {
        licenseId: licenceId,
        licenseLongName: longName,
        licenseShortName: shortName,
        licenseType: licenceType,
        licenseDataProcurementType: dataProcurementType,
        licenseValuePerMonth: licenceValue,
        licenseExpiryDate: expirationDate,
        licenseNumberOfLicensesPurchaised: NoOfLicencePurchased,
        licenseNumberOfLicensesUsed: NoOfLicenceUsed,
        licenseStatus: status,
      } = location.state.record;
      data = [
        {
          licenceId,
          longName,
          shortName,
          licenceType,
          dataProcurementType,
          licenceValue,
          expirationDate,
          NoOfLicencePurchased,
          NoOfLicenceUsed,
          status,
        },
      ];
    } else {
      data = [{ NoOfLicenceUsed: 0, status: "Pending" }];
    }
    bindData(data, form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData1.selectedLicense, location]);

  useEffect(() => {
    if (props.contractId) {
      form.setFieldsValue({
        contractId: props.contractId,
        licenseStatus: props.licenseStatus,
      });
      if (getValues("licenceName")) {
        handleDuplicateChange(props.contractId);
      }
    }
    if (formData) {
      trigger().then((ok) => {
        if (ok) {
          onFinish();
        }
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, props.contractId]);

  const handleDuplicateChange = (e) => {
    let inputValue = "";
    if (e && e.target) {
      inputValue = e.target.value;
    } else {
      inputValue = getValues("licenseName");
    }

    if (props.licenseList) {
      if (props.contractId && props.licenseList) {
        let licenseList = props.licenseList.filter((item) => {
          const id = typeof e === "string" ? e : props.contractId;
          return item.contractId === id;
        });
        if (licenseList && licenseList.length) {
          licenseList.find((ele) => {
            if (ele.licenseName.toLowerCase() === inputValue.toLowerCase()) {
              if (params.id) {
                const status = props.isLicenseNameChanged ? true : false;
                setNameFound(status);
              } else {
                setNameFound(true);
              }
              if (typeof e !== "string") {
                props.handleChange(e);
              }
              return true;
            } else {
              setNameFound(false);
              if (typeof e !== "string") {
                props.handleChange(e);
              }
              return false;
            }
          });
        } else {
          setNameFound(false);
        }
      } else {
        setNameFound(false);
      }
    } else {
      setNameFound(false);
    }
  };

  const compareDate = (e) => {
    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);
    const date1 = dayjs(e).format("YYYY-MM-DD");
    const date2 = agreementRecord.agreementExpiryDate
      ? dayjs(agreementRecord.agreementExpiryDate).format("YYYY-MM-DD")
      : "";

    if (!dayjs(date1).isSame(date2)) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  };

  const handleNameCheck = (e) => {
    let licenseId = document.getElementsByClassName("LicenseId");
    let inputValue = e.target.value;

    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);

    let agreementId = agreementRecord.agreementId;
    inputValue = inputValue.trim();

    let licenseUnderAgreement = props.licenseList.filter((eachLicense) => {
      if (licenseId && licenseId.length > 0) {
        return (
          eachLicense.licenseAgreementId === agreementId &&
          eachLicense.licenseId != licenseId[0].value
        );
      } else {
        return eachLicense.licenseAgreementId === agreementId;
      }
    });
    if (licenseUnderAgreement && licenseUnderAgreement.length) {
      let result = licenseUnderAgreement.filter((eachLicense) => {
        const licenseShortName = eachLicense.licenseShortName;
        return licenseShortName === inputValue;
      });
      if (result && result.length) {
        setShortNameFound(true);
        setError("shortName", {
          type: "manual",
          message: "Licence name already exists under this agreement",
        });
      } else {
        setShortNameFound(false);
        clearErrors("shortName");
      }
    }
  };

  const handleLongNameCheck = (e) => {
    let licenseId = document.getElementsByClassName("LicenseId");
    let inputValue = e.target.value;

    let agreementRecord = localStorage.getItem("agRecord");
    agreementRecord = JSON.parse(agreementRecord);

    let agreementId = agreementRecord.agreementId;
    inputValue = inputValue.trim();

    let licenseUnderAgreement = props.licenseList.filter((eachLicense) => {
      if (licenseId && licenseId.length > 0) {
        return (
          eachLicense.licenseAgreementId === agreementId &&
          eachLicense.licenseId != licenseId[0].value
        );
      } else {
        return eachLicense.licenseAgreementId === agreementId;
      }
    });
    if (licenseUnderAgreement && licenseUnderAgreement.length) {
      let result = licenseUnderAgreement.filter((eachLicense) => {
        const licenseLongName = eachLicense.licenseLongName;
        return licenseLongName === inputValue;
      });
      if (result && result.length) {
        setLongNameFound(true);
        setError("longName", {
          type: "manual",
          message: "Licence name already exists under this agreement",
        });
      } else {
        setLongNameFound(false);
        clearErrors("longName");
      }
    }
  };

  const handleLicenseTypeChange = (e) => {
    if (e === "Enterprise Licence")
      form.setFieldsValue({ NoOfLicencePurchased: "Unlimited" });
    else if (e === "User Licence")
      form.setFieldsValue({ NoOfLicencePurchased: "" });
  };

  useEffect(() => {
    let mounted = true;
    if (!path) {
      getLicenseCountById(form.getFieldValue("licenceId")).then((res) => {
        if (!mounted) return;
        if (res && res.data && res.data.licenseListCount >= 0) {
          form.setFieldsValue({ NoOfLicenceUsed: res.data.licenseListCount });
        }
      });
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      reduxData.licenseDetailsRequirements &&
      reduxData.licenseDetailsRequirements.length
    ) {
      compareDate(reduxData.licenseDetailsRequirements.expirationDate);
    } else if (location.state && location.state.record) {
      const date = location.state.record.licenseExpiryDate;
      compareDate(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData, location]);

  const isUserLicence = watch("licenceType") === "User Licence";

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="licenceId"
            label="Licence ID"
            control={control}
            placeholder="Licence ID will be generated after submission"
            disabled
            className="LicenseId"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="licenceValue"
            label="Licence Value"
            control={control}
            placeholder="Enter Licence Value"
            required="Licence value is mandatory !"
            rules={{
              pattern: {
                value: /^[0-9]+$/,
                message: "Only numbers and positive numbers are allowed",
              },
            }}
            onChange={props.handleChange}
            startAdornment={
              <InputAdornment position="start">USD</InputAdornment>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="longName"
            label="Long Name"
            control={control}
            placeholder="Enter Long Name"
            required="Long name is mandatory!"
            onBlur={handleLongNameCheck}
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
                required="Please select a expiration date"
                onChange={compareDate}
              />
            </Box>
            <FormControlLabel
              sx={{ mt: 1, mr: 0, whiteSpace: "nowrap" }}
              control={<Checkbox size="small" checked={checked} readOnly />}
              label="Different from Agreement"
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="shortName"
            label="Short Name"
            control={control}
            placeholder="Enter Short Name"
            required="Short name is mandatory!"
            onBlur={handleNameCheck}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="NoOfLicencePurchased"
            label="No. of Licences purchased"
            control={control}
            placeholder="No. of Licences purchased"
            required="No. of licences purchased is mandatory!"
            rules={{
              pattern: isUserLicence
                ? {
                    value: /^[0-9]+$/,
                    message: "Only numbers and positive numbers are allowed",
                  }
                : undefined,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="licenceType"
            label="Licence Type"
            type="select"
            control={control}
            placeholder="Select"
            required="Licence Type is mandatory !"
            className="licenceType"
            options={LICENCE_TYPE_OPTIONS}
            onChange={(e) => props.handleLicenseType(e.target.value)}
          />
        </Grid>
        {path ? null : (
          <Grid size={{ xs: 12, md: 6 }}>
            <FormField
              name="NoOfLicenceUsed"
              label="No. of Licence Used"
              control={control}
              placeholder="No. of Licence Used"
              disabled
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="dataProcurementType"
            label="Data Procurement Type"
            type="select"
            control={control}
            placeholder="Select"
            required="Data procurement type is mandatory !"
            options={DATA_PROCUREMENT_OPTIONS}
            onChange={(e) => props.handleLicenseType(e.target.value)}
          />
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

const mapStateToProps = (state) => {
  return {
    selectedContract: state.contract.selectedContract,
  };
};

export default connect(mapStateToProps)(Licensedetails);
