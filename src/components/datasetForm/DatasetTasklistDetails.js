import { useState, useEffect, createRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  PageHeader,
  Row,
  Col,
  Divider,
  Input,
  Form,
  Tooltip,
} from "antd";
import Headers from "../../pages/header/Header";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import logoRecord from "../../images/source_icon.svg";
import {
  startGetDatasets,
  gerDatasetByCrId,
} from "../../store/actions/DatasetPageActions";
import { normalText } from "../stringConversion";
import { RequestModal } from "../myTasks";
import { updateTaskAction } from "../../store/actions/MyTasksActions";
import isAcessDisabled from "../../utils/accessMyTask";
const { TextArea } = Input;

const DatasetTasklistDetails = (props) => {
  const [datasetObj, setDatasetObj] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisplay, setBtnDisplay] = useState(false);
  const dispatch = useDispatch();
  const params = useParams();
  const formRef = createRef();
  const history = useHistory();
  const myTaskData = props.location.state.myTaskData;

  useEffect(() => {
    if (
      myTaskData.taskListObjectAction === "Update" ||
      myTaskData.taskListObjectAction === "Deactivate"
    )
      dispatch(gerDatasetByCrId(params.id));
    else dispatch(startGetDatasets());
  }, []);

  const data = useSelector((state) => {
    return state.dataset.datasetsInfo;
  });

  useEffect(() => {
    if (data && data.length && myTaskData.taskListObjectAction === "Create") {
      const filterDataset = data.filter((v) => v.datasetId === params.id);
      setDatasetObj(filterDataset);
    } else if (data && data.length) setDatasetObj(data);
  }, [data]);
  const revisedData = ({
    datasetId,
    longName,
    shortName,
    datasetStatus: status,
    datasetDescription: description,
  }) => ({ datasetId, longName, shortName, status, description });

  const newData = datasetObj.length ? revisedData(datasetObj[0]) : {};
  const keys = datasetObj.length ? Object.keys(revisedData(datasetObj[0])) : [];
  const breadcrumb = [
    { name: "My Tasks", url: "/myTasks" },
    { name: keys.length ? newData.shortName : "-" },
  ];

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
    btnDisplay ||
    isAcessDisabled(myTaskData) ||
    myTaskData.taskListCreatedBy === localStorage.getItem("psid");

  return (
    <div id="main">
      <Headers />
      <div className="panel">
        <div className="breadcrumb-area">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-parent">
            <Button
              onClick={() => showRejectModal(myTaskData)}
              danger
              disabled={isBtnDisplay}
            >
              Reject
            </Button>
            <Button
              onClick={() => showApproveModal(myTaskData)}
              type="primary"
              style={{ marginLeft: "10px" }}
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
              {keys.length ? newData.shortName : "-"}
            </div>
          }
          ghost={false}
          onBack={() => props.history.push("/myTasks")}
          className="pt-0 pb-0"
        ></PageHeader>
      </div>
      <div className="form-layout content-wrapper">
        <div className="review-submit">
          <h3>Dataset details</h3>
          <Row gutter={[2, 4]}>
            {keys &&
              keys.map((item, i) => (
                <Col span={item !== "description" ? 8 : 16} key={i}>
                  <span className="label-review">
                    {normalText(item).replace("Id", "ID")} :
                  </span>
                  {newData[item]}
                </Col>
              ))}
          </Row>
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
  );
};

export default DatasetTasklistDetails;