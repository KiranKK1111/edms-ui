import React from "react";
import { Alert, AlertTitle } from "@mui/material";

/*
  NoDataAlert — a consistent, visible "information not available" prompt used by
  the My Tasks detail views (and anywhere a record fails to load / is empty).
  Renders an MUI Alert so it reads clearly as a warning rather than silently
  showing blank / NA / NaN fields.

  Props:
    title    : bold heading (default "Information not available")
    message  : descriptive line
    severity : MUI Alert severity ("warning" | "info" | "error") — default "warning"
    sx       : style overrides merged onto the Alert
*/
const NoDataAlert = ({
  title = "Information not available",
  message = "The details for this item could not be found or have not been provided.",
  severity = "warning",
  sx,
}) => (
  <Alert severity={severity} sx={{ my: 2, ...sx }}>
    {title && <AlertTitle>{title}</AlertTitle>}
    {message}
  </Alert>
);

export default NoDataAlert;
