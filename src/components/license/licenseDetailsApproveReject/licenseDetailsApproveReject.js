import { Box, Divider, Grid, Tooltip } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FormField, NoDataAlert } from "../../../design-system";
import {
  getLicenseDetailsById,
  getLicenseDetailsByCrId,
} from "../../../store/actions/licenseAction";
import { updateTaskAction } from "../../../store/actions/MyTasksActions";
import { TaskDetailLayout } from "../../myTasks";
import { useHistory } from "react-router-dom";
import "./licenseDetailsApproveReject.css";
import { conVertDateArrayToDate } from "../../addContract/contractApproveRejectView";
import isAcessDisabled from "../../../utils/accessMyTask";
import dayjs from "../../../design-system/dayjs";

const LicenseDetailsApproveReject = (props) => {
  const dispatch = useDispatch();
  const params = useParams();

  const LicenseDetails = useSelector((state) => state.license);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [btnDisplay, setBtnDisplay] = useState(false);
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
      dispatch(getLicenseDetailsByCrId(params.id));
    else dispatch(getLicenseDetailsById(params.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const licenseShortName =
    LicenseDetails && LicenseDetails.data[0]
      ? LicenseDetails.data[0].licenseShortName
      : "-";

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
    <TaskDetailLayout
      title={licenseShortName}
      breadcrumbName={licenseShortName}
      actionsDisabled={isBtnDisplay}
      onApproveClick={() => showApproveModal(myTaskData)}
      onRejectClick={() => showRejectModal(myTaskData)}
      approveOpen={approveModal}
      rejectOpen={rejectModal}
      onApprove={handleApprove}
      onReject={submitReason}
      onApproveCancel={handleApproveCancel}
      onRejectCancel={handleRejectCancel}
      className="license-details"
      rejectContent={
        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          <Grid container>
            <Grid size={{ xs: 12 }}>
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
      }
    >
      {LicenseDetails && LicenseDetails.data.length ? (
        <Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
              <span className="details-header-review">Licence Details</span>
            </Grid>

            {allData.license.length &&
              allData.license.map((data, index) =>
                checkDataRender(
                  data.name,
                  myTaskData.taskListObjectAction
                ) === true ? (
                  <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Box className="review-label">
                      <strong>{data.name}</strong>
                      <label className="name-review">
                        {data.name === "Expiration Date"
                          ? typeof data.value === "string"
                            ? dayjs(data.value).format("DD MMM, YYYY")
                            : conVertDateArrayToDate(data.value)
                          : data.value}
                      </label>
                    </Box>
                  </Grid>
                ) : (
                  ""
                )
              )}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <span className="details-header-review">
                Licence Limitations
              </span>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1}>
                {allData.limitations
                  ? allData.limitations.map((data, index) => (
                      <Grid size={{ xs: 12, md: 4 }} key={index}>
                        <Box className="review-label">
                          <strong>{data.name}</strong>
                          <label className="name-review">{data.value}</label>
                        </Box>
                      </Grid>
                    ))
                  : ""}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <NoDataAlert
          title="Licence details not available"
          message="The licence details for this task could not be found or have not been provided."
        />
      )}
    </TaskDetailLayout>
  );
};

export default memo(LicenseDetailsApproveReject);
