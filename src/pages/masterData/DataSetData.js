import React, { useEffect, memo, useMemo } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  RemoveCircleOutlined as RemoveCircleIcon,
  Description as FormIcon,
  MenuOpen as MenuUnfoldIcon,
  VisibilityOutlined as VisibilityIcon,
} from "@mui/icons-material";

import {
  startGetDatafeeds,
  startUpdateDataFeed,
  clearFeed,
  formDataFn,
} from "../../store/actions/datafeedAction";
import {
  datasetInfo,
  startDataset,
} from "../../store/actions/datasetFormActions";
import { allSubscriptionList } from "../../store/actions/CatalogPageActions";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import { CamelText } from "../../components/addContract/ContractDetails";
import {
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON,
  MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON,
  ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON,
  ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
} from "../../utils/Constants";
import isButtonObject from "../../utils/accessButtonCheck";
import getPermissionObject from "../../utils/accessObject";
import {
  DataTable,
  ActionsMenu,
  useConfirm,
  useSnackbar,
} from "../../design-system";

import "./VendorData.css";

const greenStatus = ["approved", "live", "active", "setup"];

const StatusChip = ({ value, mode = "default" }) => {
  if (!value) return null;
  const v = value.toLowerCase();
  if (greenStatus.includes(v)) {
    return <Chip size="small" color="success" variant="outlined" label={value} />;
  }
  if (mode === "feed") {
    if (v === "inactive" || v === "deactivate") {
      return <Chip size="small" className="inactive-tag" label={CamelText(value)} />;
    }
    if (v === "pending") return <Chip size="small" color="warning" variant="outlined" label={value} />;
    if (v === "expired") return <Chip size="small" color="error" variant="outlined" label={value} />;
    return <Chip size="small" color="warning" variant="outlined" label={value} />;
  }
  return <Chip size="small" color="warning" variant="outlined" label={CamelText(value)} />;
};

const ConfigChip = ({ value }) => (
  <Chip
    size="small"
    color={value ? "success" : value === false ? "warning" : "default"}
    variant="outlined"
    label={value ? "Active" : value === false ? "Inactive" : "NA"}
  />
);

const checkUrlSlash = (s) => (s && s.includes("/") ? s.replaceAll("/", "%2F") : s);

const DataSetData = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const subscriptionList = useSelector(
    (state) => state.allSubscriptionList.allSubscriptionList
  );

  useEffect(() => {
    dispatch(clearFeed());
    dispatch(allSubscriptionList());
  }, [dispatch]);

  const isDisabledDatafeed = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_PAGE_AND_BUTTON
  );
  const isDatasetDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ADD_DATASET_PAGES_BUTTON
  );
  const isUpdateEditDeactiveDatafeed = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_UPADTE_ACTIVE_DELETE_BUTTON
  );

  const isDataSetDeactivateOrDelete = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATASET_DEACTIVATE_DELETE_BUTTON
  );
  const isAddDatasetDoc = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATASET_DOCUMENTATION_PAGE_AND_BUTTON
  );
  const isAddDatafeedDoc = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATAFEED_DOCUMENTATION_PAGE_AND_BUTTON
  );

  const datasetDisp = useMemo(() => {
    const out = [];
    if (!props.datasetsInfo) return out;
    const licensesList = props.licenses;
    props.datasetsInfo.forEach((ele, i) => {
      if (ele.entityId !== props.dataSetEntityId) return;
      const dataFeedNsetCount = props.datafeedsInfo
        ? props.datafeedsInfo.filter((f) => f.datasetId === ele.datasetId).length
        : 0;
      (licensesList || []).forEach((license) => {
        if (license.licenseId === ele.licenseId) {
          out.push({
            ...ele,
            key: i,
            datasetId: ele.datasetId,
            longName: ele.longName,
            licenseName: license.licenseShortName,
            dataFeeds: dataFeedNsetCount,
            status: ele.datasetStatus,
            taskStatus: ele.taskStatus,
          });
        }
      });
    });
    return out;
  }, [props.datasetsInfo, props.datafeedsInfo, props.licenses, props.dataSetEntityId]);

  const handleDatasetDeactivate = async (Data) => {
    const feedList = [...(props.datafeedsInfo || [])];
    const dataObj = { ...Data };
    const feedActive = feedList.some(
      (feed) =>
        Data.datasetId === feed.datasetId &&
        ((feed.feedStatus || "").toLowerCase() === "active" ||
          (feed.feedStatus || "").toLowerCase() === "pending")
    );
    if (feedActive) {
      await confirmer.info({
        title: "Unable to Deactivate Dataset!",
        content: "Status of Data Feed(s) under this Dataset is still active.",
        okText: "Ok",
      });
      return;
    }
    const ok = await confirmer.confirm({
      title: "Deactivate Dataset?",
      content: "Are you sure you want to proceed?",
      okText: "Deactivate",
      okColor: "error",
    });
    if (!ok) return;
    dataObj.datasetStatus = "Deactivate";
    dataObj.datasetUpdateFlag = "N";
    dataObj.lastUpdatedBy = localStorage.getItem("psid");
    dataObj.isUpdate = true;
    delete dataObj.key;
    delete dataObj.licenseName;
    delete dataObj.dataFeeds;
    delete dataObj.status;
    delete dataObj.taskStatus;
    const res = await dispatch(startDataset(dataObj));
    if (res && res.data) snackbar.success("Dataset deactivated successfully.");
    dispatch(startGetDatasets());
  };

  const handleDataFeedDeactivate = async (LicenseData) => {
    const dataObj = { ...LicenseData };
    const subsByFeed = (subscriptionList || []).filter(
      (sub) => sub.dataFeedId === dataObj.feedId
    );
    const subActive = subsByFeed.find((sub) => {
      const s = (sub.subscriptionStatus || "").toLowerCase();
      return s === "active" || s === "pending";
    });
    if (subActive && subsByFeed.length > 0) {
      await confirmer.info({
        title: "Unable to deactivate Data Feed!",
        content: "There are subscribers currently subscribed to this Data Feed.",
        okText: "Ok",
      });
      return;
    }
    const ok = await confirmer.confirm({
      title: "Deactivate Data Feed?",
      content: "Are you sure you want to proceed?",
      okText: "Deactivate",
      okColor: "error",
    });
    if (!ok) return;
    dataObj.feedStatus = "Deactivate";
    dataObj.feedUpdateFlag = "Y";
    dataObj.lastUpdatedBy = localStorage.getItem("psid");
    delete dataObj.taskStatus;
    delete dataObj.key;
    const res = await startUpdateDataFeed(dataObj);
    if (res && res.data) {
      snackbar.success("Data Feed deactivation request submitted successfully.");
    }
    dispatch(startGetDatafeeds());
  };

  const warningPending = () => {
    confirmer.info({
      title: "This is already submitted",
      content:
        "Your change request has been submitted for approval. The details will remain unchanged until your request is approved.",
      okText: "Ok",
    });
  };

  const renderDataFeeds = (row) => {
    const data = (props.datafeedsInfo || [])
      .filter((feed) => feed.datasetId === row.datasetId)
      .map((feed, i) => ({ ...feed, key: i }));

    const columns = [
      {
        accessorKey: "shortName",
        header: "Data Feed Name",
        size: 250,
        Cell: ({ row: feedRow }) => {
          const record = feedRow.original;
          const feedUpdateLink = checkUrlSlash(row.shortName);
          if (record.feedUpdateFlag && record.feedUpdateFlag.toLowerCase() === "n") {
            return (
              <Link
                to={{
                  pathname: `/masterData/${feedUpdateLink}/viewDatafeed`,
                  state: { dataset: row, isView: true, datafeedRecord: record },
                }}
                onClick={() => dispatch(formDataFn(record))}
              >
                {record.shortName}
              </Link>
            );
          }
          return (
            <Link to="/masterData" onClick={warningPending}>
              {record.shortName}
            </Link>
          );
        },
      },
      { accessorKey: "feedId", header: "Data Feed ID", size: 240 },
      {
        accessorKey: "feedStatus",
        header: "Data Feed status",
        size: 130,
        Cell: ({ cell }) => <StatusChip value={cell.getValue()} mode="feed" />,
      },
      {
        accessorKey: "isEnabled",
        header: "Configuration status",
        size: 150,
        Cell: ({ cell }) => <ConfigChip value={cell.getValue()} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        size: 200,
        Cell: ({ row: feedRow }) => {
          const record = feedRow.original;
          const feedUpdateLink = checkUrlSlash(row.shortName);
          const flag = (record.feedUpdateFlag || "").toLowerCase();
          const status = (record.feedStatus || "").toLowerCase();
          const warnDeactivate =
            flag === "y" &&
            (status === "pending" ||
              isDataSetDeactivateOrDelete?.permission !== "RW" ||
              status === "active");
          const deactivateDisabled =
            isDataSetDeactivateOrDelete?.permission !== "RW" ||
            status === "inactive" ||
            (flag === "n" && status === "pending");
          const docsDisabled =
            (isAddDatafeedDoc && isAddDatafeedDoc.permission !== "RW") ||
            !isAddDatafeedDoc ||
            status === "inactive" ||
            (flag === "n" && status === "pending");
          const configDisabled =
            status === "inactive" || (flag === "n" && status === "pending");

          const menuItems = [
            warnDeactivate
              ? {
                  key: "deactivate",
                  icon: <RemoveCircleIcon fontSize="small" />,
                  label: "Deactivate",
                  danger: true,
                  onClick: warningPending,
                }
              : {
                  key: "deactivate",
                  icon: <RemoveCircleIcon fontSize="small" />,
                  label: "Deactivate",
                  danger: true,
                  disabled: deactivateDisabled,
                  onClick: () => handleDataFeedDeactivate(record),
                },
            {
              key: "documents",
              icon: <FormIcon fontSize="small" />,
              label: "Documents",
              to: `/masterData/${record.feedId}/addDocuments`,
              disabled: docsDisabled,
            },
            {
              key: "configuration",
              icon: <MenuUnfoldIcon fontSize="small" />,
              label: "Configuration",
              to: `/masterData/${record.feedId}/addConfiguration`,
              disabled: configDisabled,
              onClick: () => {
                sessionStorage.setItem("feedShortName", record.shortName);
                sessionStorage.setItem("feedStatus", record.feedStatus);
              },
            },
          ];

          return (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center" }}
              className="row-actions"
            >
              {flag === "n" ? (
                <Button
                  component={Link}
                  variant="text"
                  size="small"
                  to={{
                    pathname: `/masterData/${feedUpdateLink}/datafeed`,
                    state: { dataset: row, isUpdate: true, fromLink: "updatePage" },
                  }}
                  onClick={() => dispatch(formDataFn(record))}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  component={Link}
                  variant="text"
                  size="small"
                  to="/masterData"
                  onClick={warningPending}
                >
                  Edit
                </Button>
              )}
              <ActionsMenu items={menuItems} />
            </Stack>
          );
        },
      },
    ];

    return (
      <Box
        sx={{
          py: 1.5,
          px: 0,
          background: "var(--color-bg-subtle)",
          borderTop: "1px solid var(--color-border-secondary)",
          borderBottom: "1px solid var(--color-border-secondary)",
          width: "100%",
        }}
      >
        <Box sx={{ fontWeight: 600, mb: 1, px: 2 }}>Data Feeds</Box>
        <DataTable
          columns={columns}
          data={data}
          rowKey="key"
          enablePagination={false}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableColumnFilters={false}
          enableStickyHeader={false}
          enableColumnActions={false}
          enableColumnResizing={false}
          bordered={false}
          layoutMode="semantic"
          muiTableContainerProps={{ sx: { maxHeight: "none" } }}
          muiTableProps={{ sx: { tableLayout: "auto", width: "100%" } }}
          muiTablePaperProps={{
            sx: {
              borderRadius: 0,
              border: "none",
              boxShadow: "none",
              background: "transparent",
              width: "100%",
            },
          }}
        />
      </Box>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "shortName",
        header: "Dataset Name",
        size: 240,
        Cell: ({ row }) => {
          const record = row.original;
          const datasetShortName = checkUrlSlash(record.licenseName);
          return (
            <Link
              to={{
                pathname: `/masterData/${datasetShortName}/dataset`,
                state: { isUpdate: true, licence: record },
              }}
              onClick={() => dispatch(datasetInfo(record))}
              className="contract-actions"
            >
              <strong>{record.shortName}</strong>
            </Link>
          );
        },
      },
      { accessorKey: "datasetId", header: "Dataset ID", size: 220 },
      { accessorKey: "licenseName", header: "Licence Name", size: 200 },
      { accessorKey: "dataFeeds", header: "Data Feeds", size: 120 },
      {
        accessorKey: "datasetStatus",
        header: "Dataset status",
        size: 140,
        filterVariant: "select",
        filterSelectOptions: ["Active", "Pending", "Inactive", "Approved"],
        Cell: ({ cell }) => <StatusChip value={cell.getValue()} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        size: 220,
        Cell: ({ row }) => {
          const record = row.original;
          const PassData = {
            ...record,
            contractId: record.contractId,
            contractName: record.contractName,
            taskStatus: "Active",
            licenses: record.licenses,
            contractStatus: record.contractStatus,
          };
          const feedButtonDispflag =
            !isDisabledDatafeed &&
            (record.datasetStatus.toLowerCase() === "active" ||
              record.datasetStatus.toLowerCase() === "planned")
              ? false
              : true;
          const datasetShortNameFeeds = checkUrlSlash(record.shortName);

          const dsStatus = (PassData.datasetStatus || "").toLowerCase();
          const dsFlag = (PassData.datasetUpdateFlag || "").toLowerCase();
          const deactivateDisabled =
            isDatasetDisabled ||
            isDataSetDeactivateOrDelete?.permission !== "RW" ||
            dsStatus === "inactive" ||
            (dsFlag === "n" && dsStatus === "pending");
          const docsDisabled =
            (isAddDatasetDoc && isAddDatasetDoc.permission !== "RW") ||
            !isAddDatasetDoc ||
            (dsFlag === "n" && dsStatus === "pending");

          const datasetShortName = checkUrlSlash(record.licenseName);

          const menuItems = [
            {
              key: "view",
              icon: <VisibilityIcon fontSize="small" />,
              label: "View",
              to: {
                pathname: `/masterData/${datasetShortName}/dataset`,
                state: { isView: true, licence: record },
              },
              onClick: () => dispatch(datasetInfo(record)),
            },
            {
              key: "edit",
              icon: <EditIcon fontSize="small" />,
              label: "Edit",
              to: `/masterData/${datasetShortName}/dataset`,
              onClick: () => dispatch(datasetInfo(record)),
            },
            {
              key: "deactivate",
              icon: <RemoveCircleIcon fontSize="small" />,
              label: "Deactivate",
              danger: true,
              disabled: deactivateDisabled,
              onClick: () =>
                (PassData.datasetStatus.toLowerCase() === "active" ||
                  PassData.datasetStatus.toLowerCase() === "pending") &&
                dsFlag === "y"
                  ? warningPending()
                  : handleDatasetDeactivate(PassData),
            },
            {
              key: "documents",
              icon: <FormIcon fontSize="small" />,
              label: "Documents",
              to: `/masterData/${PassData.datasetId}/addDocuments`,
              disabled: docsDisabled,
            },
          ];

          return (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center" }}
              className="row-actions"
            >
              <Button
                component={Link}
                variant="text"
                size="small"
                to={{
                  pathname: `/masterData/${datasetShortNameFeeds}/datafeed`,
                  state: { isUpdate: false, dataset: record },
                }}
                disabled={feedButtonDispflag}
                onClick={feedButtonDispflag ? (e) => e.preventDefault() : undefined}
              >
                Add Feeds
              </Button>
              <ActionsMenu items={menuItems} />
            </Stack>
          );
        },
      },
    ],
    [
      isDisabledDatafeed,
      isDatasetDisabled,
      isAddDatasetDoc,
      isDataSetDeactivateOrDelete,
    ]
  );

  return (
    <Box id="main">
      <Box className="dashboard-table">
        <DataTable
          columns={columns}
          data={datasetDisp}
          rowKey="key"
          initialState={{
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          enableExpanding
          renderDetailPanel={({ row }) => renderDataFeeds(row.original)}
          layoutMode="semantic"
          muiTableProps={{ sx: { tableLayout: "auto", width: "100%" } }}
          muiDetailPanelProps={{ sx: { p: 0, border: 0 } }}
        />
      </Box>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  contracts: state.contract.data,
  licenses: state.license.data[0],
  datasets: state.datasetsInfo,
});

export default connect(mapStateToProps)(memo(DataSetData));
