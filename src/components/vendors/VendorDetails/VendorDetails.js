//______________Lib imports begin_____________
import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Tooltip,
  PageHeader,
  Divider,
  message,
} from "antd";
/*________________antD library imports begin*/
import "antd/dist/antd.css";
import React, { createRef, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Headers from "../../../pages/header/Header";
import { updateTaskAction } from "../../../store/actions/MyTasksActions";
//______________ component imports begin_________
import {
  getDetailsByChangeRequestId,
  getVendorDetailsById,
} from "../../../store/actions/VendorActions";
import { RequestModal } from "../../myTasks";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Breadcrumb from "../../breadcrumb/Breadcrumb";
import HeaderPanel from "../../headerPanel/HeaderPanel";
import logoRecord from "../../../images/source_icon.svg";
import isAcessDisabled from "../../../utils/accessMyTask";

import "./VendorDetails.css";

const { Content } = Layout;
const formRef = createRef();

const VendorDetails = (props) => {
  const dispatch = useDispatch();
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisable, setBtnDisable] = useState(false);
  const entityDetailsObj = useSelector((state) => state.vendor);
  const params = useParams();
  const history = useHistory();
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);

  const loggedInTitle = localStorage.getItem("entitlementType");
  const isAdmin = loggedInTitle && loggedInTitle.toLowerCase() === "admin";
  const myTaskData = props.location.state.myTaskData;
  const { TextArea } = Input;
  const {
    entityId,
    longName,
    shortName,
    entityType,
    website,
    entityStatus,
    entityDescription,
  } = entityDetailsObj.data;

  useEffect(() => {
    const val =
      myTaskData.taskListTaskStatus.toString().toLowerCase() !== "pending"
        ? true
        : false;

    setBtnDisable(val);
  }, [myTaskData]);

  const layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 18,
    },
  };
  const breadcrumb = [
    { name: "My Tasks", url: "/myTasks" },
    { name: shortName },
  ];
  const showApproveModal = (event) => {
    if (event) {
      const payload = {
        ...event,
        taskListId: params.taskId,
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setApproveModal(true);
    }
  };
  //updateTaskAction
  const handleApprove = async () => {
    const res = await dispatch(updateTaskAction(currentActionData));
    setApproveModal(false);

    const message1 =
      res && res.data && res.data.statusMessage
        ? res.data.statusMessage.message
        : null;
    if (res && res.data && res.data.statusMessage) {
      message.success(message1);
      setBtnDisable(true);
      history.push("/myTasks");
    }
  };
  const handleApproveCancel = () => {
    setApproveModal(false);
  };

  const showRejectModal = (event) => {
    if (event) {
      const payload = {
        ...event,
        taskListId: params.taskId,
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setRejectModal(true);
    }
  };

  useEffect(() => {
    const id = params.id;
    if (myTaskData.taskListObjectAction === "Create")
      dispatch(getVendorDetailsById(id));
    else dispatch(getDetailsByChangeRequestId(id));
    setIsComponentLoaded(true);
  }, []);

  const submitReason = async () => {
    const value = formRef.current.getFieldsValue();
    const payload = {
      ...currentActionData,
      taskListRejectionReason: value.reason,
    };
    if (value.reason && value.reason.length) {
      const res = await dispatch(updateTaskAction(payload));
      formRef.current.setFieldsValue({ reason: "" });
      setRejectModal(false);
      if (res && res.data) {
        history.push("/myTasks");
      }
    }
  };
  const handleRejectCancel = () => {
    setRejectModal(false);
  };
  const isBtnDisplay =
    btnDisable ||
    isAcessDisabled(myTaskData) ||
    myTaskData.taskListCreatedBy === localStorage.getItem("psid");

  return (
    <div className="entity-main">
      <Headers /> {/*EDMS Navigation Bar */}
      <div className="panel">
        <div className="breadcrumb-area">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-parent">
            <Button
              onClick={() => showRejectModal(myTaskData)}
              danger
              style={{ margin: "11px 2px" }}
              disabled={isBtnDisplay}
            >
              Reject
            </Button>
            <Button
              onClick={() => showApproveModal(myTaskData)}
              type="primary"
              style={{ margin: "11px 2px" }}
              disabled={isBtnDisplay}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
      <PageHeader
        title={
          <div>
            <img
              src={logoRecord}
              alt="Source Icon"
              className="page-header-img pr-8"
            />
            {shortName}
          </div>
        }
        ghost={false}
        onBack={() => props.history.push("/myTasks")}
        className="pt-0 pb-0"
      ></PageHeader>
      <Form {...layout}>
        <Layout>
          <Content>
            {/*-- Header area-- */}
            <div className="form-layout">
              {" "}
              {/*-- Content area-- */}
              <h3>Entity Details</h3>
              <Divider />
              <div className="vendor-from">
                <Row gutter={[2, 4]}>
                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Entity ID</span>}
                      name="entityId"
                    >
                      {entityId}
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Long Name</span>}
                      name="longName"
                    >
                      {longName}
                    </Form.Item>
                  </Col>

                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Short Name</span>}
                      name="shortName"
                    >
                      {shortName}
                    </Form.Item>
                  </Col>

                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      className="hello"
                      label={<span className="label-review">Entity Type</span>}
                      name="entityType"
                    >
                      {entityType}
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Website</span>}
                      name="website"
                    >
                      {website}
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Status</span>}
                      name="website"
                    >
                      {entityStatus}
                    </Form.Item>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <Form.Item
                      label={<span className="label-review">Description</span>}
                      name="vendorDescription"
                    >
                      {entityDescription}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </Form>
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
          This will reject the task and will notify the user who submitted the
          request. Are you sure want to proceed?.
        </p>
        <Form ref={formRef} onFinish={submitReason}>
          <Row>
            <Col className="gutter-row" span={24}>
              {/*_____________________VENDOR DESCRIPTION__________________________*/}
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

const mapStateToProps = (state) => {
  return {
    vendors: state.vendorList,
  };
};

export default connect(mapStateToProps)(VendorDetails);