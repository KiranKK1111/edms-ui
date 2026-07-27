import React, { memo } from "react";
import { Alert } from "@mui/material";

const ErrorAlert = ({ message, className, ...rest }) => (
  <Alert
    severity="error"
    className={className}
    sx={{ borderRadius: "var(--radius-md)" }}
    {...rest}
  >
    {message}
  </Alert>
);

export default memo(ErrorAlert);
