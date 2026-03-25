import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  Button,
  Divider,
  Tooltip,
  Col,
  Spin,
  Result,
  Typography,
  Switch,
} from "antd";
import {
  CloseCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LoginForm from "../components/login/LoginForm";
import {
  startUserLogin,
  startUserLoginForgerock,
} from "../store/actions/loginActions";
import {
  API_FORGEROCK_URL,
  API_FORGEROCK_PROD_URL,
  BUILD_ID,
  API_MS_ENTRA_URL,
} from "../utils/Config";

import "./login.css";
import { fetchUserMatrix } from "../store/services/AuthService";
import { LOCAL_STORAGE_OBJECT_MATRIX } from "../utils/Constants";
import { CLIENT_ID, ENTRA_URL } from "../urlMappings";

const { Paragraph, Text } = Typography;

const Login = (props) => {
  const [envInfo, setEnvInfo] = useState("Local");
  const [isStage, setIsStage] = useState(false);
  const [displayErrorTemplate, setDisplayErrorTemplate] = useState(false);
  const [switchFR, setSwitchFR] = useState(false);
  const dispatch = useDispatch();

  const redirect = () => {
    props.history.push("/catalog");
  };

  const redirectToEntraLoginScreen = () => {
    let url = window.location.host;
    window.location.assign(
      `${ENTRA_URL}/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=https://${url}&response_mode=query&scope=openid+profile+offline_access&sso_nonce=AwABEgEAAAADAOz_BQD0_85qFlR47QFPg77hd0J0P545DJiVNfBTxx5LN0IegzlnzxhcPKodamMqYJmHhfiYdDUXiuD4p_-E1Cbn_vrwnm0gAA&client-request-id=e650f9b4-d135-41df-9423-9d96770fb5ad&mscrid=e650f9b4-d135-41df-9423-9d96770fb5ad`
    );
    // userLogin(); //this is only meant for local changes and it should not be committed.
  };

  function findParam(url, param) {
    var check = "" + param;
    if (url.search(check) >= 0) {
      return url.substring(url.search(check)).split("&")[0].split("=")[1];
    }
  }

  const userLogin = async () => {
    const codeVal = localStorage.getItem("code");
    const code = codeVal ? codeVal : findParam(window.location.href, "code");
    const res = await dispatch(
      startUserLoginForgerock(code, redirect, props.viewAsGuest)
    );
    if ((res && res.message) || (res && res.response && res.response.data && res.response.data.errorMsg) || (res && res.response && res.response.data && res.response.data.error) || (res && res.response && res.response.data && res.response.data.role === null)) {
      setDisplayErrorTemplate(true);
    }
    else {
      const resUserMatrix = await fetchUserMatrix(res.data.role[0]);
      if (!resUserMatrix || !resUserMatrix.data) {
        return null;
      }
      var { objectMatrix } = resUserMatrix.data;
      localStorage.setItem(
        LOCAL_STORAGE_OBJECT_MATRIX,
        JSON.stringify(objectMatrix)
      );
    }
  };

  useEffect(() => {
    const codeVal = localStorage.getItem("code");
    const code = codeVal ? codeVal : findParam(window.location.href, "code");
    if (code) {
      localStorage.setItem("code", code);
      const userLogin = async () => {
        const res = await dispatch(
          startUserLoginForgerock(code, redirect, props.viewAsGuest)
        );
        if (
          (res && res.message) ||
          (res &&
            res.response &&
            res.response.data &&
            res.response.data.errorMsg) ||
          (res &&
            res.response &&
            res.response.data &&
            res.response.data.error) ||
          (res &&
            res.response &&
            res.response.data &&
            res.response.data.role === null)
        ) {
          setDisplayErrorTemplate(true);
          localStorage.removeItem("code");
        }
      };
      userLogin();
    }
  }, []);

  useEffect(() => {
    const domain = /:\/\/([^\/]+)/
      .exec(window.location.href)[1]
      .replace("edp-", "");
    const chkStage = domain.includes("stage");
    setIsStage(chkStage);
    let subdomain = domain.split(".")[0];
    if (!subdomain.includes("localhost")) {
      setEnvInfo(subdomain);
    }
  }, []);

  const switchChange = (checked) => {
    setSwitchFR(checked);
  };

  return (
    <>
      {findParam(window.location.href, "code") &&
      displayErrorTemplate === false ? (
        <Col span={24} style={{ textAlign: "center", paddingTop: "20%" }}>
          <Spin tip="Loading..." />
        </Col>
      ) : (
        <div className="login-wrapper" id="main">
          <div className="login-container">
            <div className="logo-left">
              <span className="logo-bg"></span>
            </div>
            <div className="login-quote">
              One-stop shop for all external data feeds.
            </div>
          </div>
          <div className="login-panel">
            <div className="env-left-logo">
              {envInfo === "edp" ? null : (
                <div className="env-info">
                  <div>Test Env: {envInfo}</div>
                  <div style={{ paddingTop: "10px" }}>
                    Version No: {BUILD_ID}
                  </div>
                </div>
              )}
              <div className="logo-right"></div>
            </div>
            <div className="login-box">
              <h3 style={{ textAlign: "center" }}>
                <div>Welcome to</div> External Data Platform
              </h3>
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  className="login-form-button"
                  size="large"
                  // onClick={props.viewAsGuest}
                  onClick={() => redirectToEntraLoginScreen()}
                  id="btn-forgeRock"
                >
                  Continue to Catalogue
                </Button>
              </div>
              <Button
                type="link"
                className="btn-link need-help"
                icon={<UserOutlined />}
              >
                <Tooltip
                  title={
                    <div>
                      <p>
                        If you need help with the system or subscription, please
                        don't hesitate to
                        <a
                          href="mailto:CCIBDATA-T&I-EDP@exchange.standardchartered.com"
                          target="_blank"
                          style={{ color: "white", padding: "0 3px" }}
                        >
                          <u>contact the EDP team.</u>
                        </a>{" "}
                        <br />
                        We're here to help with any questions or concerns you
                        may have
                      </p>
                    </div>
                  }
                  placement="bottomRight"
                  overlayStyle={{ color: "#1e1e1e" }}
                  overlayInnerStyle={{ textAlign: "center", fontSize: "12px" }}
                >
                  Contact us
                </Tooltip>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;