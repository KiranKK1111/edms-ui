import { Alert } from "antd";

const ErrorAlert = (props) => {
  const { message } = props;

  return <Alert message={message} type="error" showIcon />;
};

export default ErrorAlert;