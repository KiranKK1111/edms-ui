import { Modal } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

export const confirm = (rejectHandler) => {
  Modal.confirm({
    title: "Reject Request?",
    content:
      "This will prevent the requestor from using this licence. Are you sure you want to proceed?",
    icon: <CloseCircleOutlined style={{ color: "red" }} />,
    okText: "Reject",
    cancelText: "Cancel",
    width: "450px",
    okButtonProps: {
      type: "default",
      danger: true,
    },
    cancelButtonProps: {
      type: "default",
    },
    onOk() {
      rejectHandler();
    },
    onCancel() {},
  });
};

export const confirm1 = (approveHandler) => {
  Modal.confirm({
    title: "Approve Request?",
    content:
      "This will gran requestor access to the licence and its details. Are you sure you want to proceed?",
    icon: <CheckCircleOutlined style={{ color: "green" }} />,
    okText: "Approve",
    cancelText: "Cancel",
    width: "450px",
    okButtonProps: {
      type: "primary",
    },
    cancelButtonProps: {
      type: "default",
    },
    onOk() {
      approveHandler();
    },
    onCancel() {},
  });
};