import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, withRouter } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  HelpOutlined as QuestionCircleIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
} from "@mui/icons-material";
import cronstrue from "cronstrue";
import dayjs from "dayjs";

import { DataTable, SideNav } from "../../design-system";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN,
} from "../../utils/Constants";
import { getDatasetMetadataInfo } from "../../store/actions/DatasetPageActions";

const StatusChip = ({ status, text }) => {
  if (!status) return <span>NA</span>;
  const color = status === "success" ? "success" : status === "warning" ? "warning" : "error";
  return <Chip size="small" color={color} variant="outlined" label={text} />;
};

const ConfigChip = ({ enabled }) => {
  const color = enabled ? "success" : "error";
  return (
    <Chip
      size="small"
      color={color}
      variant="outlined"
      label={enabled ? "Active" : "Inactive"}
    />
  );
};

const InfoRow = ({ label, tooltipTxt, children }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1.5,
      py: 0.75,
      borderBottom: "1px dashed var(--color-border-secondary)",
      "&:last-of-type": { borderBottom: 0 },
      alignItems: "flex-start",
    }}
  >
    <Box
      sx={{
        minWidth: 160,
        fontSize: 13,
        fontWeight: 600,
        color: "text.secondary",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {label}
      {tooltipTxt && (
        <Tooltip title={tooltipTxt}>
          <QuestionCircleIcon sx={{ fontSize: 14, color: "primary.main" }} />
        </Tooltip>
      )}
    </Box>
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        color: "text.primary",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      {children}
    </Box>
  </Box>
);

const Overview = (props) => {
  const [content, setContent] = useState("1");
  const [relatedFeedsList, setRelatedFeedsList] = useState([]);
  const datafeedInfo = useSelector((state) => state.datafeedInfo.datafeedById);
  const metadataInfo = useSelector((state) => state.datafeedInfo.metadata.data);
  const datasetInfo = useSelector((state) => state.dataFamily.datasetById);
  const licenseInfo = useSelector((state) => state.license.licenseById);
  const catalogueList = useSelector((state) => state.catalogueList.catalogueList);
  const dispatch = useDispatch();
  const location = useLocation();

  const emptyDataFeedObj = {
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
    feedDescription: datafeedDescription,
    dataConfidentiality: datafeeddataConfidentiality,
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
    datasetDescription,
    datasetStatus,
  } = datasetInfo;
  useEffect(() => {
    if (datasetId && catalogueList) {
      const relatedDatafeedList = catalogueList.filter(
        (u) => u.datasetId === datasetId && u.dataFeedId !== datafeedId
      );
      setRelatedFeedsList(relatedDatafeedList);
    } else {
      setRelatedFeedsList([]);
    }
  }, [datasetId]);

  const { licenseShortName } = licenseInfo ? licenseInfo : {};

  const getValues = useCallback(({ key }) => {
    setContent(key);
  }, []);

  const overviewMenuItems = useMemo(
    () => [
      { key: "1", label: "Data Feed details" },
      {
        key: "2",
        label: "Dataset details",
        children: [
          { key: "21", label: "Dataset details" },
          { key: "22", label: "Related Data Feeds" },
        ],
      },
    ],
    []
  );

  const getcronExpression = (cronExp) => {
    if (
      cronExp &&
      cronExp !== "null" &&
      cronExp !== "NA" &&
      cronExp.toLowerCase() !== "notused" &&
      cronExp.toLowerCase() !== "not used"
    ) {
      const dateTime = cronstrue.toString(cronExp, { use24HourTimeFormat: true });
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
      return "NA";
    }
    return "NA";
  };

  const getScheduledTime = (cronExp) => {
    const intermediateString = getcronExpression(cronExp);
    let result =
      intermediateString !== "NA"
        ? intermediateString.substr(0, intermediateString.indexOf(","))
        : "NA";
    if (!intermediateString.includes(",")) result = intermediateString;
    return result;
  };

  const getFrequency = (cronExp) => {
    const intermediateString = getcronExpression(cronExp);
    let result = "NA";
    if (intermediateString.toLowerCase().includes("every")) {
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
    if (!status) return undefined;
    const s = status.toString().toLowerCase();
    if (s === "active") return "success";
    if (s === "pending") return "warning";
    if (s === "expired") return "error";
    return undefined;
  };

  const setstatus = getStatus(datasetStatus);

  const handler1 = (text) => {
    const feed = relatedFeedsList.filter((item) => item.dataFeedLongName === text);
    props.history.push({
      pathname: "/catalog/details",
      state: { data: feed[0] },
    });
  };

  const redirect = () => {
    props.history.push({
      pathname: "/catalog/subscription",
      state: { data: location.state.data },
    });
  };

  const getFileFormat = (val) => {
    if (val.includes("FundamentalsRoute") || val.includes("XpathSplitValidateRoute")) return "xml";
    if (val.includes("JSONSplitValidateRoute") || val.includes("JSONLValidateRoute")) return "json";
    if (val.includes("CSVInitialRoute")) return "csv";
    return "NA";
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "dataFeedLongName",
        header: "Name",
        size: 250,
        Cell: ({ cell }) => (
          <Button variant="text" size="small" onClick={() => handler1(cell.getValue())}>
            {cell.getValue()}
          </Button>
        ),
      },
      { accessorKey: "entityShortName", header: "Data Source", size: 150 },
      { accessorKey: "datasetShortName", header: "Dataset", size: 200 },
      { accessorKey: "dataFeedDescription", header: "Description" },
      {
        accessorKey: "subscription",
        header: "Subscription",
        size: 160,
        enableSorting: false,
        Cell: ({ cell }) => {
          const text = cell.getValue();
          const guestRole = localStorage.getItem("guestRole");
          if (text && text.subscriptionStatus.toLowerCase() !== "inactive") {
            const status = getStatus(text.subscriptionStatus);
            return (
              <Chip
                size="small"
                color={status || "default"}
                variant="outlined"
                icon={<CheckCircleOutlinedIcon fontSize="small" />}
                label={
                  text.subscriptionStatus.toLowerCase() === "active"
                    ? "Subscribed"
                    : text.subscriptionStatus
                }
              />
            );
          }
          return (
            <Button
              variant="text"
              size="small"
              disabled={
                !!guestRole ||
                isButtonObject(
                  CATELOG_MANAGEMENT_PAGE,
                  CATELOG_MANAGEMENT_REQUESTACCESS_UNSUB_MODIFY_EDIT_BTN
                )
              }
              onClick={redirect}
            >
              Request Access
            </Button>
          );
        },
      },
    ],
    [relatedFeedsList]
  );

  const getSourceProtocol = () => {
    if (!metadataInfo || !metadataInfo.sourceProcessor) return "NA";
    return metadataInfo.sourceProcessor === "sftpProcessor" ? "SFTP" : "HTTPS";
  };
  const getDataFormat = () => {
    if (!metadataInfo || !metadataInfo.splittingCanonicalClass) return "NA";
    return getFileFormat(metadataInfo.splittingCanonicalClass);
  };
  const getStartDate = () => {
    if (!metadataInfo || !metadataInfo.start) return "NA";
    return dayjs(metadataInfo.start).format("DD MMM YYYY");
  };
  const getCronDisplay = (displayFn) => {
    if (!metadataInfo || !metadataInfo.cronExpression) return "NA";
    if (metadataInfo.cronExpression === "livestreaming") return "livestreaming";
    return displayFn(metadataInfo.cronExpression);
  };
  const getConfigStatusDisplay = () => {
    if (
      !metadataInfo ||
      Object.keys(metadataInfo).length === 0 ||
      metadataInfo.isEnabled === undefined
    ) {
      return "NA";
    }
    return <ConfigChip enabled={metadataInfo.isEnabled} />;
  };

  let contentLayout = "Loading...";

  if (content === "1") {
    contentLayout = (
      <Box className="overview-content" sx={{ flex: 1, p: 3 }}>
        <Typography component="h3" className="content-header" sx={{ pb: 2, fontWeight: 600, fontSize: 16 }}>
          Data Feed details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Data Feed ID">{datafeedId || "NA"}</InfoRow>
            <InfoRow label="Dataset" tooltipTxt="The dataset that this data feed is under.">
              {datasetShortName || "NA"}
            </InfoRow>
            <InfoRow label="Short name">{datafeedShortName || "NA"}</InfoRow>
            <InfoRow label="Long name">{datafeedLongName || "NA"}</InfoRow>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Data confidentiality">{datafeeddataConfidentiality || "NA"}</InfoRow>
            <InfoRow label="Personal data type" tooltipTxt="The type of personal data this feed contains.">
              {datafeedPersonalData || "NA"}
            </InfoRow>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Configuration status">{getConfigStatusDisplay()}</InfoRow>
            <InfoRow label="Source protocol">{getSourceProtocol()}</InfoRow>
            <InfoRow label="Data format">{getDataFormat()}</InfoRow>
            <InfoRow label="Start date">{getStartDate()}</InfoRow>
            <InfoRow label="Scheduled data update GMT">{getCronDisplay(getScheduledTime)}</InfoRow>
            <InfoRow label="Frequency">{getCronDisplay(getFrequency)}</InfoRow>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <InfoRow label="Description">{datafeedDescription || "NA"}</InfoRow>
        </Box>
      </Box>
    );
  }

  if (content === "21" || content === "22") {
    contentLayout = (
      <Box className="overview-content" sx={{ flex: 1, p: 3 }}>
        <Typography component="h3" className="content-header" sx={{ pb: 2, fontWeight: 600, fontSize: 16 }}>
          Dataset details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Dataset ID">{datasetId || "NA"}</InfoRow>
            <InfoRow label="Long Name">{datasetLongName || "NA"}</InfoRow>
            <InfoRow label="Short Name">{datasetShortName || "NA"}</InfoRow>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Description">{datasetDescription || "NA"}</InfoRow>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoRow label="Status">
              {setstatus ? <StatusChip status={setstatus} text={datasetStatus} /> : "NA"}
            </InfoRow>
            <InfoRow label="Licence Short Name" tooltipTxt="The licence that this dataset is under">
              {licenseShortName || "NA"}
            </InfoRow>
          </Grid>
        </Grid>
        {content === "22" && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box className="overview-content">
              <Typography component="h3" className="content-header" sx={{ pb: 2, fontWeight: 600, fontSize: 16 }}>
                Related Data Feeds
              </Typography>
              <DataTable
                columns={columns}
                data={relatedFeedsList}
                rowKey={(record) => record.dataFeedId || record.id}
                pagination={false}
                layoutMode="semantic"
                enableColumnResizing={false}
                muiTableProps={{ sx: { tableLayout: "auto", width: "100%" } }}
                muiTablePaperProps={{ sx: { width: "100%" } }}
              />
            </Box>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box className="content-wrapper" id="main">
      <Typography component="h3" className="content-header" sx={{ fontWeight: 700, fontSize: 18 }}>
        Overview
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box
        className="site-layout-background overview-layout"
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "stretch",
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Box
          className="overview-sidenav"
          sx={{
            width: { xs: "100%", md: 230 },
            flex: { xs: "1 1 100%", md: "0 0 230px" },
          }}
        >
          <SideNav
            defaultSelectedKey="1"
            items={overviewMenuItems}
            onSelect={getValues}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {contentLayout}
        </Box>
      </Box>
    </Box>
  );
};

export default withRouter(Overview);
