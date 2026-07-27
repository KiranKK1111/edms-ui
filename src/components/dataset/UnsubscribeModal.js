import imperativeConfirm from "../../design-system/imperativeConfirm";

export const confirm = async (unsubscribeHandler) => {
  const ok = await imperativeConfirm({
    title: "Unsubscribe from Data Feed?",
    content:
      "This will revoke your access to Metadata, Data Dictionary and Credentials information. Are you sure you want to proceed?",
    okText: "Unsubscribe",
    cancelText: "Cancel",
    okColor: "error",
  });
  if (ok && typeof unsubscribeHandler === "function") {
    unsubscribeHandler();
  }
};
