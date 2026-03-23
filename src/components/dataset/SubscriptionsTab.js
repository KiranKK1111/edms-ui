import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Card, Result, Alert, Divider, Row, Col, Badge, Tooltip } from "antd";
import {
  ExclamationCircleFilled,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { normalText } from "../stringConversion";
import { subscriptionTabInfo } from "../../store/actions/DatasetPageActions";
import DisplayTC from "../requestAccess/DisplayTC";

const SubscriptionsTab = () => {

  const location = useLocation();
  const dispatch = useDispatch();
  const subscription = useSelector((state) => state.requestAccess.businessRequirements[0]);
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

  let data1 = data ? { ...data } : {};
  let {
    licensesSubscribed: numberOfLicences,
    subscriptionStatus: status,
    subscriber: subscriptionFor,
    reason: reasonForSubscription,
    ...rest
  } = data1 ? data1 : {};

  const objRevised = {
    numberOfLicences,
    status,
    subscriptionFor,
    reasonForSubscription,
    ...rest,
  };

  const isQuestionTooltip = (val) => {
    let isToolTip;
    switch (val) {
      case "department":
        isToolTip = "The department this subscription will be used under.";
        break;
      case "clarityId":
        isToolTip =
          "Enter the clarity ID of the project this subscription is under.";
        break;
      case "numberOfLicences":
        isToolTip =
          "Number of end users who will have access to the data from this subscriptions.";
        break;
      default:
        isToolTip = "";
    }
    return isToolTip;
  };

  const labelTooltip = (tooltipTxt) => {
    const toolTip = isQuestionTooltip(tooltipTxt);
    return (
      <Tooltip title={toolTip}>
        {toolTip && (
          <span style={{ color: "#007AFF" }}>
            <QuestionCircleOutlined />
          </span>
        )}
      </Tooltip>
    );
  };

  if (
    objRevised &&
    objRevised.status &&
    objRevised.status.toLowerCase() === "active"
  ) {
    status = "success";
  }
  if (
    objRevised &&
    objRevised.status &&
    objRevised.status.toLowerCase() === "pending"
  ) {
    status = "warning";
  }
  if (
    objRevised &&
    objRevised.status &&
    objRevised.status.toLowerCase() === "inactive"
  ) {
    status = "error";
  }

  let content = (
    <Card>
      <Result
        icon={<ExclamationCircleFilled style={{ color: "red" }} />}
        title={
          <h3 className="result-head">You are not currently subscribed</h3>
        }
        extra={
          <p className="result-text">
            To subscribe to this dataset, please request access from the Licence
            Owner.
          </p>
        }
      />
    </Card>
  );

  if (subscriptionId) {
    content = (
      <div>
        {subscriptionStatus &&
          subscriptionStatus.toLowerCase() === "pending" && (
            <Alert
              style={{ marginBottom: "10px" }}
              message="Your access request is currently under review. This view will be refreshed once your request is approved. Please check back later."
              type="warning"
              showIcon
              closable
            />
          )}
        <Card>
          <div className="review-submit">
            <h3 style={{ paddingBottom: "0" }}>Subscription Details</h3>
            <Divider />
            <h3>Business Requirements</h3>
            <Row gutter={[0, 7]}>
              {brArr.map((item, i) => (
                <Col span={brArr.length === i + 1 ? 16 : 8} key={i}>
                  <span className="label-review">
                    {normalText(item).replace("Id", "ID")}
                    {labelTooltip(item)}:
                  </span>
                  {item === "status" ? <Badge status={status} /> : ""}
                  {objRevised[item]}
                </Col>
              ))}
            </Row>
            <Divider />
            <DisplayTC
              view="st"
              subForFlag={subscription && subscription.subscriptionType && subscription.subscriptionType.toLowerCase() === 'individual subscription' ? true : false}
              vendorRequest={subscription && subscription.subscriptionVendorRequest} />
          </div>
        </Card>
      </div>
    );
  }
  return <>{content}</>;
};

export default SubscriptionsTab;