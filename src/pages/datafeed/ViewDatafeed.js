import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Button,
  PageHeader,
  Steps,
  message,
  Alert,
  Row,
  Col,
  Badge,
  Tooltip,
  Descriptions,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Headers from "../header/Header";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import DatafeedDetails from "../../components/datafeed/DatafeedDetails";
import ReviewSubmit from "../../components/datafeed/ReviewSubmit";
import {
  startAddDatafeed,
  getConfigById,
} from "../../store/actions/datafeedAction";
import "./datafeed.css";
import { formDataFn } from "../../store/actions/DatafeedActions";
import { QuestionCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import getPermissionObject from "../../utils/accessObject";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
} from "../../utils/Constants";

const { Step } = Steps;

const ViewDatafeed = (props) => {
  const [formData, setFormData] = useState(false);
  const [current, setCurrent] = useState(0);
  const [btnStatus, setBtnStatus] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const patams = useParams();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.datafeedInfo.formData);
  const record = location.state.datafeedRecord;
  const row = location.state.dataset;
  const datafeedPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_PAGE_AND_BUTTON
  );

  const addDataConfigPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );

  const getOperationText = () => {
    let text = "Add Data Feed";
    if (location.state.isView || location.state.isUpdate) {
      return "View Data Feed";
    }
    return text;
  };
  const breadcrumb = [
    { name: "Entities", url: "/masterData" },

    {
      name: getOperationText(),
    },
  ];
  const next = (values) => {
    if (values) return setCurrent(current + 1);
    setFormData(values === false ? false : true);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const steps = [
    {
      title: "General Details",
      content: <DatafeedDetails next={next} formData={formData} />,
    },
  ];
  const cancelHandler = () => {
    history.push("/masterData");
  };
  //check shortName has '/'
  const checkUrlSlash = (frontSlashVar) => {
    return frontSlashVar.includes("/")
      ? frontSlashVar.replaceAll("/", "%2F")
      : frontSlashVar;
  };

  const submitFeed = async () => {
    setIsSubmitted(true);
    const res = await dispatch(startAddDatafeed(data));
    if (res && res.data && res.data.statusMessage && location.state.isUpdate) {
      message.success(` The Data Feed has been successfully updated!`);
      history.push("/masterData");
    } else if (
      res &&
      res.data &&
      res.data.statusMessage &&
      !location.state.isUpdate
    ) {
      message.success(` The Data Feed, ${res.data.datafeed.feedId} has been successfully submitted and
            is pending for approval!`);
      history.push("/masterData");
    } else if (res && res.message) {
      message.error(res.message);
      history.push("/masterData");
    }
    setIsSubmitted(false);
  };
  let feedUpdateLink = checkUrlSlash(row.shortName);
  return (
    <div id="main">
      <Headers />
      <div className="header-one">
        <div className="breadcrumb-parent">
          <Breadcrumb breadcrumb={breadcrumb} />
          <div className="btn-top-parent">
            {record &&
            record.feedUpdateFlag &&
            record.feedUpdateFlag.toLowerCase() === "n" ? (
              <Link
                to={{
                  pathname: `/masterData/${feedUpdateLink}/datafeed`,
                  state: {
                    dataset: row,
                    isUpdate: true,
                    datafeedRecord: record,
                  },
                }}
                onClick={() => dispatch(formDataFn(record))}
              >
                <Button
                  type="primary"
                  style={{ width: 100 }}
                  disabled={datafeedPages && datafeedPages.permission !== "RW"}
                >
                  Edit
                </Button>
              </Link>
            ) : (
              // <Link onClick={"warning"} disabled={"isMasterDataDisabled"}>
              <Link>
                {" "}
                <Button
                  type="primary"
                  style={{ width: 100 }}
                  disabled={datafeedPages && datafeedPages.permission !== "RW"}
                >
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div>
          <PageHeader
            title={getOperationText()}
            ghost={false}
            onBack={() => history.push("/masterData")}
            className="pt-10 pb-0  home-page"
          ></PageHeader>
        </div>
      </div>
      {data &&
        data.feedStatus &&
        data.feedId &&
        data.feedStatus.toLowerCase() === "pending" && (
          <div style={{ margin: "10px 24px -10px 24px" }}>
            <Alert
              message="This Data Feed is currently under review. You will be able to subscribe once the Data Feed is approved and the status is “Active”."
              type="warning"
              showIcon
            />
          </div>
        )}
      <div className="form-layout content-wrapper">
        <Row style={{ backgroundColor: "white", minHeight: 300 }}>
          <Col span={24}>
            <div style={{ marginLeft: "1rem" }}>
              <strong style={{ fontSize: "1.4rem" }}>General Details</strong>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginLeft: "1rem" }}>
              <p>
                <strong>Data Feed ID :</strong>{" "}
                {data.feedId ? data.feedId : "-"}
              </p>
              <p>
                <strong>
                  Dataset short name{" "}
                  <Tooltip title="The dataset that this feed is under.">
                    <span style={{ color: "#007AFF" }}>
                      {" "}
                      <QuestionCircleOutlined />{" "}
                    </span>
                  </Tooltip>
                  :
                </strong>{" "}
                {row ? row.shortName : "-"}
              </p>
              <Descriptions
                layout="horizontal"
                column={1}
                size="middle"
                // style={{ marginLeft: "1rem" }}
              >
                <Descriptions.Item
                  label="Long name"
                  labelStyle={{
                    fontFamily: "inherit",
                    fontWeight: "bold",
                  }}
                >
                  {data.longName ? data.longName : "-"}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions layout="horizontal" column={1} size="middle">
                <Descriptions.Item
                  label="Short name"
                  labelStyle={{
                    fontFamily: "inherit",
                    fontWeight: "bold",
                  }}
                >
                  {data.shortName ? data.shortName : "-"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginLeft: "1rem" }}>
              <p>
                {" "}
                <strong> Status : </strong>
                {data.feedStatus ? (
                  data.feedStatus === "Active" ? (
                    <Badge
                      className="style-badge"
                      style={{ marginLeft: 10 }}
                      status="success"
                      text="Active"
                    />
                  ) : (
                    <Badge
                      className="style-badge"
                      style={{ marginLeft: 10 }}
                      status="error"
                      text={data.feedStatus}
                    />
                  )
                ) : (
                  "-"
                )}
              </p>
              <p>
                <strong> Data confidentiality :</strong>{" "}
                {data.dataConfidentiality ? data.dataConfidentiality : "-"}
              </p>
              <p>
                <strong>
                  {" "}
                  Contains personal data{" "}
                  <Tooltip title="The type of personal data this feed contains.">
                    <span style={{ color: "#007AFF" }}>
                      {" "}
                      <QuestionCircleOutlined />{" "}
                    </span>
                  </Tooltip>
                  :
                </strong>{" "}
                {data.personalData ? data.personalData : "-"}
              </p>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginLeft: "1rem" }}>
              <Link
                to={`/masterData/${data.feedId}/addConfiguration`}
                onClick={() => {
                  dispatch(getConfigById(data.feedId));
                  sessionStorage.setItem("feedShortName", row.shortName);
                  sessionStorage.setItem("feedStatus", record.feedStatus);
                }}
                disabled={
                  !addDataConfigPagesAndButton ||
                  (record.feedUpdateFlag.toString().toLowerCase() === "n" &&
                    record.feedStatus.toLowerCase() === "pending")
                    ? true
                    : false
                }
              >
                <strong style={{ fontSize: "1rem" }}>
                  Data Feed configuration{" "}
                </strong>{" "}
              </Link>
            </div>
          </Col>
          <Col span={24}>
            <Descriptions
              layout="horizontal"
              column={1}
              size="middle"
              style={{ marginLeft: "1rem" }}
            >
              <Descriptions.Item
                label="Description"
                labelStyle={{
                  fontFamily: "inherit",
                  fontWeight: "bold",
                }}
              >
                {data.feedDescription ? data.feedDescription : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ViewDatafeed;