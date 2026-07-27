import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Divider, Grid, Tooltip, Typography } from "@mui/material";

import { updateTaskAction } from "../../../store/actions/MyTasksActions";
import {
  getDetailsByChangeRequestId,
  getVendorDetailsById,
} from "../../../store/actions/VendorActions";
import { TaskDetailLayout } from "../../myTasks";
import isAcessDisabled from "../../../utils/accessMyTask";
import { FormField, useSnackbar, NoDataAlert } from "../../../design-system";

import "./VendorDetails.css";

const InfoField = ({ label, children }) => (
  <Box>
    <Typography
      component="div"
      className="label-review"
      sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mb: 0.25 }}
    >
      {label}
    </Typography>
    <Box sx={{ fontSize: 14, color: "text.primary" }}>{children || "-"}</Box>
  </Box>
);

const VendorDetails = (props) => {
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisable, setBtnDisable] = useState(false);
  const entityDetailsObj = useSelector((state) => state.vendor);
  const params = useParams();
  const history = useHistory();

  const myTaskData = props.location.state.myTaskData;
  const {
    entityId,
    longName,
    shortName,
    entityType,
    website,
    entityStatus,
    entityDescription,
  } = entityDetailsObj.data;

  const hasEntityData = !!(
    entityId ||
    longName ||
    shortName ||
    entityType ||
    entityStatus ||
    entityDescription
  );

  const {
    control: rejectControl,
    handleSubmit: handleRejectSubmit,
    setError: setRejectError,
    reset: resetReject,
    getValues: getRejectValues,
  } = useForm({ defaultValues: { reason: "" } });

  useEffect(() => {
    const val = myTaskData.taskListTaskStatus.toString().toLowerCase() !== "pending";
    setBtnDisable(val);
  }, [myTaskData]);

  const showApproveModal = (event) => {
    if (!event) return;
    const payload = {
      ...event,
      taskListId: params.taskId,
      taskListTaskStatus: "APPROVED",
      taskListApproveBy: localStorage.getItem("psid"),
      roleName: localStorage.getItem("entitlementType"),
    };
    setCurrentActionData(payload);
    setApproveModal(true);
  };

  const handleApprove = async () => {
    const res = await dispatch(updateTaskAction(currentActionData));
    setApproveModal(false);
    const message1 =
      res && res.data && res.data.statusMessage
        ? res.data.statusMessage.message
        : null;
    if (res && res.data && res.data.statusMessage) {
      if (message1) snackbar.success(message1);
      setBtnDisable(true);
      history.push("/myTasks");
    }
  };

  const handleApproveCancel = () => setApproveModal(false);

  const showRejectModal = (event) => {
    if (!event) return;
    const payload = {
      ...event,
      taskListId: params.taskId,
      taskListTaskStatus: "REJECTED",
      taskListApproveBy: localStorage.getItem("psid"),
      roleName: localStorage.getItem("entitlementType"),
    };
    setCurrentActionData(payload);
    setRejectModal(true);
  };

  useEffect(() => {
    const id = params.id;
    if (myTaskData.taskListObjectAction === "Create") {
      dispatch(getVendorDetailsById(id));
    } else {
      dispatch(getDetailsByChangeRequestId(id));
    }
  }, []);

  const submitReason = async () => {
    const value = getRejectValues();
    if (!value.reason || !value.reason.length) {
      setRejectError("reason", { type: "required", message: "reason is mandatory !" });
      return;
    }
    const payload = { ...currentActionData, taskListRejectionReason: value.reason };
    const res = await dispatch(updateTaskAction(payload));
    resetReject({ reason: "" });
    setRejectModal(false);
    if (res && res.data) history.push("/myTasks");
  };

  const handleRejectCancel = () => {
    setRejectModal(false);
  };

  const isBtnDisplay =
    btnDisable ||
    isAcessDisabled(myTaskData) ||
    myTaskData.taskListCreatedBy === localStorage.getItem("psid");

  return (
    <TaskDetailLayout
      title={shortName}
      breadcrumbName={shortName}
      actionsDisabled={isBtnDisplay}
      onApproveClick={() => showApproveModal(myTaskData)}
      onRejectClick={() => showRejectModal(myTaskData)}
      approveOpen={approveModal}
      rejectOpen={rejectModal}
      onApprove={handleApprove}
      onReject={handleRejectSubmit(submitReason)}
      onApproveCancel={handleApproveCancel}
      onRejectCancel={handleRejectCancel}
      className="entity-main"
      rejectContent={
        <Tooltip placement="top" title="reason">
          <span>
            <FormField
              name="reason"
              label="Reason"
              control={rejectControl}
              type="textarea"
              rows={4}
              required="reason is mandatory !"
            />
          </span>
        </Tooltip>
      }
    >
      <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
        Entity Details
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {hasEntityData ? (
        <Box className="vendor-from">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Entity ID">{entityId}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Long Name">{longName}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Short Name">{shortName}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Entity Type">{entityType}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Website">{website}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Status">{entityStatus}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Description">{entityDescription}</InfoField>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <NoDataAlert
          title="Entity details not available"
          message="The entity details for this task could not be found or have not been provided."
        />
      )}
    </TaskDetailLayout>
  );
};

const mapStateToProps = (state) => ({
  vendors: state.vendorList,
});

export default connect(mapStateToProps)(VendorDetails);
