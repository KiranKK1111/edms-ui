import { useState, useEffect, createRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Input,
  Layout,
  Menu,
  Skeleton,
  Space,
  Tabs,
  Form,
  Alert,
} from "antd";
import Overview from "./Overview";
import LicenceScope from "./LicenceScope";
import MetadataTable from "./MetadataTable";
import SubscribersTab from "./SubscribersTab";
import SubscriptionsTab from "./SubscriptionsTab";
import DocumentationTab from "./DocumentationTab";
import { schedulerDatabase } from "../../store/actions/SourceConfigActions";
import isSubscribersTabVisible from "../../utils/accessSubscribersTab";

import moment from "moment";
import MetadataTab from "./MetadataTab";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_OVERVIEW_TAB,
  CATELOG_MATADATA_TAB,
  CATELOG_SUBSCRIBERS_TAB,
  CATELOG_MY_SUBSCRIPTION,
  CATELOG_DOCUMENTATION_TAB,
} from "../../utils/Constants";
import getPermissionObject from "../../utils/accessObject";

const { TabPane } = Tabs;

const DatasetTabs = (props) => {
  const { datafeedStatus } = props;
  const [activeTab, setActiveTab] = useState(1);
  const [licenseData, setLicenseData] = useState([]);
  const dataFamilyLoading = props.dataFamily && props.dataFamily.loading;
  const licenseLoading = props.license && props.license.loading;
  const vendorLoading = props.vendor && props.vendor.loading;
  const contractLoading = props.contract && props.contract.loading;
  const sourceConfigLoading = props.sourceConfig && props.sourceConfig.loading;
  const location = useLocation();

  const {
    userData: licenseUserData,
    allowedUserTypes,
    projectSubscription,
    licenseType,
    noOfLicenses,
    licensesUsed,
  } = props.license && props.license.data ? props.license.data : {};

  const { description: vendorDescription } =
    props.vendor && props.vendor.data ? props.vendor.data : {};

  if (
    dataFamilyLoading ||
    licenseLoading ||
    vendorLoading ||
    contractLoading ||
    sourceConfigLoading
  ) {
    return <Skeleton active />;
  }

  // Business Management, data display Value
  let businessUnitDisplay = null;
  if (licenseUserData) {
    if (licenseUserData.toLowerCase() === "no") {
      businessUnitDisplay = "All";
    } else {
      businessUnitDisplay = allowedUserTypes;
    }
  }

  // Project Specific, data display value
  let projectSpecificDisplay = null;
  if (projectSubscription) {
    if (projectSubscription.toLowerCase() === "no") {
      projectSpecificDisplay = "None";
    } else {
      projectSpecificDisplay = "List of specific project -> - Not Available -";
    }
  }

  let country = "";

  let productDescription = "-";

  let totalLicenses = "";
  let listSpecificProject = "";

  const loggedInTitle = localStorage.getItem("entitlementType");

  const isOverviewTab = !isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_OVERVIEW_TAB
  );
  const isMetadataTab = !isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MATADATA_TAB
  );

  const getObjectForSubscription = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MY_SUBSCRIPTION
  );

  const getObjectForSubscribers = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_SUBSCRIBERS_TAB
  );

  let loginedRold = localStorage.getItem("entitlementType");
  const isGuestRole = loginedRold
    ? undefined
    : localStorage.getItem("guestRole");

  const getObjectForDocumentation = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_DOCUMENTATION_TAB
  );

  return (
    <Tabs defaultActiveKey={`${activeTab}`} style={{ fontWeight: "bold" }}>
      <TabPane
        tab="Overview"
        key="1"
        style={{ fontWeight: "normal" }}
        disabled={isOverviewTab}
      >
        {datafeedStatus && datafeedStatus.toLowerCase() === "pending" ? (
          <Alert
            message="This data feed is currently under review by an Approver. You may request for access once it is approved."
            type="warning"
            showIcon
            closable
            className="mb-16"
          />
        ) : null}
        <Overview />
      </TabPane>
      <TabPane tab="Licence scope" key="2" style={{ fontWeight: "bold" }}>
        <LicenceScope />
      </TabPane>
      <TabPane
        tab="Schema"
        key="3"
        style={{ fontWeight: "bold" }}
        disabled={isMetadataTab}
      >
        <MetadataTab />
      </TabPane>
      {getObjectForSubscription &&
      (getObjectForSubscription.permission === "R" ||
        getObjectForSubscription.permission === "RW") ? (
        <TabPane
           tab="My Subscriptions"
          key="8"
          disabled={
            !getObjectForSubscription.permission === "R" ||
            !getObjectForSubscription.permission === "RW"
          }
        >
          <SubscriptionsTab />
        </TabPane>
      ) : null}

      {getObjectForSubscribers && getObjectForSubscribers.permission === "R" ? (
        <TabPane
          tab="Subscribers"
          key="9"
          style={{ fontWeight: "normal" }}
          disabled={
            getObjectForDocumentation &&
            !getObjectForDocumentation.permission === "R"
          }
        >
          <SubscribersTab />
        </TabPane>
      ) : null}
      {isGuestRole ||
      (getObjectForDocumentation &&
        getObjectForDocumentation.permission === "R") ? (
        <TabPane
          tab="Documentation"
          key="10"
          style={{ fontWeight: "bold" }}
          disabled={
            getObjectForDocumentation &&
            !getObjectForDocumentation.permission === "R"
          }
        >
          <DocumentationTab catalogueObj={props.catalogueObj} />
        </TabPane>
      ) : null}
    </Tabs>
  );
};

export default DatasetTabs;