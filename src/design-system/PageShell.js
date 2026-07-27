import React from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

/*
  PageShell — shared header card with title, subtitle, optional avatar, back
  button, breadcrumb, tags, extra actions, and arbitrary children/footer content.
  Same public API as the legacy antd version.
*/

const renderBreadcrumb = (breadcrumb) => {
  if (!breadcrumb) return null;
  if (React.isValidElement(breadcrumb)) return breadcrumb;
  if (typeof breadcrumb === "object" && Array.isArray(breadcrumb.routes)) {
    const { routes, itemRender } = breadcrumb;
    return (
      <Box
        component="nav"
        aria-label="Breadcrumb"
        sx={{
          fontSize: 13,
          color: "text.secondary",
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
        }}
      >
        {routes.map((route, idx) => {
          const isLast = idx === routes.length - 1;
          const content = itemRender
            ? itemRender(route, null, routes, [])
            : route.breadcrumbName || route.title || route.path;
          return (
            <Box
              key={route.path || idx}
              component="span"
              sx={{ display: "inline-flex", gap: 0.5 }}
            >
              <Box
                component="span"
                sx={{ color: isLast ? "text.primary" : "inherit" }}
              >
                {content}
              </Box>
              {!isLast && <Box component="span" sx={{ opacity: 0.5 }}>/</Box>}
            </Box>
          );
        })}
      </Box>
    );
  }
  return null;
};

const PageShell = ({
  title,
  subTitle,
  extra,
  onBack,
  breadcrumb,
  footer,
  ghost = true,
  className,
  style,
  children,
  tags,
  avatar,
}) => {
  const wrapperSx = {
    width: "100%",
    borderBottom: "1px solid var(--color-border-secondary)",
    ...(ghost
      ? { background: "transparent" }
      : {
          background: "var(--color-bg)",
          boxShadow: "var(--shadow-sm)",
          borderRadius: "var(--radius-lg)",
        }),
  };

  const crumb = renderBreadcrumb(breadcrumb);

  return (
    <Box
      className={["ds-page-shell", className].filter(Boolean).join(" ")}
      sx={wrapperSx}
      style={style}
    >
      <Box
        sx={{
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {crumb}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "var(--space-3)",
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            {onBack && (
              <IconButton
                aria-label="Back"
                onClick={onBack}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            {avatar && avatar.src && <Avatar {...avatar} />}
            <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              {title != null && (
                <Typography
                  component="h1"
                  sx={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "text.primary",
                    lineHeight: 1.25,
                    m: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </Typography>
              )}
              {subTitle != null && (
                <Box sx={{ fontSize: 14, color: "text.secondary", mt: "2px" }}>
                  {subTitle}
                </Box>
              )}
            </Box>
            {tags && (
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}
              >
                {tags}
              </Box>
            )}
          </Box>
          {extra && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              {extra}
            </Box>
          )}
        </Box>
        {children && <Box sx={{ mt: "var(--space-2)" }}>{children}</Box>}
        {footer && <Box sx={{ mt: "var(--space-2)" }}>{footer}</Box>}
      </Box>
    </Box>
  );
};

export const PageHeader = PageShell;
export default PageShell;
