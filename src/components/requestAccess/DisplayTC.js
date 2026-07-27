import { useEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { FormField } from "../../design-system";
import { terms } from "../../store/actions/requestAccessActions";
import { TCGeneralSubscription } from "../termsAndConditions/tcGeneralSubscription";
import { TCApplicationSubscription } from "../termsAndConditions/tcApplicationSubscription";
import { TCVendorRequestSubscription } from "../termsAndConditions/tcVendorRequestSubscription";

const DisplayTC = (props) => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.requestAccess);

  const vendorRequest = useSelector((state) => state.datafeedInfo.congigUi.vendorRequestConfig);

  const { control, setValue, getValues, trigger } = useForm({
    defaultValues: {
      generalSubscription: false,
      applicationSubscription: false,
      vendorSubscription: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const firstBr =
      reduxData.businessRequirements && reduxData.businessRequirements[0];
    const hasSubscriptionId =
      firstBr &&
      firstBr.subscriptionId &&
      firstBr.subscriptionId.length;
    if (reduxData.terms === true || hasSubscriptionId) {
      setValue("generalSubscription", true);
      setValue("applicationSubscription", true);
      setValue("vendorSubscription", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.formData) {
      trigger().then((ok) => {
        if (ok) {
          const values = getValues();
          if (values.generalSubscription === true) {
            dispatch(terms(values.generalSubscription));
            props.next(true);
          }
          if (values.applicationSubscription === true) {
            dispatch(terms(values.applicationSubscription));
            props.next(true);
          }
          if (values.vendorSubscription === true) {
            dispatch(terms(values.applicationSubscription));
            props.next(true);
          }
        }
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData]);

  return (
    <div className="display-terms-and-conditions">
      <Box component="form">
        <TCGeneralSubscription view={props.view} />
        {props.view === "rd" && props.subForFlag ? <br /> : null}
        {props.view === "tc" ? (
          <FormField
            name="generalSubscription"
            type="checkbox"
            control={control}
            label="I have read and accept the terms and conditions for general subscription"
            rules={{
              validate: (checked) =>
                checked
                  ? true
                  : "Please accept the terms and conditions for general subscription.",
            }}
          />
        ) : null}
        {props.view === "tc" || (props.view !== "tc" && !props.subForFlag) ? (
          <>
            {" "}
            {props.view !== "tc" ? <br /> : null}
            <TCApplicationSubscription view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest} />
            {props.view === "rd" ? <br /> : null}
            {props.view === "tc" ? (
              <FormField
                name="applicationSubscription"
                type="checkbox"
                control={control}
                disabled={props.subForFlag}
                label="I have read and accept the terms and conditions for application subscription"
                rules={{
                  validate: (checked) =>
                    !props.subForFlag && !checked
                      ? "Please accept the terms and conditions for application subscription."
                      : true,
                }}
              />
            ) : null}{" "}
          </>
        ) : null}
        {(props.view === "tc" && vendorRequest === "Y") ||
        (props.view !== "tc" && props.vendorRequest === "Y" && !props.subForFlag) ? (
          <>
            {" "}
            {props.view !== "rd" && props.view != "tc" ? <br /> : null}{" "}
            <TCVendorRequestSubscription view={props.view} subForFlag={props.subForFlag} vendorRequest={props.vendorRequest} dfVendor={vendorRequest} />
            {props.view === "rd" ? <br /> : null}
            {props.view === "tc" ? (
              <FormField
                name="vendorSubscription"
                type="checkbox"
                control={control}
                disabled={
                  (props.subForFlag && vendorRequest === "Y") ||
                  (!props.subForFlag && props.vendorRequest !== "Y")
                }
                label="I have read and accept the terms and conditions for on-demand vendor request"
                rules={{
                  validate: (checked) =>
                    !props.subForFlag &&
                    vendorRequest === "Y" &&
                    props.vendorRequest === "Y" &&
                    !checked
                      ? "Please accept the terms and conditions for for on-demand vendor request."
                      : true,
                }}
              />
            ) : null}
          </>
        ) : null}
      </Box>
    </div>
  );
};

export default memo(DisplayTC);
