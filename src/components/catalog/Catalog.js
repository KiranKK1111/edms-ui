import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";

import { Card, Tag, Typography, Button, Modal, Tooltip } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

import { clearStore } from "../../store/actions/requestAccessActions";

//import isCatelogueAccessDisabled from "../../utils/accessRequestCatelog";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_REQUEST_ACCESS_BUTTON,
} from "../../utils/Constants";

const { Paragraph } = Typography;

const Catalog = (props) => {
  const dispatch = useDispatch();

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
  }, []);

  const handler1 = (path) => {
    props.history.push({
      pathname: path,
      state: {
        data: props.catalogueInfo,
      },
    });
  };

  const requestAccessButton = isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_REQUEST_ACCESS_BUTTON
  );

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
            External Data Platform
          </a>{" "}
          team
        </div>
      </>
    ),
    onOk: () => {
      props.history.push("/");
    },
  };

  const guestRole = localStorage.getItem("guestRole");
  let subscriptionStatus;

  if (
    dataFeedStatus &&
    dataFeedStatus.toLowerCase() === "active" &&
    !guestRole
  ) {
    if (subscription) {
      if (subscription.subscriptionStatus.toLowerCase() === "active") {
        subscriptionStatus = (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Subscribed
          </Tag>
        );
      } else if (subscription.subscriptionStatus.toLowerCase() === "pending") {
        subscriptionStatus = (
          <Tag icon={<CheckCircleOutlined />} color="warning">
            Pending
          </Tag>
        );
      } else if (subscription.subscriptionStatus.toLowerCase() === "expired") {
        subscriptionStatus = (
          <Tag icon={<CheckCircleOutlined />} color="error">
            Expired
          </Tag>
        );
      } else {
        subscriptionStatus = (
          <Button
            type="link"
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
          type="link"
          onClick={() => handler1("/catalog/subscription")}
          disabled={requestAccessButton}
        >
          Request Access
        </Button>
      );
    }
  } else if (guestRole) {
    subscriptionStatus = (
      <Button
        type="link"
        style={{
          cursor: "pointer",
          color: "#ccc",
        }}
      >
        <Tooltip
          title={
            <div>
              <p>
                <span style={{ "font-family": "Inter-SemiBold" }}>
                  Request Subscriber role
                </span>{" "}
                <br />
                in
                <a
                  href="https://scbnow01.service-now.com/myit?id=manage_access"
                  target="_blank"
                  style={{ color: "white", padding: "0 3px" }}
                >
                  <u>ServiceNow</u>
                </a>
                :
                <br />
                choose “External Data Platform” application and “Subscriber” as
                your role
              </p>
            </div>
          }
          placement="bottomRight"
          overlayStyle={{ color: "#1e1e1e" }}
          overlayInnerStyle={{ textAlign: "center", fontSize: "12px" }}
        >
          Request Access
        </Tooltip>
      </Button>
    );
  } else {
    subscriptionStatus = (
      <Button
        type="link"
        disabled={
          dataFeedStatus && dataFeedStatus.toLowerCase() !== "active" && true
        }
        onClick={() => {
          Modal.confirm(config);
        }}
      >
        Request Access
      </Button>
    );
  }

  return (
    <Card className="catalog-card" style={dataFeedStatus.toLowerCase() === "inactive" ? { opacity: "0.5" } : {}}>
      <div
        onClick={() => handler1("/catalog/details")}
        style={{ cursor: "pointer" }}
        id="clickable-area"
      >
        <div className="main-title">
          <Paragraph ellipsis>
            <img src="/images/source_icon.svg" alt="Icon" />
            <span className="ml-8" style={{ verticalAlign: "middle" }}>
              {entityShortName ? entityShortName : "-"}
            </span>
          </Paragraph>
        </div>
        <div className="catlog-dataset">
          <Paragraph ellipsis>
            {datasetShortName ? datasetShortName : "-"}
          </Paragraph>
        </div>
        <div className="sub-title">
          <Paragraph ellipsis={{ rows: 2, expandable: false }}>
            {dataFeedLongName ? dataFeedLongName : "-"}
          </Paragraph>
        </div>
        <div className="description">
          <Paragraph ellipsis={{ rows: 2, expandable: false }}>
            {dataFeedDescription ? dataFeedDescription : "-"}
          </Paragraph>
        </div>
      </div>
      <div className="catalogue-status">{dataFeedStatus.toLowerCase() === "inactive" ? dataFeedStatus : subscriptionStatus}</div>
    </Card>
  );
};

export default withRouter(Catalog);