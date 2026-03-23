import { Modal } from "antd";

export const confirm = (unsubscribeHandler) => {
  Modal.confirm({
    title: "Unsubscribe from Data Feed?",
    content:
      "This will revoke your access to Metadata, Data Dictionary and Credentials information. Are you sure you want to proceed?",
    iconType: "close-circle",
    okText: "Unsubscribe",
    cancelText: "Cancel",
    okButtonProps: {
      type: "primary",
      danger: true,
    },
    cancelButtonProps: {
      type: "default",
    },
    onOk() {
      unsubscribeHandler();
    },
    onCancel() {},
  });
};