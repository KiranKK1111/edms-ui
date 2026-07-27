import React from "react";
import { Box, Typography } from "@mui/material";

/*
  Section — light card primitive. Same public API as the legacy antd version:
    title, extra, bordered, elevation ("none" | "low" | "high"), padding ("sm" | "md"),
    className, style, children.
*/

const elevationShadow = {
  none: "none",
  low: "var(--shadow-sm)",
  high: "var(--shadow-md)",
};

const paddingMap = {
  sm: "var(--space-4)",
  md: "var(--space-6)",
};

const Section = ({
  title,
  extra,
  bordered = true,
  elevation = "low",
  padding = "md",
  className,
  style,
  children,
}) => {
  const hasHeader = title != null || extra != null;
  return (
    <Box
      component="section"
      className={["ds-section", className].filter(Boolean).join(" ")}
      sx={{
        background: "var(--color-bg)",
        borderRadius: "var(--radius-lg)",
        border: bordered ? "1px solid var(--color-border-secondary)" : "none",
        boxShadow: elevationShadow[elevation] || elevationShadow.low,
        padding: paddingMap[padding] || paddingMap.md,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        ...(style || {}),
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          {title != null &&
            (typeof title === "string" ? (
              <Typography
                component="h3"
                sx={{ fontSize: 16, fontWeight: 600, color: "text.primary", m: 0 }}
              >
                {title}
              </Typography>
            ) : (
              title
            ))}
          {extra != null && <div>{extra}</div>}
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {children}
      </Box>
    </Box>
  );
};

export default Section;
