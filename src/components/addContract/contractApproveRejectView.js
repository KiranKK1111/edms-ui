import {
  ArrowLeftOutlined,
  HomeOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Tooltip,
  PageHeader,
} from "antd";
import { createRef, memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Headers from "../../pages/header/Header";
import {
  getContractDetailsByChangeRequestId,
  getContractDetailsById,
} from "../../store/actions/contractAction";
import { updateTaskAction } from "../../store/actions/MyTasksActions";
import { RequestModal } from "../myTasks";
import { useHistory } from "react-router-dom";
import moment from "moment";
import logoRecord from "../../images/source_icon.svg";
import isAcessDisabled from "../../utils/accessMyTask";

const formRef = createRef();
export const conVertDateArrayToDate = (dateArray) => {
  // console.log("Date = ",dateArray);
  if (dateArray) {
    let newDatedate = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2];
    // console.log("NewDatedate = ",newDatedate,typeof(newDatedate));
    return moment(newDatedate.slice(0, 10)).format("DD MMM, YYYY");
  }
};

const ContractApproveRejectView = (props) => {
  const params = useParams();
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const info = useSelector((state) => state.vendor);
  const [vendorsList, setVendorsList] = useState([]);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const { TextArea } = Input;
  const [currentActionData, setCurrentActionData] = useState({});

  const loggedInTitle = localStorage.getItem("entitlementType");
  const isAdmin = loggedInTitle && loggedInTitle.toLowerCase() === "admin";
  const myTaskData = props.location.state.myTaskData;

  const submitReason = async () => {
    const value = formRef.current.getFieldsValue();
    if (value.reason && value.reason.length) {
      const payload = {
        ...currentActionData,
        taskListRejectionReason: value.reason,
      };
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

  const taskListData = history.location.state.myTaskData;

  useEffect(() => {
    if (
      myTaskData.taskListObjectAction === "Update" ||
      myTaskData.taskListObjectAction === "Deactivate"
    )
      dispatch(getContractDetailsByChangeRequestId(params.id));
    else dispatch(getContractDetailsById(params.id));
  }, []);

  const data = useSelector((state) => state.contract);

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
  } = data ? data.contractDetails : {};

  const showApproveModal = (event) => {
    if (event) {
      const payload = {
        ...event,
        taskListId: event.taskListId,
        taskListTaskStatus: "APPROVED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setApproveModal(true);
    }
  };

  const getVendorName = (id) => {
    const selectedVendor = vendorsList.filter((vendor) => {
      return vendor.vendorId === id;
    });

    return selectedVendor && selectedVendor[0] && selectedVendor[0].name;
  };

  const handleApprove = async () => {
    const res = await dispatch(updateTaskAction(currentActionData));
    setApproveModal(false);

    if (res && res.data) {
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
        taskListId: event.taskListId,
        taskListTaskStatus: "REJECTED",
        taskListApproveBy: localStorage.getItem("psid"),
        roleName: localStorage.getItem("entitlementType"),
      };
      setCurrentActionData(payload);
      setRejectModal(true);
    }
  };
  const isBtnDisplay =
    taskListData.taskListTaskStatus.toString().toLowerCase() !== "pending" ||
    isAcessDisabled(myTaskData) ||
    taskListData.taskListCreatedBy === localStorage.getItem("psid");

  return (
    <>
      <Headers />

      <div className="panel" id="h-panel">
        <div className="breadcrumb-area">
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item href="/catalog">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/myTasks">My Tasks</Breadcrumb.Item>
            <Breadcrumb.Item>Agreement Details</Breadcrumb.Item>
          </Breadcrumb>

          <div className="btn-parent">
            <Button
              type="default"
              danger
              onClick={() => showRejectModal(taskListData)}
              disabled={isBtnDisplay}
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={() => showApproveModal(taskListData)}
              disabled={isBtnDisplay}
            >
              Approve
            </Button>
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
              {agreementName}
            </div>
          }
          ghost={false}
          onBack={() => props.history.push("/myTasks")}
          className="pt-0 pb-0"
        ></PageHeader>
      </div>
      <div className="content-area">
        <div className="content-wrapper">
          <div>
            {data ? (
              <div>
                <Row gutter={[2, 4]}>
                  <Col className="gutter-row" span={20}>
                    <span className="details-header-review">
                      Agreement Details
                    </span>
                  </Col>

                  <Col span={8}>
                    <span className="label-review">Agreement ID :</span>
                    <span className="capitalize-text">{agreementId}</span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Agreement Name:</span>
                    <span className="capitalize-text">{agreementName}</span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Reference ID:</span>
                    <span className="capitalize-text">
                      {agreementReferenceId}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Reference Text:</span>
                    <span className="capitalize-text">
                      {agreementReferenceText}
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Agreement Type:</span>
                    {agreementType}
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Data Source:</span>
                    <span className="capitalize-text">{agreementPartyId}</span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Agreement Value:</span>
                    <span className="capitalize-text">{agreementValue}</span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Signed On:</span>
                    {console.log("Signed On = ", agreementSignedOn)}
                    {myTaskData.taskListObjectAction === "Update" ||
                    myTaskData.taskListObjectAction === "Deactivate"
                      ? conVertDateArrayToDate(agreementSignedOn)
                      : moment(agreementSignedOn).format("DD MMM, YYYY")}
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Start Date:</span>
                    {console.log("Start Date = ", agreementStartDate)}
                    {myTaskData.taskListObjectAction === "Update" ||
                    myTaskData.taskListObjectAction === "Deactivate"
                      ? conVertDateArrayToDate(agreementStartDate)
                      : moment(agreementStartDate).format("DD MMM, YYYY")}
                  </Col>

                  <Col span={8}>
                    <span className="label-review">Expiration Date:</span>
                    {console.log("Expiry Date = ", agreementExpiryDate)}
                    {agreementExpiryDate === null
                      ? "No Expiry"
                      : myTaskData.taskListObjectAction === "Update" ||
                        myTaskData.taskListObjectAction === "Deactivate"
                      ? conVertDateArrayToDate(agreementExpiryDate)
                      : moment(agreementExpiryDate).format("DD MMM, YYYY")}
                  </Col>
                  <Col span={8}>
                    <span className="label-review">
                      Scb Agreement Manager Bank ID:
                    </span>
                    {agreementScbAgreementMgrBankId}
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Status:</span>
                    {agreementStatus}
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[2, 4]}>
                  <Col className="gutter-row" span={20}>
                    <span className="details-header-review">
                      Agreement Limitations
                    </span>
                  </Col>
                  <Col span={24}>
                    <span className="label-review">Agreement Limitations:</span>
                    {agreementLimitations}
                  </Col>
                </Row>
                <Divider />
                <Row gutter={[2, 4]}>
                  <Col className="gutter-row" span={20}>
                    <span className="details-header-review">
                      Agreement Document
                    </span>
                  </Col>
                  <Col span={8}>
                    <span className="label-review">Url To Agreement:</span>
                    {agreementLink}
                  </Col>
                </Row>
              </div>
            ) : null}
          </div>
        </div>

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
    </>
  );
};

export default memo(ContractApproveRejectView);