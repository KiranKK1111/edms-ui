import { useState, createRef, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Col, Form, Input, Row, Tooltip, message } from "antd";
import RequestModal from "../myTasks/RequestModal";
import {
  getAllTasks,
  getOverViewRecordsList,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";

const { TextArea } = Input;

const ApproveRejectModal = (props) => {
  const [approveModal, setApproveModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [isActionSubmitted, setisActionSubmitted] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const dispatch = useDispatch();
  const formRef = useRef();
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
      setisActionSubmitted(true);

      const message1 =
        res && res.data && res.data.statusMessage
          ? res.data.statusMessage.message
          : null;
      message.success(message1);
      if (props.getStatus) props.getStatus(res);
    }
    setApproveModal(false);
    props.refreshPage();
    //props.setDisabledSubmitBtn(false);
    //setTimeout(() => {
    //props.setDisabledSubmitBtn(false);
    //props.refreshPage();
    //}, 3000);
  };
  const handleApproveCancel = () => {
    setApproveModal(false);
    props.setDisabledSubmitBtn(false);
  };

  const submitReason = async () => {
    props.setDisabledSubmitBtn(true);
    const value = formRef.current.getFieldsValue();
    const error = formRef.current.getFieldError("reason");
    const payload = {
      ...currentActionData,
      taskListRejectionReason: value.reason,
      taskListTaskStatus: "Rejected",
    };
    if (
      value.reason == undefined ||
      value.reason == "" ||
      value.reason.length <= 0 ||
      value.reason == null
    ) {
      formRef.current.setFields([
        {
          name: "reason",
          errors: ["reason is mandatory !"],
        },
      ]);
    }
    if (value.reason && value.reason.length > 0) {
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
      props.refreshPage();
    }
  };
  const handleRejectCancel = () => {
    formRef.current.setFieldsValue({ reason: "" });
    setRejectModal(false);
    props.setDisabledSubmitBtn(false);
  };

  return (
    <div id="main">
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
                <TextArea
                  rows={4}
                  name="reason"
                  maxLength={250}
                  showCount
                  placeholder="The reject reason (Max 250 characters)"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </RequestModal>
    </div>
  );
};

export default ApproveRejectModal;