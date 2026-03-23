import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Card,
  Table,
  Row,
  Col,
  Tag,
  message,
  Button,
  Tooltip,
  Switch,
  Divider,
} from "antd";
import { getSubscribers } from "../../store/actions/DatasetPageActions";
import { normalText } from "../stringConversion";
import moment from "moment";
import { deleteSubscriber } from "../../store/actions/DatasetPageActions";
import { Modal } from "antd";
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
//import isCatelogueAccessDisabled from "../../utils/accessRequestCatelog";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
} from "../../utils/Constants";

const { confirm } = Modal;
const SubscribersTab = (props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const res = async () => {
      const res1 = await dispatch(getSubscribers());

      if (res1.status === 200) setLoading(true);
    };
    res();
  }, [dispatch]);

  const { subscribers } = useSelector((state) => state.dataset);

  let tab = "Loading...";

  if (loading) {
    const subscriptionArr = [
      "subscriptionId",
      "billingModel",
      "expirationDate",
      "subscriptionCycle",
    ];

    const brArr = [
      "subscriptionId",
      "department",
      "clarityId",
      "numberOfLicences",
      "projectName",
      "reasonForSubscription",
    ];

    const usageArr = ["estRechargeCostPerAnnum", "alertsAndNotifications"];
    let subscribersList = [...subscribers.data];

    subscribersList = subscribersList.filter(
      (item) => item.dataFeedId === location.state.data.dataFeedId
    );

    const isQuestionTooltip = (val) => {
      let isToolTip;
      switch (val) {
        case "department":
          isToolTip = "The department this subscription will be used under.";
          break;
        case "clarityId":
          isToolTip =
            "Enter the clarity ID of the project this subscription is under.";
          break;
       // case "numberOfEndUserSubscriptions":
        case "numberOfLicences":
          isToolTip =
            "Number of end users who will have access to the data from this subscriptions.";
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

    const columns = [
      { title: "Requester", dataIndex: "subscriber", key: "subscriber" },
      {
        title: "Subscription Type",
        dataIndex: "subscriptionType",
        key: "subscriptionType",
      },
      {
        title: "Subscriber",
        dataIndex: "subscriptionFor",
        key: "subscriptionFor",
      },
      {
        title: "Subscription Date",
        dataIndex: "subscriptionDate",
        key: "subscriptionDate",
      },
      { title: "Status", dataIndex: "status", key: "status" },
      {
        title: "Actions",
        dataIndex: "delete",
        key: "delete",
      },
    ];
    const psid = localStorage.getItem("psid");

    const data = subscribersList.map((item, j) => {
      const {
        //licensesSubscribed: numberOfEndUserSubscriptions,
        licensesSubscribed: numberOfLicences,
        subscriptionStatus: status,
        subscriber: subscriptionFor,
        reason: reasonForSubscription,
        ...rest
      } = subscribersList[j];
      const objRevised = {
       // numberOfEndUserSubscriptions,
        numberOfLicences,
        status,
        subscriptionFor,
        reasonForSubscription,
        ...rest,
      };
      return {
        key: j + 1,
        subscriber: item.requester,
        subscriptionType: item.subscriptionType,
        subscriptionFor: item.subscriber,
        subscriptionDate: moment(item.createdOn).format("DD MMM YYYY"),
        status:
          item.subscriptionStatus &&
          item.subscriptionStatus.toLowerCase() !== "active" ? (
            item.subscriptionStatus.toLowerCase() == "pending" ? (
              <Tag color="orange">{item.subscriptionStatus}</Tag>
            ) : (
              <Button disabled size="small" isToolTip>
                {item.subscriptionStatus}
              </Button>
            )
          ) : (
            <Tag color="green">{item.subscriptionStatus}</Tag>
          ),
        description: (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "16px",
              boxSizing: "border-box",
            }}
          >
            <div className="review-submit">
              <h3>Subscription Details</h3>
              <Row>
                {brArr.map((item, i) => {
                  return (
                    <Col span={brArr.length === i + 1 ? 16 : 8} key={i}>
                      <span className="label-review">
                        {normalText(item).replace("Id", "ID")}&nbsp;
                        {labelTooltip(item)}&nbsp;:
                      </span>
                      {objRevised[item]}
                    </Col>
                  );
                })}
              </Row>
            </div>
          </div>
        ),
        delete: (
          <Button
            type="link"
            danger
            disabled={
              isButtonObject(
                CATELOG_MANAGEMENT_PAGE,
                CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
              ) ||
              (item.subscriptionStatus &&
                item.subscriptionStatus.toLowerCase() === "inactive")
            }
            onClick={() =>
              deletePopUpHandler(subscribersList, item.subscriptionId, psid)
            }
          >
            <div style={{ fontWeight: "bold" }}>Deactivate</div>
          </Button>
        ),
      };
    });

    if (subscribersList.length === 0) {
      tab = "No Subscribers";
    } else {
      tab = (
        <>
          <h3 className="content-header" style={{ fontWeight: "bold" }}>
            Subscribers
          </h3>
          <Divider />
          <Table
            pagination={true}
            columns={columns}
            expandable={{
              expandedRowRender: (record) => (
                <p style={{ margin: 0 }}>{record.description}</p>
              ),
            }}
            dataSource={data.reverse()}
          />
        </>
      );
    }
  }

  const DeactivateModal = ({ lisences }) => {
    return (
      <>
        <div className="deactivate-model">
          <Divider style={{ width: "120%", marginLeft: -35, marginTop: -3 }} />
          {lisences > 1 && (
            <>
              <p className="deactivate-margin">
                {" "}
                The subscription have more than 1 end user! Have the users been
                notified of this deactivation?
              </p>
              <div>
                <Switch size="small" checked disabled /> &nbsp; &nbsp;
                <span>Notify</span>
              </div>
            </>
          )}
          <div className="deactivate-margin">
            <strong>Delete Data Feed</strong>
            <p>
              This will revoke your access to the Data Feed. Are you sure want
              to proceed?
            </p>
          </div>
          <Divider
            style={{ width: "120%", marginLeft: -35, marginBottom: -10 }}
          />
        </div>
      </>
    );
  };

  // On Subscriber Delete Click Show PopUp
  const deletePopUpHandler = (value1, value2, psId) => {
    let dataObj = value1.filter((v) => v.subscriptionId === value2);
    let data = {
      ...(dataObj.length && { ...dataObj[0] }),
    };
    confirm({
      title: "Unsubscribe from data feed ?",
      icon: <ExclamationCircleOutlined />,
      cancelButtonProps: true,
      content: <DeactivateModal lisences={data.licensesSubscribed} />,
      okText: "Deactivate",
      okType: "danger primary",
      onOk() {
        deleteHandler(data, psId);
      },
      onCancel() {},
    });
  };

  //On Subscriber Delete --> Pop up Appears--> on Click of Delete make API call
  const deleteHandler = async (data, psid) => {
    data.subscriptionStatus = "Inactive";
    data.lastUpdatedBy = psid;
    const res = await dispatch(deleteSubscriber(data));
    if (res.message !== undefined) {
      message.error(res.message);
    } else if (res.data !== undefined) {
      message.success("Subscriber deactivated successfully!");
      await dispatch(getSubscribers());
    }
  };

  return <Card>{tab}</Card>;
};

export default SubscribersTab;