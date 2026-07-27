import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  ErrorOutlineOutlined as ExclamationIcon,
  HighlightOff as CloseCircleIcon,
} from "@mui/icons-material";

const RequestModal = (props) => {
  const { isModalVisible, handleOk, handleCancel, title } = props;

  const isApprove = title === "Approve Task";
  const isDelete = title && title.indexOf("Delete") !== -1;

  const titleNode = (
    <Box
      component="h3"
      sx={{
        m: 0,
        p: 0,
        fontSize: 16,
        fontWeight: 600,
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {isApprove ? (
        <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "success.main" }} />
      ) : isDelete ? (
        <ExclamationIcon sx={{ fontSize: 18, color: "warning.main" }} />
      ) : (
        <CloseCircleIcon sx={{ fontSize: 18, color: "error.main" }} />
      )}
      {title}
    </Box>
  );

  const okLabel = isApprove ? "Approve" : isDelete ? "Delete" : "Reject";

  return (
    <Dialog
      open={!!isModalVisible}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { width: "min(520px, 92vw)" } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>{titleNode}</DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleOk}
          variant="contained"
          color={isApprove ? "primary" : "error"}
        >
          {okLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestModal;
