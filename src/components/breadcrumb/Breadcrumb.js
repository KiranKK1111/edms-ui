import { Link } from "react-router-dom";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

const BreadcrumbComponent = ({ breadcrumb }) => {
  const items = breadcrumb || [];
  return (
    <Breadcrumbs
      className="app-breadcrumb"
      separator="/"
      aria-label="breadcrumb"
      sx={{ fontSize: 13 }}
    >
      <Link to="/catalog" style={{ display: "inline-flex", alignItems: "center", color: "inherit" }}>
        <HomeIcon fontSize="small" />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        if (item.url && !isLast) {
          return (
            <Link
              key={`${item.name}-${idx}`}
              to={item.url}
              className="truncate-text"
            >
              {item.name}
            </Link>
          );
        }
        return (
          <Typography
            key={`${item.name}-${idx}`}
            component="span"
            className="truncate-text"
            sx={{ color: isLast ? "text.primary" : "text.secondary", fontSize: 13 }}
          >
            {item.name}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbComponent;
