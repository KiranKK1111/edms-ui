import { useState } from "react";
import { Alert, Box, Skeleton, Tab, Tabs } from "@mui/material";

import Overview from "./Overview";
import LicenceScope from "./LicenceScope";
import SubscribersTab from "./SubscribersTab";
import SubscriptionsTab from "./SubscriptionsTab";
import DocumentationTab from "./DocumentationTab";
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

const DatasetTabs = (props) => {
  const { datafeedStatus } = props;
  const [activeTab, setActiveTab] = useState("1");

  const dataFamilyLoading = props.dataFamily && props.dataFamily.loading;
  const licenseLoading = props.license && props.license.loading;
  const vendorLoading = props.vendor && props.vendor.loading;
  const contractLoading = props.contract && props.contract.loading;
  const sourceConfigLoading = props.sourceConfig && props.sourceConfig.loading;

  if (
    dataFamilyLoading ||
    licenseLoading ||
    vendorLoading ||
    contractLoading ||
    sourceConfigLoading
  ) {
    return <Skeleton variant="rectangular" height={240} />;
  }

  const isOverviewTab = !isButtonObject(CATELOG_MANAGEMENT_PAGE, CATELOG_OVERVIEW_TAB);
  const isMetadataTab = !isButtonObject(CATELOG_MANAGEMENT_PAGE, CATELOG_MATADATA_TAB);

  const getObjectForSubscription = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MY_SUBSCRIPTION
  );
  const getObjectForSubscribers = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_SUBSCRIBERS_TAB
  );
  const loginedRold = localStorage.getItem("entitlementType");
  const isGuestRole = loginedRold ? undefined : localStorage.getItem("guestRole");
  const getObjectForDocumentation = getPermissionObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_DOCUMENTATION_TAB
  );

  const items = (() => {
    const list = [
      {
        key: "1",
        label: "Overview",
        disabled: isOverviewTab,
        content: (
          <>
            {datafeedStatus && datafeedStatus.toLowerCase() === "pending" && (
              <Alert
                severity="warning"
                onClose={() => {}}
                className="mb-16"
                sx={{ mb: 2 }}
              >
                This data feed is currently under review by an Approver. You
                may request for access once it is approved.
              </Alert>
            )}
            <Overview />
          </>
        ),
      },
      { key: "2", label: "Licence scope", content: <LicenceScope /> },
      { key: "3", label: "Schema", disabled: isMetadataTab, content: <MetadataTab /> },
    ];

    if (
      getObjectForSubscription &&
      (getObjectForSubscription.permission === "R" ||
        getObjectForSubscription.permission === "RW")
    ) {
      list.push({
        key: "8",
        label: "My Subscriptions",
        content: <SubscriptionsTab />,
      });
    }

    if (getObjectForSubscribers && getObjectForSubscribers.permission === "R") {
      list.push({
        key: "9",
        label: "Subscribers",
        content: <SubscribersTab />,
      });
    }

    if (
      isGuestRole ||
      (getObjectForDocumentation && getObjectForDocumentation.permission === "R")
    ) {
      list.push({
        key: "10",
        label: "Documentation",
        content: <DocumentationTab catalogueObj={props.catalogueObj} />,
      });
    }

    return list;
  })();

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid var(--color-border-secondary)" }}
      >
        {items.map((it) => (
          <Tab
            key={it.key}
            value={it.key}
            label={it.label}
            disabled={!!it.disabled}
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Tabs>
      {items.map((it) => (
        <Box
          key={it.key}
          role="tabpanel"
          hidden={activeTab !== it.key}
          sx={{ pt: 2 }}
        >
          {activeTab === it.key && it.content}
        </Box>
      ))}
    </Box>
  );
};

export default DatasetTabs;
