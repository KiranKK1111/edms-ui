import { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { Grid, Divider } from "@mui/material";

import { getCustomLabels, getObjFromSubscription } from "../stringConversion";
import {
  getDataById,
  getDataByCrId,
} from "../../store/actions/requestAccessActions";
import HeaderPanel from "../headerPanel/HeaderPanel";
import { catalogueDetailsData } from "../../store/actions/DatasetPageActions";
import { TaskDetailLayout } from "../myTasks";
import { NoDataAlert } from "../../design-system";
import { isDatasetDelegateRole } from "../../utils/accessMyTask";
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
  const [, setDisabledSubmitBtn] = useState(false);
  const subscription = useSelector((state) => state.requestAccess);

  useEffect(() => {
    if (myTaskData && myTaskData.taskListObjectAction === "Create")
      dispatch(getDataById(params.id));
    else dispatch(getDataByCrId(params.id));
  }, [dispatch]);

  const brResult = useSelector(
    (state) => state.requestAccess.dataByIdResponse.dataById
  );
  const catalogueList = useSelector(
    (state) => state.catalogueList.catalogueList
  );

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

  const brResultRevised = {
    subscriptionId: brResult["subscriptionId"],
    department: brResult["department"],
    clarityId: brResult["clarityId"],
    numberOfEndUserSubscriptions: parseInt(brResult["licensesSubscribed"]),
    status: brResult["subscriptionStatus"],
    projectName: brResult["projectName"],
    reasonForSubscription: brResult["reason"],
    subscriptionFor: brResult["subscriber"],
    subscriptionType: brResult["subscriptionType"],
    onDemandVendorRequest:
      brResult["subscriptionVendorRequest"] === "Y" ? "Yes" : "No",
  };
  const brData = Object.keys(brResultRevised).filter(
    (item) => item !== "reasonForSubscription"
  );
  const shortname =
    props.location.state && props.location.state.myTaskData
      ? props.location.state.myTaskData.taskListDescription
      : "-";

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
  // Disable Approve/Reject when the subscription details could not be loaded
  // (nothing to act on), and always for the Dataset Delegate role.
  const hasBrData = brResult && Object.keys(brResult).length > 0;
  const actionsDisabled =
    btnDisplay ||
    isApproveRejectDisabled ||
    props.allowSubmit === false ||
    !hasBrData ||
    isDatasetDelegateRole();

  const subForFlag =
    getObjFromSubscription(subscription, "subscriptionType") &&
    getObjFromSubscription(subscription, "subscriptionType").toLowerCase() ===
      "individual subscription";

  return (
    <TaskDetailLayout
      title={shortname}
      breadcrumbName={shortname}
      actionsDisabled={actionsDisabled}
      onApproveClick={() => showApproveModal(myTaskData)}
      onRejectClick={() => showRejectModal(myTaskData)}
      approveOpen={false}
      rejectOpen={false}
      onApprove={() => {}}
      onReject={() => {}}
      onApproveCancel={() => {}}
      onRejectCancel={() => {}}
      className="request-details"
    >
      <HeaderPanel />
      <Divider sx={{ my: 0.5 }} />
      {hasBrData ? (
        <>
          <h3 className="content-header">Business Requirements</h3>
          <Grid container spacing={2}>
            {brData.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <span className="label-review">{getCustomLabels(item)} :</span>{" "}
                {brResultRevised[item]}
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2}>
            <Grid size={12}>
              <span className="label-review">Reason for Subscription :</span>{" "}
              {brResultRevised["reasonForSubscription"]}
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          <DisplayTC
            view="rd"
            subForFlag={subForFlag ? true : false}
            vendorRequest={getObjFromSubscription(
              subscription,
              "subscriptionVendorRequest"
            )}
          />
        </>
      ) : (
        <NoDataAlert
          title="Subscription details not available"
          message="The business requirement details for this request could not be found or have not been provided yet."
        />
      )}

      <ApproveRejectModal
        approveModal={approveModal}
        currentActionData={currentActionData}
        getStatus={getStatus}
        rejectModal={rejectModal}
        setDisabledSubmitBtn={setDisabledSubmitBtn}
        refreshPage={refreshPage}
      />
    </TaskDetailLayout>
  );
};

export default memo(RequestDetails);
