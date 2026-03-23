import { HomeOutlined, PaperClipOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Layout,
  PageHeader,
  Row,
  Tabs,
  Tooltip,
} from "antd";
import { createRef, memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Headers from "../../../pages/header/Header";
import {
  getLicenseDetailsById,
  getLicenseDetailsByCrId,
} from "../../../store/actions/licenseAction";
import { updateTaskAction } from "../../../store/actions/MyTasksActions";
import { RequestModal } from "../../myTasks";
import { useHistory } from "react-router-dom";
import Breadcrumb from "../../breadcrumb/Breadcrumb";
import logoRecord from "../../../images/source_icon.svg";
import "./licenseDetailsApproveReject.css";
import { conVertDateArrayToDate } from "../../addContract/contractApproveRejectView";
import isAcessDisabled from "../../../utils/accessMyTask";
import moment from "moment";

const formRef = createRef();

const LicenseDetailsApproveReject = (props) => {
  const dispatch = useDispatch();
  const params = useParams();

  const LicenseDetails = useSelector((state) => state.license);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisplay, setBtnDisplay] = useState(false);
  const { TextArea } = Input;
  const history = useHistory();
  const myTaskData = props.location.state.myTaskData;

  const loggedInTitle = localStorage.getItem("entitlementType");
  const isAdmin = loggedInTitle && loggedInTitle.toLowerCase() === "admin";

  useEffect(() => {
    if (
      myTaskData.taskListObjectAction === "Update" ||
      myTaskData.taskListObjectAction === "Deactivate"
    )
      dispatch(getLicenseDetailsByCrId(params.id));
    else dispatch(getLicenseDetailsById(params.id));
  }, []);
  const { Content } = Layout;
  const { TabPane } = Tabs;

  function callback(key) {}

  useEffect(() => {
    if (
      myTaskData.taskListTaskStatus.toString().toLowerCase() === "approved" ||
      myTaskData.taskListTaskStatus.toString().toLowerCase() === "rejected"
    ) {
      setBtnDisplay(true);
    }
  }, [myTaskData]);

  const showApproveModal = (event) => {
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

  const formatDate = (selectedDate) => {
    let dateFormat = "";
    if (selectedDate) {
      const date = new Date(selectedDate);

      var month = date.getMonth() + 1;

      var day = date.getDate();

      var year = date.getFullYear();

      dateFormat = day + "/" + month + "/" + year;
    }

    return dateFormat;
  };

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

  let allData = {
    license: [],
    usage: [],
    storage: [],
    dataset: [],
  };

  if (LicenseDetails.data && LicenseDetails.data[0]) {
    const {
      usageModel,
      subscriptionModel,
      subscriptionTypes,
      subscriptionLimits,
      technicalDocument,
      subscriptionLimitsUsed,
      licenseDataProcurementType,
      licenseExpiryDate,
      licenseId,
      licenseLimitations,
      licenseLongName,
      licenseNumberOfLicensesPurchaised,
      licenseNumberOfLicensesUsed,
      licenseShortName,
      licenseStatus,
      licenseType,
      licenseValuePerMonth,
    } = LicenseDetails.data[0];

    const documents = [];

    if (technicalDocument && technicalDocument.length) {
      technicalDocument.split(",").forEach((name) => {
        documents.push({ name });
      });
    }
    allData = {
      license: [
        { name: "Licence ID", value: licenseId },
        { name: "Long Name", value: licenseLongName },
        { name: "Short Name", value: licenseShortName },
        { name: "Licence Type", value: licenseType },
        { name: "Data Procurement Type", value: licenseDataProcurementType },
        { name: "Licence Value", value: licenseValuePerMonth },
        { name: "Expiration Date", value: licenseExpiryDate },
        {
          name: "No. of Licences Purchased",
          value: licenseNumberOfLicensesPurchaised,
        },
        {
          name: "No. of Licence Used",
          value: licenseNumberOfLicensesUsed
            ? licenseNumberOfLicensesUsed
            : "0",
        },
        { name: "Status", value: licenseStatus },
      ],
      limitations: [
        {
          name: "Licence Limitations",
          value: licenseLimitations,
        },
      ],
    };

    if (usageModel === "subscription") {
      allData.usage[1].value = subscriptionModel ? subscriptionModel : null;
      if (subscriptionModel && subscriptionModel === "real time") {
        allData.usage[2].value = subscriptionTypes ? subscriptionTypes : null;
        allData.usage.push({
          name: "Subscription Limit",
          value: subscriptionLimits ? subscriptionLimits : null,
        });
        allData.usage.push({
          name: "No Of Subscription Limit Used",
          value: subscriptionLimitsUsed ? subscriptionLimits : null,
        });
      }
    }
  }
  const breadcrumb = [
    { name: "My Tasks", url: "/myTasks" },
    {
      name:
        LicenseDetails && LicenseDetails.data[0]
          ? LicenseDetails.data[0].licenseShortName
          : "-",
    },
  ];

  function checkDataRender(name, task) {
    if (name !== "No. of Licence Used") {
      return true;
    } else {
      if (name === "No. of Licence Used" && task === "Create") {
        return false;
      }
      return true;
    }
  }

  const isBtnDisplay =
    btnDisplay ||
    isAcessDisabled(myTaskData) ||
    myTaskData.taskListCreatedBy === localStorage.getItem("psid");
  return (
    <div id="main">
      <Headers />
      <Layout>
        <Content>
          <div className="rectangleone">
            <div className="pg-header">
              <div className="breadcrumb-area" style={{ alignItems: "center" }}>
                <Breadcrumb breadcrumb={breadcrumb} />
                <div className="btn-parent">
                  <Button
                    onClick={() => showApproveModal(myTaskData)}
                    type="primary"
                    style={{ margin: "11px 2px 0px 2px" }}
                    disabled={isBtnDisplay}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => showRejectModal(myTaskData)}
                    danger
                    style={{ margin: "11px 2px 0px 2px" }}
                    disabled={isBtnDisplay}
                  >
                    Reject
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
                    {LicenseDetails && LicenseDetails.data[0]
                      ? LicenseDetails.data[0].licenseShortName
                      : "-"}
                  </div>
                }
                ghost={false}
                onBack={() => props.history.push("/myTasks")}
                className="pt-0 pb-0"
              ></PageHeader>
            </div>

            {LicenseDetails && LicenseDetails.data.length ? (
              <div style={{ marginTop: "20px" }}>
                <div style={{ padding: "24px 0" }}>
                  <div className="content-wrapper">
                    <div className="steps-content">
                      <div className="align-content-form"></div>
                      <div className="steps-action">
                        <div>
                          <Form layout="inline" labelCol={{ span: 18 }}>
                            <Row>
                              <Col className="gutter-row" span={20}>
                                <span className="details-header-review">
                                  Licence Details
                                </span>
                              </Col>

                              {allData.license.length &&
                                allData.license.map((data, index) =>
                                  checkDataRender(
                                    data.name,
                                    myTaskData.taskListObjectAction
                                  ) === true ? (
                                    <Col
                                      className="gutter-row"
                                      span={8}
                                      key={index}
                                    >
                                      <Form.Item
                                        className="review-label"
                                        name={data.name}
                                        label={<strong>{data.name}</strong>}
                                      >
                                        <label className="name-review">
                                          {/* {data.name === "Expiration Date"
                                          ? (myTaskData.taskListObjectAction === "Update") ?
                                          conVertDateArrayToDate(data.value) : moment(data.value).format("DD MMM, YYYY")
                                          : data.value} */}
                                          {data.name === "Expiration Date"
                                            ? typeof data.value === "string"
                                              ? moment(data.value).format(
                                                  "DD MMM, YYYY"
                                                )
                                              : conVertDateArrayToDate(
                                                  data.value
                                                )
                                            : data.value}
                                        </label>
                                      </Form.Item>
                                    </Col>
                                  ) : (
                                    ""
                                  )
                                )}
                              <Divider />

                              <Col className="gutter-row" span={20}>
                                <span className="details-header-review">
                                  Licence Limitations
                                </span>
                              </Col>

                              <Col className="gutter-row" span={20}>
                                {allData.limitations
                                  ? allData.limitations.map((data, index) => (
                                      <Col
                                        className="gutter-row"
                                        span={8}
                                        key={index}
                                      >
                                        <Form.Item
                                          className="review-label"
                                          name={data.name}
                                          label={<strong>{data.name}</strong>}
                                        >
                                          <label className="name-review">
                                            {data.value}
                                          </label>
                                        </Form.Item>
                                      </Col>
                                    ))
                                  : ""}
                              </Col>
                            </Row>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Content>
      </Layout>

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

export default memo(LicenseDetailsApproveReject);