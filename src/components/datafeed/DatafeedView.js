import { Link, useLocation, useHistory } from "react-router-dom";
import { Alert, Box, Button, Chip, Grid, Tooltip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { HelpOutlineOutlined as QuestionCircleOutlined } from "@mui/icons-material";
import { getConfigById } from "../../store/actions/datafeedAction";
import { formDataFn } from "../../store/actions/DatafeedActions";
import getPermissionObject from "../../utils/accessObject";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_DATAFEED_PAGE_AND_BUTTON,
  ADD_DATA_CONFIG_PAGE_AND_BUTTON,
} from "../../utils/Constants";

const checkUrlSlash = (s) => (s && s.includes("/") ? s.replaceAll("/", "%2F") : s);

/*
  DatafeedViewEditButton — the read-only View header action. The Edit affordance
  is conditional on the feed being editable (feedUpdateFlag === "n") and on the
  user's data-feed permission. Rendered by the generic controller as the View
  screen's headerActions for the datafeed descriptor.
*/
export const DatafeedViewEditButton = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const st = (location && location.state) || {};
  const record = st.datafeedRecord;
  const row = st.dataset || {};

  const datafeedPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_DATAFEED_PAGE_AND_BUTTON
  );

  const feedUpdateLink = checkUrlSlash(row.shortName || "");
  const editAllowed =
    record &&
    record.feedUpdateFlag &&
    record.feedUpdateFlag.toLowerCase() === "n";

  const editTo = editAllowed
    ? {
        pathname: `/masterData/${feedUpdateLink}/datafeed`,
        state: { dataset: row, isUpdate: true, datafeedRecord: record },
      }
    : "#";

  return (
    <Button
      component={Link}
      to={editTo}
      onClick={() => {
        if (editAllowed) dispatch(formDataFn(record));
      }}
      variant="contained"
      disabled={datafeedPages && datafeedPages.permission !== "RW"}
    >
      Edit
    </Button>
  );
};

/*
  DatafeedView — the read-only General Details body for a data feed. Reads the
  feed from state.datafeedInfo.formData (pre-populated by the master-data list
  navigation), plus the dataset/record from location.state. Rendered inside the
  generic <RecordFormPage> chrome as the datafeed descriptor's ViewBody.
*/
const DatafeedView = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.datafeedInfo.formData);
  const st = (location && location.state) || {};
  const record = st.datafeedRecord || {};
  const row = st.dataset;

  const addDataConfigPagesAndButton = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    ADD_DATA_CONFIG_PAGE_AND_BUTTON
  );

  const showPendingAlert =
    data &&
    data.feedStatus &&
    data.feedId &&
    data.feedStatus.toLowerCase() === "pending";

  const configDisabled =
    !addDataConfigPagesAndButton ||
    (record.feedUpdateFlag &&
      record.feedUpdateFlag.toString().toLowerCase() === "n" &&
      record.feedStatus &&
      record.feedStatus.toLowerCase() === "pending");

  return (
    <>
      {showPendingAlert && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">
            This Data Feed is currently under review. You will be able to
            subscribe once the Data Feed is approved and the status is “Active”.
          </Alert>
        </Box>
      )}
      <Box sx={{ background: "var(--color-bg)", minHeight: 300 }}>
        <Grid container>
          <Grid size={12}>
            <div style={{ marginLeft: "1rem" }}>
              <strong style={{ fontSize: "1.4rem" }}>General Details</strong>
            </div>
          </Grid>
          <Grid size={4}>
            <div style={{ marginLeft: "1rem" }}>
              <p>
                <strong>Data Feed ID :</strong> {data.feedId ? data.feedId : "-"}
              </p>
              <p>
                <strong>
                  Dataset short name{" "}
                  <Tooltip title="The dataset that this feed is under.">
                    <span style={{ color: "var(--color-primary)" }}>
                      <QuestionCircleOutlined fontSize="inherit" />
                    </span>
                  </Tooltip>
                  :
                </strong>{" "}
                {row ? row.shortName : "-"}
              </p>
              <p>
                <span style={{ fontFamily: "inherit", fontWeight: "bold" }}>
                  Long name :
                </span>{" "}
                {data.longName ? data.longName : "-"}
              </p>
              <p>
                <span style={{ fontFamily: "inherit", fontWeight: "bold" }}>
                  Short name :
                </span>{" "}
                {data.shortName ? data.shortName : "-"}
              </p>
            </div>
          </Grid>
          <Grid size={4}>
            <div style={{ marginLeft: "1rem" }}>
              <p>
                <strong> Status : </strong>
                {data.feedStatus ? (
                  data.feedStatus === "Active" ? (
                    <Chip
                      className="style-badge"
                      sx={{ ml: "10px" }}
                      size="small"
                      color="success"
                      variant="outlined"
                      label="Active"
                    />
                  ) : (
                    <Chip
                      className="style-badge"
                      sx={{ ml: "10px" }}
                      size="small"
                      color="error"
                      variant="outlined"
                      label={data.feedStatus}
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
                  Contains personal data{" "}
                  <Tooltip title="The type of personal data this feed contains.">
                    <span style={{ color: "var(--color-primary)" }}>
                      <QuestionCircleOutlined fontSize="inherit" />
                    </span>
                  </Tooltip>
                  :
                </strong>{" "}
                {data.personalData ? data.personalData : "-"}
              </p>
            </div>
          </Grid>
          <Grid size={4}>
            <div style={{ marginLeft: "1rem" }}>
              <Link
                to={`/masterData/${data.feedId}/addConfiguration`}
                onClick={() => {
                  if (configDisabled) return;
                  dispatch(getConfigById(data.feedId));
                  sessionStorage.setItem("feedShortName", row ? row.shortName : "");
                  sessionStorage.setItem("feedStatus", record.feedStatus);
                }}
              >
                <strong style={{ fontSize: "1rem" }}>
                  Data Feed configuration
                </strong>
              </Link>
            </div>
          </Grid>
          <Grid size={12}>
            <div style={{ marginLeft: "1rem" }}>
              <p>
                <span style={{ fontFamily: "inherit", fontWeight: "bold" }}>
                  Description :
                </span>{" "}
                {data.feedDescription ? data.feedDescription : "NA"}
              </p>
            </div>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DatafeedView;
