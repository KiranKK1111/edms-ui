import React from "react";
import { Link } from "react-router-dom";
import { Box, Breadcrumbs, IconButton, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Home as HomeIcon } from "@mui/icons-material";
import "./PageHero.css";

/*
  PageHero — shared page header card used across Catalog, Master Data,
  Subscriptions, etc. Same public API as the legacy antd version:

    breadcrumb : Array<{ name, url? }> | null
    title      : string | ReactNode
    subtitle   : string | ReactNode
    backTo     : string | null
    badge      : { color, ... } — kept for back-compat; rendered as a colored dot
    actions    : ReactNode
    children   : ReactNode
    className  : string
*/

const renderBadge = (badge) => {
  if (!badge) return null;
  const color = badge.color || "var(--color-success)";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        ml: 0.5,
        "&::before": {
          content: '""',
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        },
      }}
    />
  );
};

const PageHero = ({
  breadcrumb,
  title,
  subtitle,
  backTo,
  badge,
  actions,
  children,
  className,
}) => {
  return (
    <div className={["page-hero", className].filter(Boolean).join(" ")}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="/"
          sx={{
            "& .MuiBreadcrumbs-ol": { flexWrap: "wrap" },
            "& .MuiBreadcrumbs-li": { display: "inline-flex", alignItems: "center" },
          }}
        >
          <Link
            to="/catalog"
            style={{ color: "inherit", display: "inline-flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ fontSize: 16 }} />
          </Link>
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            if (item.url && !isLast) {
              return (
                <Link
                  key={`${item.name}-${idx}`}
                  to={item.url}
                  className="page-hero-crumb-link"
                >
                  {item.name}
                </Link>
              );
            }
            return (
              <Typography
                key={`${item.name}-${idx}`}
                component="span"
                sx={{
                  color: isLast ? "text.primary" : "text.secondary",
                  fontSize: 13,
                }}
              >
                {item.name}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      <div className="page-hero-row">
        <div className="page-hero-text">
          <Typography
            component="h1"
            className="page-hero-title"
            sx={{
              m: 0,
              mt: "4px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {backTo && (
              <IconButton
                component={Link}
                to={backTo}
                size="small"
                aria-label="Back"
                className="page-hero-back"
                sx={{ color: "text.primary" }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <span className="page-hero-title-text">{title}</span>
            {renderBadge(badge)}
          </Typography>
          {subtitle && <div className="page-hero-subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="page-hero-actions">{actions}</div>}
      </div>
      {children && <div className="page-hero-extra">{children}</div>}
    </div>
  );
};

export default PageHero;
