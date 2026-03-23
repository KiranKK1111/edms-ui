import { useEffect, useState } from "react";
import { useDispatch, connect } from "react-redux";
import { Form, Input, Button } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { loginValidation } from "./loginValidation";

import { startUserLogin } from "../../store/actions/loginActions";

import "./loginForm.css";
import ErrorAlert from "../error/ErrorAlert";

const LoginForm = (props) => {
  localStorage.clear();

  const [isMounted, setIsMounted] = useState(false);
  //const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, [isMounted]);

  /* ERROR VALIDATIONS */

  const [errorObj, setErrorObj] = useState({
    errorMessage: "",
    errorStatus: false,
  });

  const { errorMessage, errorStatus } = errorObj;

  const dispatch = useDispatch();

  /*ON SUBMIT FORM */
  const onFinish = (values) => {
    const validation = loginValidation(values);
    if (isMounted) {
      setErrorObj(validation);

      if (validation.errorStatus === false) {
        const redirect = () => {
          props.history.push("/catalog");
        };
        /*FETCHING FRESH TOKEN FROM DATABASE*/
        dispatch(startUserLogin(values, redirect));
      }
    }
  };
  // const onMouseDown = () => {
  //   console.log("onMouseDown");
  //   setShowPassword(true);
  // };
  // const onMouseUp = () => {
  //   console.log("onMouseUp");
  //   setShowPassword(false);
  // };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      {errorStatus && (
        <Form.Item>
          <ErrorAlert message={errorMessage} className="error-text" />
        </Form.Item>
      )}
      <Form.Item name="username">
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="PSID"
          size="large"
        />
      </Form.Item>

      <Form.Item name="password">
        <Input.Password
          type="password"
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder="Password"
          size="large"
          suffix={<EyeInvisibleOutlined className="site-form-item-icon" />}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          size="large"
          style={{
            background: "#979797",
            borderColor: "#979797",
            fontWeight: "bold",
          }}
        >
          Log in
        </Button>
      </Form.Item>
    </Form>
  );
};

function mapStateToProps(state) {
  return {
    login: state.login,
  };
}
export default connect(mapStateToProps)(LoginForm);