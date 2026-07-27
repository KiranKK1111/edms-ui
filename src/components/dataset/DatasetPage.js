import { useEffect, useState } from "react";
import { withRouter, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { CheckCircleOutlined as CheckCircleOutlinedIcon } from "@mui/icons-material";

import DatasetTabs from "./DatasetTabs";
import { confirm } from "./UnsubscribeModal";
import {
  PageLayout,
  useConfirm,
} from "../../design-system";
import {
  unsubscribe,
  getDataById,
} from "../../store/actions/requestAccessActions";
import { catalogueDetailsData } from "../../store/actions/DatasetPageActions";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";
import logoRecord from "../../images/source_icon.svg";

import "../../common.css";
import "./dataset.css";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
  CATELOG_REQUEST_ACCESS_BUTTON,
} from "../../utils/Constants";
import getPermissionObject from "../../utils/accessObject";
import { warning } from "../../utils/warningUtils";

const DatasetPage = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const confirmer = useConfirm();

  const [spining, setSpining] = useState(false);
  const [disableUnsubscribe, setDisableUnsubscribe] = useState(false);

  const catalogueObj = location.state.data;
  const { datasetId, dataFeedId, subscription, dataFeedStatus } = catalogueObj;

  useEffect(() => {
    dispatch(startGetDatafeeds());
  }, [dispatch]);
  useEffect(() => {
    dispatch(catalogueDetailsData(dataFeedId, datasetId));
  }, [dispatch, dataFeedId, datasetId]);
  useEffect(() => {
    if (subscription) dispatch(getDataById(subscription.subscriptionId));
  }, [subscription, dispatch]);

  const { datafeedById: datafeedInfo, loading: feedLoading } = useSelector(
    (state) => state.datafeedInfo
  );
  const { loading: setLoading } = useSelector((state) => state.dataFamily);

  const { dataById: subscriptionInfo } = useSelector(
    (state) => state.requestAccess.dataByIdResponse
  );
  const dummyObj = { longName: "", feedStatus: "" };
  const { longName: datafeedLongName } =
    Object.keys(datafeedInfo).length === 0 ? dummyObj : datafeedInfo.datafeed;

  const { loading: licenseLoading } = useSelector((state) => state.license);
  const { loading: agreementLoading } = useSelector((state) => state.contract);

  useEffect(() => {
    setSpining(!!(feedLoading || setLoading || licenseLoading || agreementLoading));
  }, [feedLoading, setLoading, licenseLoading, agreementLoading]);

  useEffect(() => {
    if (
      catalogueObj.subscription &&
      catalogueObj.subscription.subscriptionUpdateFlag
    ) {
      const val =
        catalogueObj.subscription.subscriptionUpdateFlag.toLowerCase() === "y";
      setDisableUnsubscribe(val);
    }
  }, [catalogueObj]);

  const guestRole = localStorage.getItem("guestRole");
  let disableStatus = false;
  if (
    (subscription &&
      subscription.subscriptionStatus.toLowerCase() === "pending") ||
    guestRole ||
    (dataFeedStatus && dataFeedStatus.toLowerCase() !== "active")
  ) {
    disableStatus = true;
  }

  let isDisableRequestAccess =
    isButtonObject(CATELOG_MANAGEMENT_PAGE, CATELOG_REQUEST_ACCESS_BUTTON) ||
    disableStatus;

  if (guestRole === "Guest") {
    isDisableRequestAccess =
      dataFeedStatus && dataFeedStatus.toLowerCase() !== "active" && true;
  }

  const isUnsubscribeBtnCheck = isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
  );

  const isBtnDisplay = disableUnsubscribe || isUnsubscribeBtnCheck;

  const unsubscribeHandler = async () => {
    const updateInfo = {
      ...subscriptionInfo,
      subscriptionStatus: "Inactive",
      subscriptionUpdateFlag: "Y",
      lastUpdatedBy: localStorage.getItem("psid"),
    };
    const res = await unsubscribe(updateInfo);
    if (res && res.data) {
      history.replace({
        state: {
          data: {
            ...catalogueObj,
            subscription: {
              ...catalogueObj.subscription,
              subscriptionStatus: "Active",
              subscriptionUpdateFlag: "Y",
            },
          },
        },
      });
    }
  };

  const redirect = () => {
    history.push({
      pathname: "/catalog/subscription",
      state: { data: catalogueObj },
    });
  };

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
              External Data Platform team
            </a>
          </Box>
        </>
      ),
      okText: "OK",
    });
    if (ok) props.history.push("/");
  };

  const requestBtnAccess = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_REQUEST_ACCESS_BUTTON
  );

  let actionButtons = null;
  if (requestBtnAccess) {
    actionButtons = (
      <Button variant="contained" onClick={redirect} disabled={isDisableRequestAccess}>
        Request Access
      </Button>
    );
  }
  if (guestRole === "Guest") {
    actionButtons = (
      <Button
        variant="contained"
        disabled={
          !isBtnDisplay ||
          (subscriptionInfo &&
            subscriptionInfo.subscriptionUpdateFlag &&
            subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y")
        }
        onClick={showLoginRequired}
      >
        Request Access
      </Button>
    );
  }

  if (
    (requestBtnAccess &&
      subscription &&
      subscription.subscriptionStatus.toLowerCase() === "active") ||
    (requestBtnAccess &&
      subscription &&
      subscription.subscriptionStatus.toLowerCase() === "expired")
  ) {
    const updateFlagY =
      subscriptionInfo &&
      subscriptionInfo.subscriptionUpdateFlag &&
      subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y";
    actionButtons = (
      <>
        {updateFlagY ? (
          <Button
            variant="contained"
            disabled={
              !isBtnDisplay ||
              requestBtnAccess.permission !== "RW" ||
              updateFlagY
            }
            onClick={warning}
          >
            Modify Access
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={redirect}
            disabled={
              !isBtnDisplay ||
              requestBtnAccess.permission !== "RW" ||
              updateFlagY
            }
          >
            Modify Access
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          onClick={() => confirm(unsubscribeHandler)}
          disabled={updateFlagY}
        >
          Unsubscribe
        </Button>
      </>
    );
  }

  const isSubscribed =
    subscription && subscription.subscriptionStatus.toLowerCase() === "active";

  const heroTitle = (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      <img
        src={logoRecord}
        alt="Source Icon"
        style={{ width: 28, height: 28 }}
      />
      <span>{datafeedLongName || "-"}</span>
      {isSubscribed && (
        <Chip
          size="small"
          color="success"
          variant="outlined"
          icon={<CheckCircleOutlinedIcon fontSize="small" />}
          label="Subscribed"
        />
      )}
    </Box>
  );

  return (
    <Box className="dataset-details" id="main">
      <Backdrop sx={{ color: "var(--color-bg)", zIndex: 1300 }} open={spining}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <PageLayout
        breadcrumb={[
          { name: "Catalogue", url: "/catalog" },
          { name: datafeedLongName || "-" },
        ]}
        title={heroTitle}
        backTo="/catalog"
        actions={actionButtons}
      >
        <Box className="page-layout-card">
          <DatasetTabs
            dataFamily="Dummy"
            license="Dummy"
            contract="Dummy"
            vendor="Dummy"
            sourceConfig="Dummy"
            dataFeedStatus={dataFeedStatus}
            catalogueObj={catalogueObj}
          />
        </Box>
      </PageLayout>
    </Box>
  );
};

export default withRouter(DatasetPage);
