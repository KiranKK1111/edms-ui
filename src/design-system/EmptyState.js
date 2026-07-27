import React from "react";
import { Box, Typography } from "@mui/material";
import { Inbox as InboxIcon } from "@mui/icons-material";

/*
  EmptyState — consistent empty / no-results presentation across the app.
  Same public API as the legacy antd version.
*/

const variantTone = {
  default: { color: "var(--color-text-tertiary)" },
  search: { color: "var(--color-text-tertiary)" },
  error: { color: "var(--color-error)" },
};

const EmptyState = ({
  icon,
  title = "No data",
  description,
  action,
  variant = "default",
  size = "md",
  className,
  style,
}) => {
  const padding = size === "sm" ? "var(--space-6)" : "var(--space-10)";
  const iconSize = size === "sm" ? 32 : 44;
  const tone = variantTone[variant] || variantTone.default;

  return (
    <Box
      className={["ds-empty-state", className].filter(Boolean).join(" ")}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "var(--space-2)",
        padding,
        color: "var(--color-text-secondary)",
        ...(style || {}),
      }}
      style={style}
    >
      <Box sx={{ ...tone, lineHeight: 1, display: "inline-flex" }}>
        {icon ?? <InboxIcon sx={{ fontSize: iconSize }} />}
      </Box>
      {title && (
        <Typography
          component="h4"
          sx={{ color: "text.primary", fontSize: 16, fontWeight: 600, m: 0 }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          component="p"
          sx={{ color: "text.secondary", fontSize: 14, m: 0, maxWidth: 420 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: "var(--space-3)" }}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
