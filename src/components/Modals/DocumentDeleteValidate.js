import { useState, createRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Col, Form, Input, Row, Tooltip, message } from "antd";
import RequestModal from "../myTasks/RequestModal";
import {
  getAllTasks,
  getOverViewRecordsList,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";
import {
  startDeleteDocument,
  startGetAllDocuments,
} from "../../store/actions/datafeedAction";
import { useHistory } from "react-router-dom";

const { TextArea } = Input;

const DocumentDeleteValidate = (props) => {
  const [approveModal, setApproveModal] = useState(false);
  const [editReplaceModal, setEditReplaceModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [isActionSubmitted, setisActionSubmitted] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const dispatch = useDispatch();
  const formRef = createRef();
  const history = useHistory();

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
      setisActionSubmitted(true);
      props.getDocuments();

      // dispatch(startGetAllDocuments());
      const message1 =
        res && res.data && res.data.statusMessage
          ? res.data.statusMessage.message
          : null;
      message.success(message1);
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
    props.setDisabledSubmitBtn(true);
    const value = formRef.current.getFieldsValue();
    const payload = {
      ...currentActionData,
      taskListRejectionReason: value.reason,
      taskListTaskStatus: "Rejected",
    };
    if (value.reason && value.reason.length) {
      const res = await dispatch(updateTaskAction(payload));
      if (res && res.data) {
        try {
          formRef.current.setFieldsValue({ reason: "" });
        } catch (err) {}
        setRejectModal(false);

        dispatch(getAllTasks());
        setisActionSubmitted(true);
        const message1 =
          res && res.data && res.data.statusMessage
            ? res.data.statusMessage.message
            : null;
        message.success(message1);
        if (props.getStatus) props.getStatus(res);
      }
    }
    props.refreshPage();
  };
  const handleRejectCancel = () => {
    setRejectModal(false);
    props.setDisabledSubmitBtn(false);
  };

  return (
    <div>
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
        handleOk={submitReason}
        handleCancel={handleRejectCancel}
        title="Reject Task"
      >
        <p>
          Are you sure you want to proceed? Please provide your reason for
          rejecting below.
        </p>
        <Form ref={formRef} onFinish={submitReason}>
          <Row>
            <Col className="gutter-row" span={24}>
              <Form.Item
                label={
                  <Tooltip placement="top" title="reason">
                    {" "}
                    Reason{" "}
                  </Tooltip>
                }
                name="reason"
                rules={[{ required: true, message: "reason is mandatory !" }]}
              >
                <TextArea rows={4} name="reason" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </RequestModal>
    </div>
  );
};

export default DocumentDeleteValidate;