import { Button, Modal } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined , ExclamationCircleOutlined} from "@ant-design/icons";

const RequestModal = (props) => {
  const { isModalVisible, handleOk, handleCancel, title } = props;

  const title1 = (
    <h3
      style={{
        padding: 0,
        margin: 0,
        fontSize: "16px",
        color: "#0F1217",
        fontWeight: "600",
      }}
    > 
      {title === "Approve Task" ? (
        <CheckCircleOutlined
        style={{ fontSize: "18px", color: "green", marginRight: "10px" }}
      />
       
      ) : title.indexOf('Delete') !== -1  ? 
      (<ExclamationCircleOutlined style={{ fontSize: "18px", color: "#faad14", marginRight: "10px"}} />)
       : (
        <CloseCircleOutlined
        style={{ fontSize: "18px", color: "red", marginRight: "10px" }}
      />
        )}
      {title}
    </h3>
  );

  return (
    <Modal
      visible={isModalVisible}
      title={title1}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          danger={title !== "Approve Task"}
          type={title !== "Approve Task" ? "default" : "primary"}
          onClick={handleOk}
        >
          {title === "Approve Task" ? "Approve" : title.indexOf('Delete') !== -1 ? "Delete" : "Reject"}
        </Button>,
      ]}
    >
      {props.children}
    </Modal>
  );
};

export default RequestModal;