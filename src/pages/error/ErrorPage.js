import { Result, Button } from "antd";

const ErrorPage = (props) => {
  const redirectPage = () => {
    props.history.replace("/catalog");
  };
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button onClick={redirectPage} type="primary">
          Back Home
        </Button>
      }
    />
  );
};

export default ErrorPage;