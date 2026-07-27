import { withRouter } from "react-router-dom";
import { Box, Chip } from "@mui/material";
import { CheckCircleOutlined as CheckCircleOutlinedIcon } from "@mui/icons-material";
import logoRecord from "../../images/source_icon.svg";

import { PageHeader } from "../../design-system";

const DatasetPageHeader = (props) => {
  const { datafeedLongName, subscription } = props;
  const isSubscribed =
    subscription && subscription.subscriptionStatus.toLowerCase() === "active";

  return (
    <PageHeader
      title={
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <img
            src={logoRecord}
            alt="Source Icon"
            className="page-header-img"
            style={{ width: 28, height: 28 }}
          />
          <span>{datafeedLongName ? datafeedLongName : "-"}</span>
          {isSubscribed && (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckCircleOutlinedIcon fontSize="small" />}
              label="Subscribed"
            />
          )}
        </Box>
      }
      ghost={false}
      onBack={() => props.history.push("/catalog")}
      className="pt-0 pb-0"
    />
  );
};

export default withRouter(DatasetPageHeader);
