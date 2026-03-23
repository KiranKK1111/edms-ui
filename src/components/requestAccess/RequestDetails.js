import { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Row, Col, Divider, Button, PageHeader } from "antd";
import { getCustomLabels, getObjFromSubscription } from "../stringConversion";
import {
  getDataById,
  getDataByCrId,
} from "../../store/actions/requestAccessActions";
import { useParams } from "react-router-dom";
import Headers from "../../pages/header/Header";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import HeaderPanel from "../headerPanel/HeaderPanel";
import { catalogueDetailsData } from "../../store/actions/DatasetPageActions";
import logoRecord from "../../images/source_icon.svg";
import ApproveRejectModal from "../Modals/ApproveRejectModal";
import getPermissionObject from "../../utils/accessObject";
import {
  APPROVE_REJECT_BTN_REMAINING,
  APPROVE_REJECT_BTN_SUBS,
  MY_TASK_PAGE,
  APPROVE_REJECT_BTN,
} from "../../utils/Constants";
import DisplayTC from "./DisplayTC";

const RequestDetails = (props) => {
  const params = useParams();
  const [revisedList, setRevisedList] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [btnDisplay, setBtnDisplay] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const myTaskData =
    props.location && props.location.state && props.location.state.myTaskData;
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(false);
  const subscription = useSelector((state) => state.requestAccess);

  useEffect(() => {
    if (myTaskData && myTaskData.taskListObjectAction === "Create")
      dispatch(getDataById(params.id));
    else dispatch(getDataByCrId(params.id));
  }, [dispatch]);

  let brResult = useSelector(
    (state) => state.requestAccess.dataByIdResponse.dataById
  );

  let catalogueList = useSelector((state) => state.catalogueList.catalogueList);

  useEffect(() => {
    if (catalogueList && brResult) {
      const list = catalogueList.filter(
        (item) => item.dataFeedId === brResult.dataFeedId
      );
      setRevisedList(list);
    }
  }, [catalogueList, brResult]);

  useEffect(() => {
    props.history.replace({
      state: {
        data: revisedList.length ? revisedList[0] : {},
        myTaskData: props.location.state.myTaskData,
      },
    });
    if (revisedList.length) {
      const { dataFeedId, datasetId } = revisedList[0];
      dispatch(catalogueDetailsData(dataFeedId, datasetId));
    }
  }, [revisedList]);

  let brResultRevised = {
    subscriptionId: brResult["subscriptionId"],
    department: brResult["department"],
    clarityId: brResult["clarityId"],
    numberOfEndUserSubscriptions: parseInt(brResult["licensesSubscribed"]),
    status: brResult["subscriptionStatus"],
    projectName: brResult["projectName"],
    reasonForSubscription: brResult["reason"],
    subscriptionFor: brResult["subscriber"],
    subscriptionType: brResult["subscriptionType"],
    onDemandVendorRequest: brResult["subscriptionVendorRequest"] === "Y" ? "Yes" : "No"
  };
  let brData = Object.keys(brResultRevised);
  brData = brData.filter((item) => item !== "reasonForSubscription");
  const shortname =
    props.location.state && props.location.state.myTaskData
      ? props.location.state.myTaskData.taskListDescription
      : "-";
  const breadcrumb = [
    { name: "My Tasks", url: "/myTasks" },
    { name: shortname },
  ];

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
      setRejectModal(false);
    }
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
      setApproveModal(false);
    }
  };
  const getStatus = (status) => {
    status.data.taskList ? setBtnDisplay(true) : setBtnDisplay(false);
  };
  useEffect(() => {
    // if (
    //   loginedRold &&
    //   loginedRold.toString().toLocaleLowerCase() === "read only"
    // ) {
    //   setBtnDisplay(true);
    // } else
    if (
      myTaskData.taskListTaskStatus.toString().toLowerCase() === "approved" ||
      myTaskData.taskListTaskStatus.toString().toLowerCase() === "rejected"
    ) {
      setBtnDisplay(true);
    }
  }, []);
  const refreshPage = () => {
    history.push("/myTasks");
  };

  const buttonAccessReject = () => {
    let isActive = false;
    const isApproveReject = getPermissionObject(
      MY_TASK_PAGE,
      APPROVE_REJECT_BTN
    );
    const isSubcriptionBtn = getPermissionObject(
      MY_TASK_PAGE,
      APPROVE_REJECT_BTN_SUBS
    );
    const isRemainingObj = getPermissionObject(
      MY_TASK_PAGE,
      APPROVE_REJECT_BTN_REMAINING
    );

    if (isApproveReject && isApproveReject.permission === "RW") {
      isActive = true;
    } else if (isSubcriptionBtn && isRemainingObj) {
      const isSub =
        myTaskData &&
        myTaskData.taskListObject.toLocaleLowerCase() === "subscription";
      if (isSub && isSubcriptionBtn.permission === "RW") {
        isActive = true;
      }
    }
    return !isActive;
  };

  const isApproveRejectDisabled = buttonAccessReject();

  console.log();

  return (
    <div className="request-details">
      <Headers />
      <div className="panel">
        <div className="breadcrumb-area">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-parent">
            <Button
              type="default"
              disabled={
                btnDisplay ||
                isApproveRejectDisabled ||
                props.allowSubmit === false
              }
              onClick={() => showRejectModal(myTaskData)}
              danger
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={() => showApproveModal(myTaskData)}
              disabled={
                btnDisplay ||
                isApproveRejectDisabled ||
                props.allowSubmit === false
              }
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
              {shortname}
            </div>
          }
          ghost={false}
          onBack={() => props.history.push("/myTasks")}
          className="pt-0 pb-0"
        >
          <HeaderPanel />
        </PageHeader>
      </div>
      <ApproveRejectModal
        approveModal={approveModal}
        currentActionData={currentActionData}
        getStatus={getStatus}
        rejectModal={rejectModal}
        setDisabledSubmitBtn={setDisabledSubmitBtn}
        refreshPage={refreshPage}
      />
      <div className="content-area">
        <div className="content-wrapper">
          <div className="review-submit">
            <h3>Business Requirements</h3>
            <Row gutter={[2, 4]}>
              {brData.map((item, i) => (
                <Col span={8} key={i}>
                  <span className="label-review">
                    {getCustomLabels(item)} :
                  </span>
                  {brResultRevised[item]}
                </Col>
              ))}
            </Row>
            <Row>
              <Col span={24}>
                <span className="label-review">Reason for Subscription :</span>
                {brResultRevised["reasonForSubscription"]}
              </Col>
            </Row>
            <Divider />
            <DisplayTC
              view="rd"
              subForFlag={getObjFromSubscription(subscription, "subscriptionType") && getObjFromSubscription(subscription, "subscriptionType").toLowerCase() === "individual subscription" ? true : false}
              vendorRequest={getObjFromSubscription(subscription, "subscriptionVendorRequest")}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RequestDetails);