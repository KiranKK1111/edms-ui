import { Box, CircularProgress } from "@mui/material";

const FullPageSpinner = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "calc(100vh - var(--header-height, 66px))",
      width: "100%",
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

export default FullPageSpinner;
