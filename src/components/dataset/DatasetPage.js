import { useEffect, useState, useMemo, useCallback } from "react";
import { withRouter, useLocation, useHistory } from "react-router-dom";
import { Button, Col, Layout, Row, Modal, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";

import Headers from "../../pages/header/Header";
import DatasetBreadcrumb from "./DatasetBreadcrumb";
import DatasetPageHeader from "./DatasetPageHeader";
import DatasetTabs from "./DatasetTabs";
import { confirm } from "./UnsubscribeModal";
import {
  clearStore,
  unsubscribe,
  getDataById,
} from "../../store/actions/requestAccessActions";
import { catalogueDetailsData } from "../../store/actions/DatasetPageActions";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";

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
let loggedUser = localStorage.getItem("entitlementType");

const DatasetPage = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [spining, setSpining] = useState(false);
  const [disableUnsubscribe, setDisableUnsubscribe] = useState(false);

  let catalogueObj = location.state.data;
  const {
    entityId,
    datasetId,
    dataFeedId,
    subscription,
    entityShortName,
    dataFeedStatus,
  } = catalogueObj;

  useEffect(() => {
    dispatch(startGetDatafeeds());
  }, []);
  useEffect(() => {
    dispatch(catalogueDetailsData(dataFeedId, datasetId));
  }, [dispatch, catalogueObj]);
  useEffect(() => {
    if (subscription) dispatch(getDataById(subscription.subscriptionId));
  }, [subscription]);

  const { datafeedById: datafeedInfo, loading: feedLoading } = useSelector(
    (state) => state.datafeedInfo
  );
  const { datasetById: datasetInfo, loading: setLoading } = useSelector(
    (state) => state.dataFamily
  );

  const { dataById: subscriptionInfo } = useSelector(
    (state) => state.requestAccess.dataByIdResponse
  );
  let dummyObj = { longName: "", feedStatus: "" };
  const { longName: datafeedLongName, feedStatus: datafeedStatus } =
    Object.keys(datafeedInfo).length === 0 ? dummyObj : datafeedInfo.datafeed;

  const { licenseById: licenseInfo, loading: licenseLoading } = useSelector(
    (state) => state.license
  );
  const { agreementById: agreementInfo, loading: agreementLoading } =
    useSelector((state) => state.contract);

  useEffect(() => {
    if (feedLoading || setLoading || licenseLoading || agreementLoading) {
      setSpining(true);
    } else {
      setSpining(false);
    }
  }, [feedLoading, setLoading, licenseLoading, agreementLoading]);

  useEffect(() => {
    if (
      catalogueObj.subscription &&
      catalogueObj.subscription.subscriptionUpdateFlag
    ) {
      const val =
        catalogueObj.subscription.subscriptionUpdateFlag
          .toString()
          .toLowerCase() === "y"
          ? true
          : false;
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
    let updateInfo = { ...subscriptionInfo };
    updateInfo.subscriptionStatus = "Inactive";
    updateInfo.subscriptionUpdateFlag = "Y";
    updateInfo.lastUpdatedBy = localStorage.getItem("psid");
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
      state: {
        data: catalogueObj,
      },
    });
  };
  const config = {
    title: <div className="modal-head">Login Required</div>,
    content: (
      <>
        <div>
          You need to login to perform this action. Click OK to proceed.
        </div>
        <div className="para-break">
          For Account creation please contact <br />
          <a
            href="mailto:CCIBDATA-T&I-EDP@exchange.standardchartered.com"
            target="_blank"
          >
            External Data Platform team
          </a>
        </div>
      </>
    ),
    onOk: () => {
      props.history.push("/");
    },
  };
  const requestBtnAccess = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_REQUEST_ACCESS_BUTTON
  );
  let subscriptionButtons;
  if (
    requestBtnAccess
    // loggedUser === "Subscriber" ||
    // isButtonObject(
    //   CATELOG_MANAGEMENT_PAGE,
    //   CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
    // )
  ) {
    subscriptionButtons = (
      <Button
        type="primary"
        onClick={redirect}
        className="ft-rt mr-24"
        disabled={isDisableRequestAccess}
      >
        Request Access
      </Button>
    );
  }
  if (guestRole === "Guest") {
    subscriptionButtons = (
      <Button
        type="primary"
        className="ft-rt mr-24"
        disabled={
          !isBtnDisplay ||
          (subscriptionInfo &&
            subscriptionInfo.subscriptionUpdateFlag &&
            subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y")
        }
        onClick={() => {
          Modal.confirm(config);
        }}
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
    subscriptionButtons = (
      <>
        {subscriptionInfo &&
        subscriptionInfo.subscriptionUpdateFlag &&
        subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y" ? (
          <Button
            type="primary"
            className="ft-rt mr-24"
            disabled={
              !isBtnDisplay ||
              requestBtnAccess.permission !== "RW" ||
              (subscriptionInfo &&
                subscriptionInfo.subscriptionUpdateFlag &&
                subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y")
            }
            onClick={warning}
          >
            Modify Access
          </Button>
        ) : (
          <Button
            type="primary"
            className="ft-rt mr-24"
            onClick={redirect}
            disabled={
              //!isBtnDisplay}
              !isBtnDisplay ||
              requestBtnAccess.permission !== "RW" ||
              (subscriptionInfo &&
                subscriptionInfo.subscriptionUpdateFlag &&
                subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y")
            }
          >
            Modify Access
          </Button>
        )}
        <Button
          type="default"
          danger
          onClick={() => confirm(unsubscribeHandler)}
          className="ft-rt mr-24"
          disabled={
            // !isBtnDisplay ||
            subscriptionInfo &&
            subscriptionInfo.subscriptionUpdateFlag &&
            subscriptionInfo.subscriptionUpdateFlag.toLowerCase() === "y"
          }
        >
          Unsubscribe
        </Button>
      </>
    );
  }
  return (
    <div className="dataset-details" id="main">
      <Headers />
      <Spin spinning={spining} tip="Loading...">
        <Layout>
          <Row className="bg-white">
            <Col span={16}>
              <DatasetBreadcrumb title={datafeedLongName} />
            </Col>
            <Col span={8} className="mt-16">
              {subscriptionButtons}
            </Col>
          </Row>

          <Row className="bg-white">
            <Col span={24}>
              <DatasetPageHeader
                datafeedLongName={datafeedLongName}
                subscription={subscription}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <DatasetTabs
                dataFamily="Dummy"
                license="Dummy"
                contract="Dummy"
                vendor="Dummy"
                sourceConfig="Dummy"
                dataFeedStatus={dataFeedStatus}
                catalogueObj={catalogueObj}
              />
            </Col>
          </Row>
        </Layout>
      </Spin>
    </div>
  );
};

export default withRouter(DatasetPage);