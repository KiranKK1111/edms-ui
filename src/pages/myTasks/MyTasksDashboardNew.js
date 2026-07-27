import React, { useEffect, useMemo, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlined as CheckCircleOutlineIcon,
  HighlightOff as CloseCircleIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

import { DataTable, PageLayout } from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";
import dayjs from "../../design-system/dayjs";
import { camelText } from "../../components/stringConversion";
import {
  getAllTasks,
  updateTaskAction,
} from "../../store/actions/MyTasksActions.js";
import "./MyTasksDashboard.css";
import ApproveRejectModal from "../../components/Modals/ApproveRejectModal";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";
import {
  MY_TASK_PAGE,
  APPROVE_REJECT_BTN,
  APPROVE_REJECT_BTN_SUBS,
  APPROVE_REJECT_BTN_REMAINING,
  DATASET_OWNER,
} from "../../utils/Constants";
import { checkForString } from "../../utils/warningUtils.js";
import { isDatasetDelegateRole } from "../../utils/accessMyTask";

const MyTasksDashboardNew = () => {
  const [taskListStatus, setTaskListStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [countObj, setCountObj] = useState({});
  const [disabledSubmitBtn, setDisabledSubmitBtn] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [currentActionData, setCurrentActionData] = useState({});
  const [data, setData] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);

  const dispatch = useDispatch();
  const list = useSelector((state) => state.myTasks);
  const history = useHistory();

  let approvedReject;
  let approvedRejectSubs;
  let approvedRejectRemain;
  const objectMatrix = JSON.parse(localStorage.getItem("objectMatrix")) || [];
  if (objectMatrix && objectMatrix.length > 0) {
    approvedReject = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() === APPROVE_REJECT_BTN.toLowerCase()
    );
    approvedRejectSubs = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() === APPROVE_REJECT_BTN_SUBS.toLowerCase()
    );
    approvedRejectRemain = objectMatrix.filter(
      (item) =>
        item.category.toLowerCase().includes(MY_TASK_PAGE.toLowerCase()) &&
        item.objectName.toLowerCase() ===
          APPROVE_REJECT_BTN_REMAINING.toLowerCase()
    );
  }

  const navigateToView = (event) => {
    const action = event.taskListObjectAction;
    const obj = event.taskListObject;
    const objLower = (obj || "").toLowerCase();
    const idForCreate = event.taskListPkey;
    const idForUpdate = event.crId;
    const taskId = event.taskListId;
    const id = action === "Create" ? idForCreate : idForUpdate;

    if (action === "Create" || action === "Update" || action === "Deactivate") {
      if (obj === "Entity") {
        history.push({
          pathname: `vendorDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "Licence") {
        history.push({
          pathname: `licenseDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "Agreement") {
        history.push({
          pathname: `AgreementDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "Datafeed" || objLower === "data feed") {
        history.push({
          pathname: `DatafeedDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "Dataset") {
        history.push({
          pathname: `DatasetDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "RecurrenceScheduler") {
        history.push(`schedulerDetails/${event.key}/${event.taskId}`);
      } else if (obj === "Subscription") {
        history.push({
          pathname: `requestDetails/${id}/${taskId}`,
          state: { myTaskData: event },
        });
      } else if (obj === "SourceConfiguration") {
        history.push(`sourceConfigDetails/${event.key}/${event.taskId}`);
      }
    }
  };

  const onStatusChange = (_, value) => {
    if (value !== null) setTaskListStatus(value);
  };

  const showApproveModal = (event) => {
    setDisabledSubmitBtn(true);
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

  const refreshPage = () => {
    setLoading(true);
    setDisabledSubmitBtn(false);
  };

  const isActionDisabledForRecord = (record) => {
    let disabled = true;
    if (approvedReject && approvedReject.length > 0 && approvedReject[0].permission === "RW") {
      disabled = false;
    } else if (
      approvedRejectSubs &&
      approvedRejectSubs.length > 0 &&
      approvedRejectRemain &&
      approvedRejectRemain.length > 0
    ) {
      const isSubscription =
        record &&
        record.taskListObject &&
        record.taskListObject.toLowerCase() === "subscription";
      if (isSubscription && approvedRejectSubs[0].permission === "RW") {
        disabled = false;
      }
    }
    return (
      disabledSubmitBtn ||
      disabled ||
      isDatasetDelegateRole() ||
      !checkForString("currentUserRole", DATASET_OWNER)
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "taskListDescription",
        header: "Object name",
        size: 320,
        Cell: ({ cell, row }) => (
          <button
            type="button"
            className="link-button talign"
            onClick={() => navigateToView(row.original)}
          >
            {cell.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "taskListObject",
        header: "Object type",
        size: 140,
        filterVariant: "select",
        filterSelectOptions: [
          "Entity",
          "Agreement",
          "Licence",
          "Dataset",
          "Data Feed",
          "Subscription",
        ],
      },
      {
        accessorKey: "taskListObjectAction",
        header: "Operation",
        size: 130,
        filterVariant: "select",
        filterSelectOptions: ["Create", "Update", "Deactivate"],
      },
      {
        accessorKey: "taskListCreatedBy",
        header: "Submitted by",
        size: 140,
      },
      {
        accessorKey: "taskListCreatedOn",
        header: "Submitted on",
        size: 140,
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.taskListCreatedOn) -
          new Date(rowB.original.taskListCreatedOn),
        Cell: ({ row }) =>
          row.original.taskListCreatedOn
            ? dayjs(row.original.taskListCreatedOn).format("DD MMM YYYY")
            : "",
      },
      {
        accessorKey: "taskListApproveBy",
        header: "Action by",
        size: 130,
      },
      {
        accessorKey: "taskListApproveOn",
        header: "Action on",
        size: 130,
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.taskListApproveOn) -
          new Date(rowB.original.taskListApproveOn),
        Cell: ({ row }) =>
          row.original.taskListApproveOn
            ? dayjs(row.original.taskListApproveOn).format("DD MMM YYYY")
            : "",
      },
      {
        id: "taskId",
        header: "Action",
        accessorKey: "taskListTaskStatus",
        size: 170,
        filterVariant: "select",
        filterSelectOptions: ["Approved", "Rejected", "Pending"],
        Cell: ({ row }) => {
          const record = row.original;
          const status = (record.taskListTaskStatus || "").toLowerCase();
          if (status === "approved") {
            return (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                label={camelText(record.taskListTaskStatus)}
              />
            );
          }
          if (status === "rejected") {
            return (
              <Chip
                size="small"
                color="error"
                variant="outlined"
                icon={
                  <Tooltip title={record.taskListRejectionReason || ""}>
                    <InfoOutlinedIcon fontSize="small" />
                  </Tooltip>
                }
                label={camelText(record.taskListTaskStatus)}
                deleteIcon={<CloseCircleIcon fontSize="small" />}
              />
            );
          }
          if (status === "pending") {
            const disabled = isActionDisabledForRecord(record);
            return (
              <Box sx={{ display: "inline-flex", gap: 1 }}>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => showApproveModal(record)}
                  disabled={disabled}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => showRejectModal(record)}
                  disabled={disabled}
                >
                  Reject
                </button>
              </Box>
            );
          }
          return null;
        },
      },
    ],
    [disabledSubmitBtn]
  );

  useEffect(() => {
    if (!isPageLoaded || !list || !list.list || !list.list.length) {
      dispatch(getAllTasks());
      dispatch(startGetDatafeeds());
      setIsPageLoaded(true);
    } else {
      if (!data || !data.length || list.list.length) {
        const sortedData = list.list.slice().sort(
          (a, b) =>
            new Date(b.taskListCreatedOn) - new Date(a.taskListCreatedOn)
        );
        setData(sortedData);
        setLoading(false);
        setCountObj(list.data);
        setCompletedList(list.completedList);
        setPendingList(list.pendingList);
      } else if (
        list.completedList.length === 0 ||
        list.pendingList.length === 0
      ) {
        setCompletedList(list.completedList);
        setPendingList(list.pendingList);
        setLoading(false);
      } else if (Object.keys(countObj).length === 0) {
        setCountObj(list.data);
      }
    }
  }, [list, dispatch]);

  const tableDataSource = useMemo(() => {
    if (taskListStatus === "pending") return pendingList;
    if (taskListStatus === "completed") return completedList;
    return data;
  }, [taskListStatus, pendingList, completedList, data]);

  const myTasksPage = getPageConfig("myTasks");

  return (
    <PageLayout
      bounded
      breadcrumb={myTasksPage.breadcrumb}
      title={myTasksPage.title}
      subtitle={myTasksPage.subtitle}
      backTo={myTasksPage.backTo}
      badge={myTasksPage.badge}
    >
      <Box className="page-layout-card">
        {loading ? (
          <Box
            sx={{
              flex: "1 1 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 320,
            }}
            id="spinner"
          >
            <CircularProgress size={48} />
          </Box>
        ) : (
          <>
            <Box
              className="header-utlis"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "text.primary",
                  m: 0,
                }}
              >
                My Tasks ({data ? data.length : 0})
              </Typography>
              <ToggleButtonGroup
                size="small"
                color="primary"
                value={taskListStatus}
                exclusive
                onChange={onStatusChange}
              >
                <ToggleButton value="pending" id="btn-pending">
                  Pending
                </ToggleButton>
                <ToggleButton value="completed">Completed</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box className="page-layout-fill">
              <DataTable
                columns={columns}
                data={tableDataSource || []}
                rowKey="taskListId"
                initialState={{
                  density: "compact",
                  pagination: { pageIndex: 0, pageSize: 10 },
                }}
                emptyState={{ title: "No tasks to show" }}
                muiTableContainerProps={{ sx: { maxHeight: "none" } }}
              />
            </Box>
          </>
        )}
      </Box>

      <ApproveRejectModal
        approveModal={approveModal}
        currentActionData={currentActionData}
        getStatus={null}
        rejectModal={rejectModal}
        setDisabledSubmitBtn={setDisabledSubmitBtn}
        disabledSubmitBtn={disabledSubmitBtn}
        refreshPage={refreshPage}
        data={data}
        setData={setData}
      />
    </PageLayout>
  );
};

export default memo(MyTasksDashboardNew);
