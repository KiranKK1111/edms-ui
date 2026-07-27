import { memo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";

import { Box, Button, Card, Chip, Tooltip, Typography } from "@mui/material";
import { CheckCircleOutlined as CheckCircleOutlinedIcon } from "@mui/icons-material";

import { clearStore } from "../../store/actions/requestAccessActions";
import { useConfirm } from "../../design-system";

import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_REQUEST_ACCESS_BUTTON,
} from "../../utils/Constants";

const ellipsisSx = (rows = 1) => ({
  display: "-webkit-box",
  WebkitLineClamp: rows,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  m: 0,
});

const Catalog = (props) => {
  const dispatch = useDispatch();
  const confirmer = useConfirm();

  const {
    entityShortName,
    datasetShortName,
    dataFeedLongName,
    dataFeedStatus,
    dataFeedDescription,
    subscription,
  } = props.catalogueInfo;

  useEffect(() => {
    dispatch(clearStore());
  }, [dispatch]);

  const handler1 = useCallback(
    (path) => {
      props.history.push({
        pathname: path,
        state: { data: props.catalogueInfo },
      });
    },
    [props.catalogueInfo, props.history]
  );

  const requestAccessButton = isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_REQUEST_ACCESS_BUTTON
  );

  const showLoginRequired = async () => {
    const ok = await confirmer.confirm({
      title: "Login Required",
      content: (
        <>
          <Box>
            You need to login to perform this action. Click OK to proceed.
          </Box>
          <Box className="para-break" sx={{ mt: 1 }}>
            For Account creation please contact <br />
            <a
              href="mailto:CCIBDATA-T&I-EDP@exchange.standardchartered.com"
              target="_blank"
              rel="noreferrer"
            >
              External Data Platform
            </a>{" "}
            team
          </Box>
        </>
      ),
      okText: "OK",
    });
    if (ok) props.history.push("/");
  };

  const guestRole = localStorage.getItem("guestRole");
  let subscriptionStatus;

  if (
    dataFeedStatus &&
    dataFeedStatus.toLowerCase() === "active" &&
    !guestRole
  ) {
    if (subscription) {
      const s = subscription.subscriptionStatus.toLowerCase();
      if (s === "active") {
        subscriptionStatus = (
          <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            label="Subscribed"
          />
        );
      } else if (s === "pending") {
        subscriptionStatus = (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            label="Pending"
          />
        );
      } else if (s === "expired") {
        subscriptionStatus = (
          <Chip
            size="small"
            color="error"
            variant="outlined"
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            label="Expired"
          />
        );
      } else {
        subscriptionStatus = (
          <Button
            variant="text"
            size="small"
            onClick={() => handler1("/catalog/subscription")}
            disabled={requestAccessButton}
          >
            Request Access
          </Button>
        );
      }
    } else {
      subscriptionStatus = (
        <Button
          variant="text"
          size="small"
          onClick={() => handler1("/catalog/subscription")}
          disabled={requestAccessButton}
        >
          Request Access
        </Button>
      );
    }
  } else if (guestRole) {
    subscriptionStatus = (
      <Tooltip
        placement="bottom-end"
        title={
          <Box sx={{ textAlign: "center", fontSize: 12 }}>
            <strong>Request Subscriber role</strong>
            <br />
            in{" "}
            <a
              href="https://scbnow01.service-now.com/myit?id=manage_access"
              target="_blank"
              rel="noreferrer"
              style={{ color: "white", padding: "0 3px" }}
            >
              <u>ServiceNow</u>
            </a>
            :
            <br />
            choose &quot;External Data Platform&quot; application and
            &quot;Subscriber&quot; as your role
          </Box>
        }
      >
        <Button
          variant="text"
          size="small"
          sx={{ color: "var(--color-text-tertiary)" }}
        >
          Request Access
        </Button>
      </Tooltip>
    );
  } else {
    subscriptionStatus = (
      <Button
        variant="text"
        size="small"
        disabled={
          dataFeedStatus && dataFeedStatus.toLowerCase() !== "active" && true
        }
        onClick={showLoginRequired}
      >
        Request Access
      </Button>
    );
  }

  const inactive =
    dataFeedStatus && dataFeedStatus.toLowerCase() === "inactive";

  return (
    <Card className="catalog-card" sx={inactive ? { opacity: 0.55 } : undefined}>
      <Box
        className="catalog-card-body"
        onClick={() => handler1("/catalog/details")}
        id="clickable-area"
        sx={{ cursor: "pointer" }}
      >
        <div className="catalog-card-head">
          <span className="catalog-source-chip">
            <img src="/images/source_icon.svg" alt="Source" />
            <span>{entityShortName || "-"}</span>
          </span>
        </div>
        <div className="catalog-card-content">
          <div className="catlog-dataset">
            <Typography component="p" sx={ellipsisSx(1)}>
              {datasetShortName || "-"}
            </Typography>
          </div>
          <div className="sub-title">
            <Typography component="p" sx={ellipsisSx(2)}>
              {dataFeedLongName || "-"}
            </Typography>
          </div>
          <div className="description">
            <Typography component="p" sx={ellipsisSx(2)}>
              {dataFeedDescription || "-"}
            </Typography>
          </div>
        </div>
      </Box>
      <div className="catalog-card-footer">
        {inactive ? (
          <span className="catalog-card-inactive-tag">{dataFeedStatus}</span>
        ) : (
          subscriptionStatus
        )}
      </div>
    </Card>
  );
};

export default memo(withRouter(Catalog));
