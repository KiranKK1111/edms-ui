import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ErrorOutlineOutlined as ExclamationCircleIcon,
  HelpOutlined as QuestionCircleIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

import {
  DataTable,
  imperativeConfirm,
  useSnackbar,
} from "../../design-system";
import {
  getSubscribers,
  deleteSubscriber,
} from "../../store/actions/DatasetPageActions";
import { normalText } from "../stringConversion";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
} from "../../utils/Constants";

const isQuestionTooltip = (val) => {
  switch (val) {
    case "department":
      return "The department this subscription will be used under.";
    case "clarityId":
      return "Enter the clarity ID of the project this subscription is under.";
    case "numberOfLicences":
      return "Number of end users who will have access to the data from this subscriptions.";
    default:
      return "";
  }
};

const LabelTooltip = ({ field }) => {
  const toolTip = isQuestionTooltip(field);
  if (!toolTip) return null;
  return (
    <Tooltip title={toolTip}>
      <QuestionCircleIcon sx={{ fontSize: 14, color: "primary.main", ml: 0.25 }} />
    </Tooltip>
  );
};

const DeactivateModalContent = ({ lisences }) => (
  <Box>
    <Divider sx={{ mb: 1 }} />
    {lisences > 1 && (
      <>
        <Typography component="p" sx={{ mb: 1 }}>
          The subscription has more than 1 end user! Have the users been
          notified of this deactivation?
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Switch size="small" checked disabled />
          <span>Notify</span>
        </Box>
      </>
    )}
    <Box sx={{ mb: 1 }}>
      <strong>Delete Data Feed</strong>
      <Typography component="p" sx={{ mt: 0.5 }}>
        This will revoke your access to the Data Feed. Are you sure want to
        proceed?
      </Typography>
    </Box>
    <Divider sx={{ mt: 1 }} />
  </Box>
);

const SubscribersTab = () => {
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      const res1 = await dispatch(getSubscribers());
      if (res1.status === 200) setLoading(true);
    };
    run();
  }, [dispatch]);

  const { subscribers } = useSelector((state) => state.dataset);

  const brArr = [
    "subscriptionId",
    "department",
    "clarityId",
    "numberOfLicences",
    "projectName",
    "reasonForSubscription",
  ];

  const deleteHandler = async (data, psid) => {
    const next = { ...data, subscriptionStatus: "Inactive", lastUpdatedBy: psid };
    const res = await dispatch(deleteSubscriber(next));
    if (res.message !== undefined) {
      snackbar.error(res.message);
    } else if (res.data !== undefined) {
      snackbar.success("Subscriber deactivated successfully!");
      await dispatch(getSubscribers());
    }
  };

  const deletePopUpHandler = async (list, subscriptionId, psid) => {
    const dataObj = list.filter((v) => v.subscriptionId === subscriptionId);
    const data = dataObj.length ? { ...dataObj[0] } : {};
    const ok = await imperativeConfirm({
      title: "Unsubscribe from data feed?",
      content: <DeactivateModalContent lisences={data.licensesSubscribed} />,
      okText: "Deactivate",
      okColor: "error",
    });
    if (ok) deleteHandler(data, psid);
  };

  if (!loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Card>
    );
  }

  const subscribersList = (subscribers.data || []).filter(
    (item) => item.dataFeedId === location.state.data.dataFeedId
  );
  const psid = localStorage.getItem("psid");

  const StatusCell = ({ value }) => {
    if (!value) return null;
    const v = value.toLowerCase();
    if (v === "active") return <Chip size="small" color="success" variant="outlined" label={value} />;
    if (v === "pending") return <Chip size="small" color="warning" variant="outlined" label={value} />;
    return <Button disabled size="small">{value}</Button>;
  };

  const columns = [
    { accessorKey: "requester", header: "Requester" },
    { accessorKey: "subscriptionType", header: "Subscription Type" },
    { accessorKey: "subscriber", header: "Subscriber" },
    {
      accessorKey: "createdOn",
      header: "Subscription Date",
      Cell: ({ cell }) =>
        cell.getValue() ? dayjs(cell.getValue()).format("DD MMM YYYY") : "",
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Status",
      Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const item = row.original;
        const disabled =
          isButtonObject(
            CATELOG_MANAGEMENT_PAGE,
            CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
          ) ||
          (item.subscriptionStatus &&
            item.subscriptionStatus.toLowerCase() === "inactive");
        return (
          <Button
            variant="text"
            size="small"
            color="error"
            disabled={disabled}
            onClick={() => deletePopUpHandler(subscribersList, item.subscriptionId, psid)}
          >
            <strong>Deactivate</strong>
          </Button>
        );
      },
    },
  ];

  if (subscribersList.length === 0) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography>No Subscribers</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Typography
        component="h3"
        className="content-header"
        sx={{ fontWeight: 700, fontSize: 16 }}
      >
        Subscribers
      </Typography>
      <Divider sx={{ my: 2 }} />
      <DataTable
        columns={columns}
        data={subscribersList.slice().reverse()}
        rowKey="subscriptionId"
        enableExpanding
        renderDetailPanel={({ row }) => {
          const item = row.original;
          const obj = {
            numberOfLicences: item.licensesSubscribed,
            status: item.subscriptionStatus,
            subscriptionFor: item.subscriber,
            reasonForSubscription: item.reason,
            ...item,
          };
          return (
            <Box sx={{ p: 2, background: "var(--color-bg)" }}>
              <Box className="review-submit">
                <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                  Subscription Details
                </Typography>
                <Grid container spacing={1}>
                  {brArr.map((field, i) => (
                    <Grid
                      item
                      xs={12}
                      sm={brArr.length === i + 1 ? 16 : 8}
                      md={brArr.length === i + 1 ? 16 : 8}
                      key={i}
                    >
                      <Typography component="span" className="label-review">
                        {normalText(field).replace("Id", "ID")}{" "}
                        <LabelTooltip field={field} /> :
                      </Typography>{" "}
                      {obj[field]}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          );
        }}
      />
    </Card>
  );
};

export default SubscribersTab;
