import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Tooltip } from "@mui/material";

import RequestModal from "../myTasks/RequestModal";
import { FormField, useSnackbar } from "../../design-system";
import {
  getAllTasks,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";
import { startDeleteDocument } from "../../store/actions/datafeedAction";

const DocumentDeleteValidate = (props) => {
  const [approveModal, setApproveModal] = useState(false);
  const [editReplaceModal, setEditReplaceModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const history = useHistory();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    getValues,
  } = useForm({ defaultValues: { reason: "" } });

  useEffect(() => {
    setApproveModal(props.deleteModal);
    setCurrentActionData(props.currentActionData);
    setRejectModal(props.rejectModal);
    setEditReplaceModal(props.editReplaceModal);
  }, [
    props.currentActionData,
    props.approveModal,
    props.rejectModal,
    props.editReplaceModal,
  ]);

  const handleApprove = async () => {
    props.setDisabledSubmitBtn(true);
    const res = await startDeleteDocument(
      currentActionData.docDisplayFilename,
      currentActionData.docObjectId
    );
    if (res && res.data) {
      props.getDocuments();
      const message1 =
        res && res.data && res.data.statusMessage
          ? res.data.statusMessage.message
          : null;
      if (message1) snackbar.success(message1);
      if (props.getStatus) props.getStatus(res);
      history.push(`/masterData/${currentActionData.docObjectId}/addDocuments`);
    }
    setApproveModal(false);
    props.setDisabledSubmitBtn(false);
    props.setDeleteModal(false);
  };

  const handleApproveCancel = () => {
    setApproveModal(false);
    setEditReplaceModal(false);
    props.setDisabledSubmitBtn(false);
  };

  const submitReason = async () => {
    const value = getValues();
    if (!value.reason || !value.reason.length) {
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
    setRejectModal(false);
    props.setDisabledSubmitBtn(false);
  };

  return (
    <Box>
      <RequestModal
        isModalVisible={approveModal}
        handleOk={handleApprove}
        handleCancel={handleApproveCancel}
        title="Delete Records"
      >
        Are you sure you want to delete Records?
      </RequestModal>
      <RequestModal
        isModalVisible={editReplaceModal}
        handleOk={handleApprove}
        handleCancel={handleApproveCancel}
        title="Replace File"
      >
        This file/link is already existing. Replace?
      </RequestModal>
      <RequestModal
        isModalVisible={rejectModal}
        handleOk={handleSubmit(submitReason)}
        handleCancel={handleRejectCancel}
        title="Reject Task"
      >
        <Box component="p" sx={{ mt: 0 }}>
          Are you sure you want to proceed? Please provide your reason for
          rejecting below.
        </Box>
        <Tooltip placement="top" title="reason">
          <span>
            <FormField
              name="reason"
              label="Reason"
              control={control}
              type="textarea"
              rows={4}
              required="reason is mandatory !"
            />
          </span>
        </Tooltip>
      </RequestModal>
    </Box>
  );
};

export default DocumentDeleteValidate;
