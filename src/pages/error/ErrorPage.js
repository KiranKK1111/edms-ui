import { Box, Button, Typography } from "@mui/material";

const ErrorPage = (props) => {
  const redirectPage = () => {
    props.history.replace("/catalog");
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        background: "var(--color-bg-layout)",
      }}
    >
      <Box
        sx={{
          background: "var(--color-bg)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--color-border-secondary)",
          padding: "var(--space-8)",
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: 64,
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.1,
            m: 0,
          }}
        >
          404
        </Typography>
        <Typography
          component="h2"
          sx={{ fontSize: 22, fontWeight: 600, mt: 1, color: "text.primary" }}
        >
          Page not found
        </Typography>
        <Typography
          component="p"
          sx={{ fontSize: 14, color: "text.secondary", mt: 1, mb: 3 }}
        >
          Sorry, the page you visited does not exist.
        </Typography>
        <Button
          onClick={redirectPage}
          variant="contained"
          size="large"
          sx={{ minHeight: 44 }}
        >
          Back Home
        </Button>
      </Box>
    </Box>
  );
};

export default ErrorPage;
