import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import { FieldLabel, FormField, NoDataAlert } from "../../design-system";
import {
  startGetDatasets,
  gerDatasetByCrId,
} from "../../store/actions/DatasetPageActions";
import { normalText } from "../stringConversion";
import { TaskDetailLayout } from "../myTasks";
import { updateTaskAction } from "../../store/actions/MyTasksActions";
import isAcessDisabled from "../../utils/accessMyTask";

const DatasetTasklistDetails = (props) => {
  const [datasetObj, setDatasetObj] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisplay, setBtnDisplay] = useState(false);
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();
  const myTaskData = props.location.state.myTaskData;

  const { control, getValues, reset } = useForm({
    defaultValues: { reason: "" },
    mode: "onChange",
  });

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
  const shortName = keys.length ? newData.shortName : "-";

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
      className="dataset-details"
      rejectContent={
        <Grid container>
          <Grid size={12}>
            <FieldLabel text="Reason" tooltip="reason" />
            <FormField
              name="reason"
              type="textarea"
              rows={4}
              control={control}
              required="reason is mandatory !"
            />
          </Grid>
        </Grid>
      }
    >
      <h3 className="content-header">Dataset details</h3>
      {keys && keys.length ? (
        <Grid container spacing={2}>
          {keys.map((item, i) => (
            <Grid size={item !== "description" ? 4 : 8} key={i}>
              <span className="label-review">
                {normalText(item).replace("Id", "ID")} :
              </span>{" "}
              {newData[item]}
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoDataAlert
          title="Dataset details not available"
          message="The dataset details for this task could not be found or have not been provided."
        />
      )}
    </TaskDetailLayout>
  );
};

export default DatasetTasklistDetails;
