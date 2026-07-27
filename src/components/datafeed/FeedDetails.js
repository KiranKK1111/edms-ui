import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Grid, Tooltip } from "@mui/material";

import { FormField } from "../../design-system";
import { toast as message } from "../../design-system/toast";
import {
  startGetDatafeeds,
  getDatafeedDetailsByCrId,
} from "../../store/actions/datafeedAction";
import { updateTaskAction } from "../../store/actions/MyTasksActions";
import { normalText } from "../stringConversion";
import { TaskDetailLayout } from "../myTasks";
import isAcessDisabled from "../../utils/accessMyTask";

const FeedDetails = (props) => {
  const [feedInfo, setFeedInfo] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisplay, setBtnDisplay] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const params = useParams();
  const { control, getValues, reset } = useForm({
    defaultValues: { reason: "" },
    mode: "onChange",
  });
  const myTaskData = props.location.state.myTaskData;
  const datafeedsInfoBasedOnCrId = useSelector(
    (infoState) => infoState.datafeedInfo.datafeedsData
  );
  const datafeedsInfo = useSelector(
    (infoState) => infoState.datafeedInfo.datafeedsData
  );

  useEffect(() => {
    if (myTaskData.taskListObjectAction !== "Create")
      dispatch(getDatafeedDetailsByCrId(params.id));
    else dispatch(startGetDatafeeds());
    return () => {
      setFeedInfo({});
    };
  }, []);
  useEffect(() => {
    if (datafeedsInfo && myTaskData.taskListObjectAction === "Create") {
      const feed =
        datafeedsInfo && datafeedsInfo.filter((v) => v.feedId === params.id);
      setFeedInfo(feed);
    } else setFeedInfo(datafeedsInfoBasedOnCrId);
  }, [datafeedsInfo, datafeedsInfoBasedOnCrId]);

  const revisedData = ({
    documentationLink: url,
    feedDescription: description,
    feedId: datafeedId,
    feedStatus: status,
    personalData: personalDataType,
    dataConfidentiality,
    longName,
    shortName,
  }) => ({
    datafeedId,
    url,
    status,
    longName,
    shortName,
    dataConfidentiality,
    personalDataType,
    description,
  });

  const hasData = Array.isArray(feedInfo) && feedInfo.length > 0;
  const newData = hasData ? revisedData(feedInfo[0]) : {};
  const keys = hasData ? Object.keys(newData) : [];

  const shortName = hasData ? newData.shortName : "-";

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
      message.success("Task Updated Successfully!");
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
    const value = getValues();
    const payload = {
      ...currentActionData,
      taskListRejectionReason: value.reason,
    };
    if (value.reason && value.reason.length) {
      const res = await dispatch(updateTaskAction(payload));
      reset({ reason: "" });
      setRejectModal(false);

      if (res && res.data) {
        message.success("Task Updated Successfully!");
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

  const rejectContent = (
    <Box>
      <Grid container>
        <Grid size={12}>
          <FormField
            name="reason"
            type="textarea"
            rows={4}
            control={control}
            label={
              <Tooltip placement="top" title="reason">
                <span> Reason </span>
              </Tooltip>
            }
            required="reason is mandatory !"
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <TaskDetailLayout
      title={shortName}
      breadcrumbName={shortName}
      actionsDisabled={isBtnDisplay}
      onApproveClick={() => showApproveModal(myTaskData)}
      onRejectClick={() => showRejectModal(myTaskData)}
      approveOpen={approveModal}
      rejectOpen={rejectModal}
      onApprove={handleApprove}
      onReject={submitReason}
      onApproveCancel={handleApproveCancel}
      onRejectCancel={handleRejectCancel}
      className="datafeed-details"
      rejectContent={rejectContent}
    >
      <h3 className="content-header">General Details</h3>
      {hasData ? (
        <Grid container spacing={2}>
          {keys.map((item, i) =>
            item !== "url" ? (
              <Grid size={item !== "description" ? 4 : 8} key={i}>
                <span className="label-review">
                  {item === "datafeedId"
                    ? "Data Feed ID"
                    : normalText(item).replace("Id", "ID")}{" "}
                  :
                </span>{" "}
                {newData[item]}
              </Grid>
            ) : null
          )}
        </Grid>
      ) : (
        <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
          Loading...
        </Box>
      )}
    </TaskDetailLayout>
  );
};

export default FeedDetails;
