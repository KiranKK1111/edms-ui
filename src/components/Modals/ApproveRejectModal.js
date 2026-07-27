import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Tooltip } from "@mui/material";

import RequestModal from "../myTasks/RequestModal";
import { FormField, useSnackbar } from "../../design-system";
import {
  getAllTasks,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";

const ApproveRejectModal = (props) => {
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const dispatch = useDispatch();
  const snackbar = useSnackbar();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    getValues,
  } = useForm({ defaultValues: { reason: "" } });

  useEffect(() => {
    setApproveModal(props.approveModal);
    setCurrentActionData(props.currentActionData);
    setRejectModal(props.rejectModal);
  }, [props.currentActionData, props.approveModal, props.rejectModal]);

  const handleApprove = async () => {
    props.setDisabledSubmitBtn(true);
    const res = await dispatch(updateTaskAction(currentActionData));
    if (res && res.data) {
      dispatch(getAllTasks());
      const message1 =
        res && res.data && res.data.statusMessage
          ? res.data.statusMessage.message
          : null;
      if (message1) snackbar.success(message1);
      if (props.getStatus) props.getStatus(res);
    }
    setApproveModal(false);
    props.refreshPage();
  };

  const handleApproveCancel = () => {
    setApproveModal(false);
    props.setDisabledSubmitBtn(false);
  };

  const submitReason = async () => {
    const value = getValues();
    if (!value.reason || !value.reason.trim()) {
      setError("reason", { type: "required", message: "reason is mandatory !" });
      return;
    }
    props.setDisabledSubmitBtn(true);
    const payload = {
      ...currentActionData,
      taskListRejectionReason: value.reason,
      taskListTaskStatus: "Rejected",
    };
    const res = await dispatch(updateTaskAction(payload));
    if (res && res.data) {
      reset({ reason: "" });
      setRejectModal(false);
      dispatch(getAllTasks());
      const message1 =
        res && res.data && res.data.statusMessage
          ? res.data.statusMessage.message
          : null;
      if (message1) snackbar.success(message1);
      if (props.getStatus) props.getStatus(res);
    }
    props.refreshPage();
  };

  const handleRejectCancel = () => {
    reset({ reason: "" });
    setRejectModal(false);
    props.setDisabledSubmitBtn(false);
  };

  return (
    <>
      <RequestModal
        isModalVisible={approveModal}
        handleOk={handleApprove}
        handleCancel={handleApproveCancel}
        title="Approve Task"
      >
        Are you sure you want to proceed?
      </RequestModal>
      <RequestModal
        isModalVisible={rejectModal}
        handleOk={handleSubmit(submitReason)}
        handleCancel={handleRejectCancel}
        title="Reject Task"
      >
        <p style={{ marginTop: 0 }}>
          Are you sure you want to proceed? Please provide your reason for
          rejecting below.
        </p>
        <Tooltip placement="top" title="reason">
          <span>
            <FormField
              name="reason"
              label="Reason"
              control={control}
              type="textarea"
              rows={4}
              required="reason is mandatory !"
              placeholder="The reject reason (Max 250 characters)"
              inputProps={{ maxLength: 250 }}
            />
          </span>
        </Tooltip>
      </RequestModal>
    </>
  );
};

export default ApproveRejectModal;
