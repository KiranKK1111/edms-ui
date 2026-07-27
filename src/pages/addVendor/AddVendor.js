import React, { useState, useEffect, useCallback } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Box, Button } from "@mui/material";

import NewVendorForm from "../../components/vendors/AddVendor/NewVendorForm";
import ReviewSubmit from "../../components/vendors/AddVendor/ReviewSubmit";
import {
  startAddVendor,
  startGetVendors,
  saveLocalData,
} from "../../store/actions/VendorActions";
import { PageFormLayout, useConfirm, useSnackbar } from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";

import "./AddVendor.css";

const AddVendor = (props) => {
  const params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const vendorList = useSelector((state) => state.vendor);

  const [current, setCurrent] = useState(0);
  const [statusPending, setStatusPending] = useState(false);
  const [pendingAlertOpen, setPendingAlertOpen] = useState(true);

  const {
    control,
    getValues,
    setValue,
    watch,
    reset,
    trigger,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      entityId: "",
      entityType: "",
      longName: "",
      shortName: "",
      entityStatus: "Pending",
      website: "",
      entityDescription: "",
      existingVendorWithScb: "yes",
    },
    mode: "onChange",
  });

  const next = useCallback(async () => {
    const ok = await trigger();
    if (!ok) return;
    const values = getValues();
    dispatch(saveLocalData(values));
    setCurrent((c) => c + 1);
  }, [trigger, getValues, dispatch]);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  const handleSubmitSuccess = async () => {
    const formValues = getValues();
    const userNameUpdated = localStorage.getItem("psid");
    const formData = {
      ...formValues,
      ...(!params.id && { createdBy: userNameUpdated }),
      isUpdate: !!params.id,
      ...(params.id && { entityId: params.id, lastUpdatedBy: userNameUpdated }),
    };
    const res = await dispatch(startAddVendor(formData));
    if (res && res.data && res.data.entityManagement) {
      snackbar.success(
        `Form entity Id ${res.data.entityManagement.entityId} submitted successfully!`
      );
      history.push("/vendorDashboard");
    } else if (res && res.data && res.data.statusMessage) {
      snackbar.success(`Form entity Id ${params.id} Updated successfully!`);
      history.push("/vendorDashboard");
    }
    if (res && res.message) {
      snackbar.warning(res.message);
    }
  };

  const handleCancel = async () => {
    const ok = await confirmer.confirm({
      title: "Discard changes?",
      content: "Your unsaved changes will be lost.",
      okText: "Discard",
      cancelText: "Stay",
      okColor: "error",
    });
    if (ok) history.push("/masterData");
  };

  const handleMapping = useCallback(() => {
    if (params.id && vendorList && vendorList.list && vendorList.list.length) {
      const vendorDetails = vendorList.list.find(
        (ele) => ele.entityId === params.id
      );
      if (vendorDetails) {
        const {
          longName,
          entityId,
          entityDescription,
          entityStatus,
          entityType,
          shortName,
          website,
        } = vendorDetails;
        setStatusPending((entityStatus || "").toLowerCase() === "pending");
        reset({
          entityId,
          longName,
          entityStatus,
          entityDescription,
          website,
          entityType,
          shortName,
          existingVendorWithScb: "yes",
        });
      }
    } else {
      setValue("existingVendorWithScb", "yes");
      setValue("entityStatus", "Pending");
    }
  }, [params.id, vendorList, reset, setValue]);

  useEffect(() => {
    if (params.id && vendorList && (!vendorList.list || !vendorList.list.length)) {
      dispatch(startGetVendors());
    }
    handleMapping();
  }, [dispatch]);

  const steps = [
    {
      key: "entityDetails",
      title: "Entity Details",
      content: (
        <NewVendorForm control={control} watch={watch} setValue={setValue} />
      ),
    },
    {
      key: "review",
      title: "Review & Submit",
      content: <ReviewSubmit />,
    },
  ];

  const isLastStep = current === steps.length - 1;
  const submitDisabled = isLastStep ? statusPending : true;

  const pageMeta = getPageConfig("vendor", { isEdit: !!params.id });

  const headerActions = (
    <>
      <Button variant="outlined" onClick={handleCancel}>
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={handleSubmitSuccess}
        disabled={submitDisabled || !isValid}
      >
        Submit
      </Button>
    </>
  );

  const stepActions = (
    <>
      <Box className="page-form-actions-left">
        {current > 0 && (
          <Button variant="outlined" onClick={prev}>
            Previous
          </Button>
        )}
      </Box>
      <Box className="page-form-actions-right">
        {current < steps.length - 1 && (
          <Button variant="contained" onClick={next}>
            Next
          </Button>
        )}
      </Box>
    </>
  );

  return (
    <PageFormLayout
      breadcrumb={pageMeta.breadcrumb}
      title={pageMeta.title}
      backTo={pageMeta.backTo}
      headerActions={headerActions}
      steps={steps.map((s) => ({ key: s.key, title: s.title }))}
      current={current}
      stepActions={stepActions}
      className={pageMeta.className}
    >
      {statusPending && pendingAlertOpen && (
        <Alert
          severity="warning"
          onClose={() => setPendingAlertOpen(false)}
          className="banner"
          sx={{ mb: 2 }}
        >
          {pageMeta.pendingAlert}
        </Alert>
      )}
      {steps[current].content}
    </PageFormLayout>
  );
};

const mapStateToProps = (state) => ({
  vendorList: state.vendor && state.vendor.list,
});

export default connect(mapStateToProps)(AddVendor);
