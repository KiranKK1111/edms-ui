import React from "react";
import { Box, Grid, Typography } from "@mui/material";

/*
  DetailView — generic read-only renderer for View mode. Driven by a
  `fields` schema ([{ label, key, type?, full? }]) and a `record` object.
  Mirrors the look of the review screens (label-review style) without any
  domain-specific code.
*/
const renderValue = (field, record) => {
  const value = record ? record[field.key] : undefined;
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "url") {
    const href = String(value).startsWith("http") ? value : `https://${value}`;
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  return value;
};

const DetailView = ({ fields = [], record = {} }) => (
  <Box id="main">
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid
          key={field.key}
          size={{ xs: 12, sm: field.full ? 12 : 6, md: field.full ? 12 : 4 }}
        >
          <Typography component="span" className="label-review">
            {field.label} :
          </Typography>{" "}
          {renderValue(field, record)}
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default DetailView;
