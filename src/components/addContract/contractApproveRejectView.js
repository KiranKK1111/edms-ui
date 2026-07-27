import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Divider, Grid, Tooltip, Typography } from "@mui/material";

import {
  getContractDetailsByChangeRequestId,
  getContractDetailsById,
} from "../../store/actions/contractAction";
import { updateTaskAction } from "../../store/actions/MyTasksActions";
import { TaskDetailLayout } from "../myTasks";
import dayjs from "../../design-system/dayjs";
import isAcessDisabled from "../../utils/accessMyTask";
import { FormField, NoDataAlert } from "../../design-system";

export const conVertDateArrayToDate = (dateArray) => {
  if (dateArray) {
    const newDatedate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];
    return dayjs(newDatedate.slice(0, 10)).format("DD MMM, YYYY");
  }
};

const InfoField = ({ label, children }) => (
  <Box>
    <Typography
      component="span"
      className="label-review"
      sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", mr: 0.5 }}
    >
      {label}
    </Typography>
    <Typography component="span" sx={{ fontSize: 14, color: "text.primary" }}>
      {children || "-"}
    </Typography>
  </Box>
);

const ContractApproveRejectView = (props) => {
  const params = useParams();
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});

  const dispatch = useDispatch();
  const history = useHistory();

  const myTaskData = props.location.state.myTaskData;
  const taskListData = history.location.state.myTaskData;

  const {
    control: rejectControl,
    handleSubmit: handleRejectSubmit,
    setError: setRejectError,
    reset: resetReject,
    getValues: getRejectValues,
  } = useForm({ defaultValues: { reason: "" } });

  useEffect(() => {
    if (
      myTaskData.taskListObjectAction === "Update" ||
      myTaskData.taskListObjectAction === "Deactivate"
    ) {
      dispatch(getContractDetailsByChangeRequestId(params.id));
    } else {
      dispatch(getContractDetailsById(params.id));
    }
  }, []);

  const data = useSelector((state) => state.contract);
  const contractDetails = (data && data.contractDetails) || {};
  const {
    agreementExpiryDate,
    agreementPartyId,
    agreementReferenceText,
    agreementScbAgreementMgrBankId,
    agreementSignedOn,
    agreementStartDate,
    agreementStatus,
    agreementId,
    agreementLimitations,
    agreementLink,
    agreementName,
    agreementType,
    agreementValue,
    agreementReferenceId,
  } = contractDetails;

  const showApproveModal = (event) => {
    if (!event) return;
    const payload = {
      ...event,
      taskListId: event.taskListId,
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
    if (res && res.data) history.push("/myTasks");
  };

  const handleApproveCancel = () => setApproveModal(false);

  const showRejectModal = (event) => {
    if (!event) return;
    const payload = {
      ...event,
      taskListId: event.taskListId,
      taskListTaskStatus: "REJECTED",
      taskListApproveBy: localStorage.getItem("psid"),
      roleName: localStorage.getItem("entitlementType"),
    };
    setCurrentActionData(payload);
    setRejectModal(true);
  };

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

  const handleRejectCancel = () => setRejectModal(false);

  const isBtnDisplay =
    taskListData.taskListTaskStatus.toString().toLowerCase() !== "pending" ||
    isAcessDisabled(myTaskData) ||
    taskListData.taskListCreatedBy === localStorage.getItem("psid");

  const isUpdate =
    myTaskData.taskListObjectAction === "Update" ||
    myTaskData.taskListObjectAction === "Deactivate";

  return (
    <TaskDetailLayout
      title={agreementName}
      breadcrumbName="Agreement Details"
      actionsDisabled={isBtnDisplay}
      onApproveClick={() => showApproveModal(taskListData)}
      onRejectClick={() => showRejectModal(taskListData)}
      approveOpen={approveModal}
      rejectOpen={rejectModal}
      onApprove={handleApprove}
      onReject={handleRejectSubmit(submitReason)}
      onApproveCancel={handleApproveCancel}
      onRejectCancel={handleRejectCancel}
      className="agreement-details"
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
      {agreementId || agreementName ? (
        <Box>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography
                component="span"
                className="details-header-review"
                sx={{ fontSize: 16, fontWeight: 600 }}
              >
                Agreement Details
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Agreement ID :">{agreementId}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Agreement Name:">{agreementName}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Reference ID:">{agreementReferenceId}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Reference Text:">{agreementReferenceText}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Agreement Type:">{agreementType}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Data Source:">{agreementPartyId}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Agreement Value:">{agreementValue}</InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Signed On:">
                {isUpdate
                  ? conVertDateArrayToDate(agreementSignedOn)
                  : agreementSignedOn
                  ? dayjs(agreementSignedOn).format("DD MMM, YYYY")
                  : ""}
              </InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Start Date:">
                {isUpdate
                  ? conVertDateArrayToDate(agreementStartDate)
                  : agreementStartDate
                  ? dayjs(agreementStartDate).format("DD MMM, YYYY")
                  : ""}
              </InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Expiration Date:">
                {agreementExpiryDate === null
                  ? "No Expiry"
                  : isUpdate
                  ? conVertDateArrayToDate(agreementExpiryDate)
                  : agreementExpiryDate
                  ? dayjs(agreementExpiryDate).format("DD MMM, YYYY")
                  : ""}
              </InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Scb Agreement Manager Bank ID:">
                {agreementScbAgreementMgrBankId}
              </InfoField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Status:">{agreementStatus}</InfoField>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography
                component="span"
                className="details-header-review"
                sx={{ fontSize: 16, fontWeight: 600 }}
              >
                Agreement Limitations
              </Typography>
            </Grid>
            <Grid size={12}>
              <InfoField label="Agreement Limitations:">{agreementLimitations}</InfoField>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography
                component="span"
                className="details-header-review"
                sx={{ fontSize: 16, fontWeight: 600 }}
              >
                Agreement Document
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoField label="Url To Agreement:">{agreementLink}</InfoField>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <NoDataAlert
          title="Agreement details not available"
          message="The agreement details for this task could not be found or have not been provided."
        />
      )}
    </TaskDetailLayout>
  );
};

export default memo(ContractApproveRejectView);
