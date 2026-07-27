import { Link } from "react-router-dom";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

const DatasetBreadcrumb = (props) => {
  const { title } = props;
  const titleDisplay = title ? title : "-";

  return (
    <Box className="mt-16 ml-24 mr-24" sx={{ mt: 2, mx: 3 }}>
      <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ fontSize: 13 }}>
        <Link to="/catalog" style={{ display: "inline-flex", alignItems: "center", color: "inherit" }}>
          <HomeIcon fontSize="small" />
        </Link>
        <Link to="/catalog">Catalogue</Link>
        <Typography component="span" sx={{ color: "text.primary", fontSize: 13 }}>
          {titleDisplay}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default DatasetBreadcrumb;
