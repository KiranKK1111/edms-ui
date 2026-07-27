import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

import { startUserLoginForgerock } from "../store/actions/loginActions";
import { BUILD_ID } from "../utils/Config";

import "./login.css";
import { fetchUserMatrix } from "../store/services/AuthService";
import { LOCAL_STORAGE_OBJECT_MATRIX } from "../utils/Constants";
import BrandLogo from "./header/BrandLogo";
import ScbLogo from "../components/login/ScbLogo";
import { CLIENT_ID, ENTRA_URL } from "../urlMappings";

const Login = (props) => {
  const [envInfo, setEnvInfo] = useState("Local");
  const [isStage, setIsStage] = useState(false);
  const [displayErrorTemplate, setDisplayErrorTemplate] = useState(false);
  const dispatch = useDispatch();

  const redirect = () => {
    props.history.push("/catalog");
  };

  const findParam = (url, param) => {
    const check = String(param);
    if (url.search(check) >= 0) {
      return url.substring(url.search(check)).split("&")[0].split("=")[1];
    }
    return undefined;
  };

  const userLogin = async () => {
    const codeVal = localStorage.getItem("code");
    const code = codeVal ? codeVal : findParam(window.location.href, "code");
    const res = await dispatch(
      startUserLoginForgerock(code, redirect, props.viewAsGuest)
    );
    const isError =
      (res && res.message) ||
      (res && res.response && res.response.data && res.response.data.errorMsg) ||
      (res && res.response && res.response.data && res.response.data.error) ||
      (res && res.response && res.response.data && res.response.data.role === null);
    if (isError) {
      setDisplayErrorTemplate(true);
    } else {
      const resUserMatrix = await fetchUserMatrix(res.data.role[0]);
      if (!resUserMatrix || !resUserMatrix.data) return null;
      const { objectMatrix } = resUserMatrix.data;
      localStorage.setItem(
        LOCAL_STORAGE_OBJECT_MATRIX,
        JSON.stringify(objectMatrix)
      );
    }
  };

  const redirectToEntraLoginScreen = () => {
    let url = window.location.host;
    // window.location.assign(
    //   `${ENTRA_URL}/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=https://${url}&response_mode=query&scope=openid+profile+offline_access&sso_nonce=AwABEgEAAAADAOz_BQD0_85qFlR47QFPg77hd0J0P545DJiVNfBTxx5LN0IegzlnzxhcPKodamMqYJmHhfiYdDUXiuD4p_-E1Cbn_vrwnm0gAA&client-request-id=e650f9b4-d135-41df-9423-9d96770fb5ad&mscrid=e650f9b4-d135-41df-9423-9d96770fb5ad`
    // );
    userLogin();
  };

  useEffect(() => {
    const codeVal = localStorage.getItem("code");
    const code = codeVal ? codeVal : findParam(window.location.href, "code");
    if (code) {
      localStorage.setItem("code", code);
      const run = async () => {
        const res = await dispatch(
          startUserLoginForgerock(code, redirect, props.viewAsGuest)
        );
        const isError =
          (res && res.message) ||
          (res && res.response && res.response.data && res.response.data.errorMsg) ||
          (res && res.response && res.response.data && res.response.data.error) ||
          (res && res.response && res.response.data && res.response.data.role === null);
        if (isError) {
          setDisplayErrorTemplate(true);
          localStorage.removeItem("code");
        }
      };
      run();
    }
  }, []);

  useEffect(() => {
    const domain = /:\/\/([^\/]+)/
      .exec(window.location.href)[1]
      .replace("edp-", "");
    setIsStage(domain.includes("stage"));
    const subdomain = domain.split(".")[0];
    if (!subdomain.includes("localhost")) {
      setEnvInfo(subdomain);
    }
  }, []);

  if (findParam(window.location.href, "code") && displayErrorTemplate === false) {
    return (
      <Box sx={{ width: "100%", textAlign: "center", pt: "20%" }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <div className="login-wrapper" id="main">
      <div className="login-container">
        <div className="logo-left">
          <BrandLogo className="login-edp-logo logo-bg" />
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
              <div style={{ paddingTop: "10px" }}>Version No: {BUILD_ID}</div>
            </div>
          )}
          <div className="logo-right">
            <ScbLogo className="login-scb-logo" />
          </div>
        </div>
        <div className="login-box">
          <h3 style={{ textAlign: "center" }}>
            <div>Welcome to</div> External Data Platform
          </h3>
          <div style={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              className="login-form-button"
              onClick={redirectToEntraLoginScreen}
              id="btn-forgeRock"
            >
              Continue to Catalogue
            </Button>
          </div>
          <Tooltip
            placement="bottom-end"
            title={
              <Box sx={{ textAlign: "center", fontSize: 12 }}>
                If you need help with the system or subscription, please
                don&apos;t hesitate to{" "}
                <a
                  href="mailto:CCIBDATA-T&I-EDP@exchange.standardchartered.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "white", padding: "0 3px" }}
                >
                  <u>contact the EDP team.</u>
                </a>{" "}
                <br />
                We&apos;re here to help with any questions or concerns you may
                have
              </Box>
            }
          >
            <Button
              variant="text"
              className="btn-link need-help"
              startIcon={<PersonIcon fontSize="small" />}
            >
              Contact us
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Login;
