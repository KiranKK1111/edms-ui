import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, withRouter } from "react-router-dom";
import {
  Divider,
  Layout,
  Menu,
  Row,
  Col,
  Descriptions,
  Tooltip,
  Badge,
  Table,
  Tag,
  Button,
} from "antd";
import { QuestionCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import cronstrue from "cronstrue";
import moment from "moment";

import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
} from "../../utils/Constants";
import { getDatasetMetadataInfo } from "../../store/actions/DatasetPageActions";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const Overview = (props) => {
  const [content, setContent] = useState("1");
  const [relatedFeedsList, setRelatedFeedsList] = useState([]);
  const datafeedInfo = useSelector((state) => state.datafeedInfo.datafeedById);
  const metadataInfo = useSelector((state) => state.datafeedInfo.metadata.data);
  const datasetInfo = useSelector((state) => state.dataFamily.datasetById);
  const licenseInfo = useSelector((state) => state.license.licenseById);
  let catalogueList = useSelector((state) => state.catalogueList.catalogueList);
  const dispatch = useDispatch();

  const location = useLocation();
  const datafeedIdFromState = location.state.data.datafeedById;
  //Adding this object because initially we are getting datafeed as empty object
  let emptyDataFeedObj = {
    feedId: "",
    longName: "",
    shortName: "",
    protocol: "",
    feedDescription: "",
    dataConfidentiality: "",
    documentationLink: "",
    documentationFile: "",
    personalData: "",
    feedStatus: "",
  };
  const {
    feedId: datafeedId,
    longName: datafeedLongName,
    shortName: datafeedShortName,
    protocol: datafeedProtocol,
    feedDescription: datafeedDescription,
    dataConfidentiality: datafeeddataConfidentiality,
    documentationLink: datafeedtechnicalDocumentationLink,
    documentationFile,
    personalData: datafeedPersonalData,
    feedStatus: datafeedStatus,
  } = Object.keys(datafeedInfo).length === 0
    ? emptyDataFeedObj
    : datafeedInfo.datafeed;

  useEffect(() => {
    const getMetadata = async () => {
      if (datafeedId) {
        await dispatch(getDatasetMetadataInfo(datafeedId));
      }
    };
    getMetadata();
  }, [datafeedId]);

  const {
    datasetId,
    longName: datasetLongName,
    shortName: datasetShortName,
    datasetDescription: datasetDescription,
    datasetStatus,
    licenseId: datasetLicenseId,
  } = datasetInfo;
  useEffect(() => {
    if (datasetId && catalogueList) {
      const relatedDatafeedList = catalogueList.filter((u) => {
        return u.datasetId === datasetId && u.dataFeedId !== datafeedId;
      });
      setRelatedFeedsList(relatedDatafeedList);
    } else {
      setRelatedFeedsList([]);
    }
  }, [datasetId]);

  const { licenseShortName } = licenseInfo ? licenseInfo : {};
  const getValues = ({ item, key, keyPath, domEvent }) => {
    setContent(key);
  };
  const getcronExpression = (cronExp) => {
    if (
      cronExp &&
      cronExp !== "null" &&
      cronExp !== "NA" &&
      cronExp.toLowerCase() !== "notused" &&
      cronExp.toLowerCase() !== "not used"
    ) {
      const dateTime = cronstrue.toString(cronExp, {
        use24HourTimeFormat: true,
      });

      let cornjobDate = "NA";
      const dateTimeSplit = dateTime.split(",");
      if (
        cronExp.includes("* * *") ||
        !/\d/.test(cronExp) ||
        !dateTime.includes(",") ||
        cronExp.includes(",") ||
        dateTimeSplit.length > 0
      ) {
        return dateTime;
      }
      return cornjobDate;
    } else {
      return "NA";
    }
  };

  const getScheduledTime = (cronExp) => {
    let intermediateString = getcronExpression(cronExp);
    let result =
      intermediateString !== "NA"
        ? intermediateString.substr(0, intermediateString.indexOf(","))
        : "NA";
    if (!intermediateString.includes(",")) {
      result = intermediateString;
    }
    return result;
  };
  const getFrequency = (cronExp) => {
    let intermediateString = getcronExpression(cronExp);
    let result = "NA";

    if (intermediateString.toLocaleLowerCase().includes("every")) {
      result = intermediateString;
    } else if (intermediateString.includes(",")) {
      result =
        intermediateString !== "NA" || !intermediateString.includes(",")
          ? intermediateString.substr(intermediateString.indexOf(",") + 1)
          : "NA";
    }

    return result;
  };
  const getStatus = (status) => {
    let statusResult;
    if (status) {
      if (status.toString().toLowerCase() === "active") {
        statusResult = "success";
      }
      if (status.toString().toLowerCase() === "pending") {
        statusResult = "warning";
      }
      if (status.toString().toLowerCase() === "expired") {
        statusResult = "error";
      }
    }
    return statusResult;
  };

  const getConfigStatus = (status) => {
    let statusResult = "error";
    if (status) {
      statusResult = "success";
    }
    return statusResult;
  };

  let feedstatus = getStatus(datafeedStatus);
  let setstatus = getStatus(datasetStatus);

  const handler1 = (text) => {
    const feed = relatedFeedsList.filter(
      (item) => item.dataFeedLongName === text
    );

    props.history.push({
      pathname: "/catalog/details",
      state: {
        data: feed[0],
      },
    });
  };

  let contentLayout = "Loading...";

  const redirect = (path) => {
    props.history.push({
      pathname: "/catalog/subscription",
      state: {
        data: location.state.data,
      },
    });
  };

  const getFileFormat = (val) => {
    let fileFormat = "NA";
    if (
      val.includes("FundamentalsRoute") ||
      val.includes("XpathSplitValidateRoute")
    ) {
      fileFormat = "xml";
    } else if (
      val.includes("JSONSplitValidateRoute")||
      val.includes("JSONLValidateRoute")
    ) {
      fileFormat = "json";
    } else if (val.includes("CSVInitialRoute")) {
      fileFormat = "csv";
    }
    return fileFormat;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "dataFeedLongName",
      ellipsis: true,
      width: 250,
      render: (text) => {
        return (
          <Button type="link" onClick={() => handler1(text)}>
            {text}
          </Button>
        );
      },
    },
    {
      title: "Data Source",
      dataIndex: "entityShortName",
      width: 150,
    },
    {
      title: "Dataset",
      dataIndex: "datasetShortName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "dataFeedDescription",
      ellipsis: true,
    },
    {
      title: "Subscription",
      dataIndex: "subscription",
      fixed: "right",
      width: 150,
      render: (text) => {
        const guestRole = localStorage.getItem("guestRole");
        if (
          text &&
          text.subscriptionStatus.toString().toLowerCase() !== "inactive"
        ) {
          const text1 = getStatus(text.subscriptionStatus);
          return (
            <Tag color={text1} icon={<CheckCircleOutlined />}>
              {text.subscriptionStatus.toLowerCase() === "active"
                ? "Subscribed"
                : text.subscriptionStatus}
            </Tag>
          );
        } else {
          return (
            <Button
              disabled={
                guestRole ||
                isButtonObject(
                  CATELOG_MANAGEMENT_PAGE,
                  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
                )
                  ? true
                  : false
              }
              onClick={redirect}
              type="link"
            >
              Request Access
            </Button>
          );
        }
      },
    },
  ];

  const labelTooltip = (lable, tooltipTxt) => {
    return (
      <div className="label-bold">
        {lable}
        <Tooltip title={tooltipTxt}>
          <span style={{ color: "#007AFF" }}>
            {" "}
            <QuestionCircleOutlined />{" "}
          </span>
        </Tooltip>
      </div>
    );
  };

  if (content === "1") {
    contentLayout = (
      <Content className="overview-content">
        <h3 className="content-header" style={{ paddingBottom: "16px" }}>
          Data Feed details
        </h3>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Data Feed ID"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datafeedId ? datafeedId : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label={labelTooltip(
                  "Dataset",
                  "The dataset that this data feed is under."
                )}
              >
                {datasetShortName ? datasetShortName : "NA"}
              </Descriptions.Item>

              <Descriptions.Item
                label="Short name"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datafeedShortName ? datafeedShortName : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Long name"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datafeedLongName ? datafeedLongName : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Data confidentiality"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datafeeddataConfidentiality
                  ? datafeeddataConfidentiality
                  : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label={labelTooltip(
                  "Personal data type",
                  "The type of personal data this feed contains."
                )}
              >
                {datafeedPersonalData ? datafeedPersonalData : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Configuration status"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo &&
                Object.keys(metadataInfo).length > 0 &&
                metadataInfo.isEnabled != undefined ? (
                  <Badge
                    status={getConfigStatus(metadataInfo.isEnabled)}
                    text={metadataInfo.isEnabled ? "Active" : "Inactive"}
                  />
                ) : (
                  "NA"
                )}
                 
              </Descriptions.Item>
              <Descriptions.Item
                label="Source protocol"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo && metadataInfo.sourceProcessor
                  ? metadataInfo.sourceProcessor === "sftpProcessor"
                    ? "SFTP"
                    : "HTTPS"
                  : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Data format"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo && metadataInfo.splittingCanonicalClass
                  ? getFileFormat(metadataInfo.splittingCanonicalClass)
                  : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Start date"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo && metadataInfo.start
                  ? moment(metadataInfo.start).format("DD MMM YYYY")
                  : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Scheduled data update GMT"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo && metadataInfo.cronExpression
                  ? metadataInfo.cronExpression === "livestreaming"
                    ?"livestreaming"
                    : getScheduledTime(metadataInfo.cronExpression)
                  : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Frequency"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {metadataInfo && metadataInfo.cronExpression
                   ? metadataInfo.cronExpression === "livestreaming"
                     ?"livestreaming"
                     : getFrequency(metadataInfo.cronExpression)
                  : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Description"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datafeedDescription ? datafeedDescription : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Content>
    );
  }
  if (content === "21" || content === "22") {
    contentLayout = (
      <Content className="overview-content">
        <h3 className="content-header" style={{ paddingBottom: "16px" }}>
          Dataset details
        </h3>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Dataset ID"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datasetId ? datasetId : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Long Name"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datasetLongName ? datasetLongName : "NA"}
              </Descriptions.Item>
              <Descriptions.Item
                label="Short Name"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datasetShortName ? datasetShortName : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={10}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Description"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {datasetDescription ? datasetDescription : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8}>
            <Descriptions layout="horizontal" column={1} size="middle">
              <Descriptions.Item
                label="Status"
                labelStyle={{ fontFamily: "Inter-Medium" }}
              >
                {setstatus ? (
                  <Badge status={setstatus} text={datasetStatus} />
                ) : (
                  "NA"
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={labelTooltip(
                  "Licence Short Name",
                  "The licence that this dataset is under"
                )}
              >
                {licenseShortName ? licenseShortName : "NA"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {content === "22" ? (
          <>
            <Divider />
            <div className="overview-content">
              <h3 className="content-header" style={{ paddingBottom: "16px" }}>
                Related Data Feeds
              </h3>
              <Table
                dataSource={relatedFeedsList}
                columns={columns}
                scroll={{ x: 1100 }}
                size="small"
              />
            </div>
          </>
        ) : null}
      </Content>
    );
  }

  return (
    <div className="content-wrapper" id="main">
      <h3 className="content-header" style={{ fontWeight: "bold" }}>
        Overview
      </h3>
      <Divider />
      <Layout className="site-layout-background">
        <Sider className="site-layout-background" width={230}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ height: "100%" }}
            onClick={getValues}
          >
            <Menu.Item key="1">Data Feed details</Menu.Item>
            <SubMenu key="2" title="Dataset details">
              <Menu.Item key="21">Dataset details</Menu.Item>
              <Menu.Item key="22">Related Data Feeds</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        {contentLayout}
      </Layout>
    </div>
  );
};

export default withRouter(Overview);