import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ErrorOutlineOutlined as ExclamationCircleIcon,
  HelpOutlined as QuestionCircleIcon,
} from "@mui/icons-material";

import { normalText } from "../stringConversion";
import { subscriptionTabInfo } from "../../store/actions/DatasetPageActions";
import DisplayTC from "../requestAccess/DisplayTC";

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

const StatusChip = ({ status }) => {
  if (!status) return null;
  return <Chip size="small" variant="outlined" color={status} />;
};

const SubscriptionsTab = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const subscription = useSelector(
    (state) => state.requestAccess.businessRequirements[0]
  );
  const subscriptionId =
    location.state && location.state.data && location.state.data.subscription
      ? location.state.data.subscription.subscriptionId
      : null;

  useEffect(() => {
    if (subscriptionId) {
      dispatch(subscriptionTabInfo(subscriptionId));
    }
  }, [subscriptionId]);

  const { data } = useSelector((state) => state.dataset.subscriptionInfo);
  const { subscriptionStatus } = data;
  const brArr = [
    "subscriptionId",
    "department",
    "clarityId",
    "numberOfLicences",
    "status",
    "projectName",
    "subscriptionType",
    "reasonForSubscription",
  ];

  const data1 = data ? { ...data } : {};
  const {
    licensesSubscribed: numberOfLicences,
    subscriptionStatus: status0,
    subscriber: subscriptionFor,
    reason: reasonForSubscription,
    ...rest
  } = data1;

  const objRevised = {
    numberOfLicences,
    status: status0,
    subscriptionFor,
    reasonForSubscription,
    ...rest,
  };

  let statusKind;
  const s = (objRevised.status || "").toLowerCase();
  if (s === "active") statusKind = "success";
  else if (s === "pending") statusKind = "warning";
  else if (s === "inactive") statusKind = "error";

  if (!subscriptionId) {
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <ExclamationCircleIcon sx={{ color: "error.main", fontSize: 48 }} />
        <Typography
          component="h3"
          className="result-head"
          sx={{ fontWeight: 700, fontSize: 18, mt: 1 }}
        >
          You are not currently subscribed
        </Typography>
        <Typography component="p" className="result-text" sx={{ mt: 1 }}>
          To subscribe to this dataset, please request access from the Licence
          Owner.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      {subscriptionStatus && subscriptionStatus.toLowerCase() === "pending" && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => {}}>
          Your access request is currently under review. This view will be
          refreshed once your request is approved. Please check back later.
        </Alert>
      )}
      <Card sx={{ p: 2 }}>
        <Box className="review-submit">
          <Typography component="h3" sx={{ pb: 0, fontSize: 18, fontWeight: 600 }}>
            Subscription Details
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
            Business Requirements
          </Typography>
          <Grid container spacing={1}>
            {brArr.map((item, i) => (
              <Grid
                item
                xs={12}
                sm={brArr.length === i + 1 ? 16 : 8}
                md={brArr.length === i + 1 ? 16 : 8}
                key={i}
              >
                <Typography component="span" className="label-review">
                  {normalText(item).replace("Id", "ID")}
                  <LabelTooltip field={item} />:
                </Typography>{" "}
                {item === "status" ? <StatusChip status={statusKind} /> : ""}
                {objRevised[item]}
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <DisplayTC
            view="st"
            subForFlag={
              subscription &&
              subscription.subscriptionType &&
              subscription.subscriptionType.toLowerCase() ===
                "individual subscription"
                ? true
                : false
            }
            vendorRequest={subscription && subscription.subscriptionVendorRequest}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default SubscriptionsTab;
