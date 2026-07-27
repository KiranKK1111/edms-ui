import { Box, Button } from "@mui/material";

import { PageLayout } from "../../design-system";
import logoRecord from "../../images/source_icon.svg";
import RequestModal from "./RequestModal";

/*
  TaskDetailLayout — THE single, generic layout for every My Tasks detail page
  (Subscription, Entity, Agreement, Licence, Data Feed, Dataset).

  Every task-detail screen renders this one component so the chrome is
  identical everywhere: the shared PageLayout hero (breadcrumb + source-icon
  title + right-aligned Reject/Approve), a content card, and the standard
  Approve / Reject confirmation modals. Pages only supply data and the
  body content — they never rebuild the layout.

  Props:
    title            : string            shown next to the source icon
    breadcrumbName   : string            second breadcrumb crumb (after "My Tasks")
    actionsDisabled  : boolean           disables Reject + Approve
    onApprove        : () => void        called when Approve is confirmed
    onReject         : () => void        called when Reject is confirmed
    approveOpen      : boolean           Approve modal visibility
    rejectOpen       : boolean           Reject modal visibility
    onApproveClick   : () => void        opens the Approve modal
    onRejectClick    : () => void        opens the Reject modal
    onApproveCancel  : () => void        closes the Approve modal
    onRejectCancel   : () => void        closes the Reject modal
    rejectContent    : ReactNode         body of the Reject modal (reason field)
    className        : string            extra class on the PageLayout root
    children         : ReactNode         the page's detail content (inside the card)
*/
const TaskDetailLayout = ({
  title,
  breadcrumbName,
  actionsDisabled,
  onApproveClick,
  onRejectClick,
  approveOpen,
  rejectOpen,
  onApprove,
  onReject,
  onApproveCancel,
  onRejectCancel,
  rejectContent,
  className = "task-detail",
  children,
}) => {
  const breadcrumb = [
    { name: "My Tasks", url: "/myTasks" },
    { name: breadcrumbName || "-" },
  ];

  const heroTitle = (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <img src={logoRecord} alt="Source Icon" style={{ width: 28, height: 28 }} />
      <span>{title || "-"}</span>
    </Box>
  );

  const headerActions = (
    <Box className="btn-parent" sx={{ display: "inline-flex", gap: 1 }}>
      <Button
        variant="outlined"
        color="error"
        size="small"
        disabled={actionsDisabled}
        onClick={onRejectClick}
      >
        Reject
      </Button>
      <Button
        variant="contained"
        size="small"
        disabled={actionsDisabled}
        onClick={onApproveClick}
      >
        Approve
      </Button>
    </Box>
  );

  return (
    <PageLayout
      breadcrumb={breadcrumb}
      title={heroTitle}
      backTo="/myTasks"
      actions={headerActions}
      className={className}
      bounded
    >
      <Box className="page-layout-card task-detail-card">{children}</Box>

      <RequestModal
        isModalVisible={approveOpen}
        handleOk={onApprove}
        handleCancel={onApproveCancel}
        title="Approve Task"
      >
        Are you sure you want to proceed?
      </RequestModal>

      <RequestModal
        isModalVisible={rejectOpen}
        handleOk={onReject}
        handleCancel={onRejectCancel}
        title="Reject Task"
      >
        <Box component="p" sx={{ mt: 0 }}>
          This will reject the task and will notify the user who submitted the
          request. Are you sure want to proceed?.
        </Box>
        {rejectContent}
      </RequestModal>
    </PageLayout>
  );
};

export default TaskDetailLayout;
