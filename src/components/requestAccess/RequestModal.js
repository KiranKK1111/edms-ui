import imperativeConfirm from "../../design-system/imperativeConfirm";

export const confirm = async (rejectHandler) => {
  const ok = await imperativeConfirm({
    title: "Reject Request?",
    content:
      "This will prevent the requestor from using this licence. Are you sure you want to proceed?",
    okText: "Reject",
    cancelText: "Cancel",
    okColor: "error",
  });
  if (ok && typeof rejectHandler === "function") {
    rejectHandler();
  }
};

export const confirm1 = async (approveHandler) => {
  const ok = await imperativeConfirm({
    title: "Approve Request?",
    content:
      "This will grant requestor access to the licence and its details. Are you sure you want to proceed?",
    okText: "Approve",
    cancelText: "Cancel",
    okColor: "primary",
  });
  if (ok && typeof approveHandler === "function") {
    approveHandler();
  }
};
