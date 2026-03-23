import React, { useState } from "react";
import { connect } from "react-redux";
import { Dropdown, Layout, Menu, Avatar } from "antd";
import {
  BellFilled,
  DownOutlined,
  UserOutlined,
  QuestionCircleFilled,
  LogoutOutlined,
  SettingFilled,
  LoginOutlined,
} from "@ant-design/icons";
import { NavLink, Link } from "react-router-dom";
import "./header.css";
import "antd/dist/antd.css";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  MY_TASK_PAGE,
  MAIN_PAGE,
  USER_MANAGEMENT_PAGE,
  SUBSCRIPTION_PAGE,
  SUBSCRIPTION_MAIN_PAGE,
} from "../../utils/Constants";
import getPermissionObject from "../../utils/accessObject";
import { ENTRA_URL } from "../../urlMappings";

const { Header } = Layout;

export const deleteCookies = (cookie, hostname) => {
  cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, (name) =>
      hostname
          .split(".")
          .reverse()
          .reduce(
              (domain) => {
                  domain = domain.replace(/^\.?[^.]+/, "");
                  document.cookie = `${name}=;max-age=0;path=/;domain=${domain}`;
                  return domain;
              },
              hostname
          )
  );
};

export const deleteAllCookiesAndSiteData = () => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }
  localStorage.clear();
  sessionStorage.clear();
};

function Headers() {
  const [showItem, setShowItem] = useState(true);
  const loggedInUserId = localStorage.getItem("psid");
  const loggedInTitle = localStorage.getItem("entitlementType");

  const redirectToEntraLogoutScreen = () => {
    const url = window.location.host;
    const logoutUrl = `${ENTRA_URL}/logout?post_logout_redirect_uri=https://${url}/&client_id=1aabad22-8830-401f-9480-42967d62ca9b`;
  
    deleteAllCookiesAndSiteData();
    window.location.assign(logoutUrl);
  };

  const guestRole = localStorage.getItem("guestRole");

  let USER_MENU;

  if (guestRole) {
    USER_MENU = (
      <Menu className="header-notification-menu">
        <Menu.Item key="1" className="header-menu-item-1">
          <h4>
            <b>Guest</b>
          </h4>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item key="3" className="header-menu-item-2">
          <QuestionCircleFilled
            className="icon-style"
            style={{ fontSize: "18px" }}
          />{" "}
          Help Center{" "}
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item key="4" className="header-menu-item-2">
          <span role="button" style={{ cursor: "pointer" }} onClick={() => redirectToEntraLogoutScreen()}>
            <LoginOutlined
              className="icon-style"
              style={{ fontSize: "18px" }}
            />
            Login
          </span>
        </Menu.Item>
      </Menu>
    );
  } else {
    USER_MENU = (
      <Menu className="header-notification-menu">
        <Menu.Item key="1" className="header-menu-item-1">
          <Link to={`/userProfile/${loggedInUserId}`}>
            PSID : {loggedInUserId}
            <h4>
              <b>{loggedInTitle}</b>
            </h4>
          </Link>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item key="2" className="header-menu-item-2">
          <Link to={`/userProfile/${loggedInUserId}`}>
            {" "}
            <SettingFilled
              className="icon-style"
              style={{ fontSize: "18px" }}
            />{" "}
            Settings{" "}
          </Link>{" "}
        </Menu.Item>

        <Menu.Item key="3" className="header-menu-item-2">
          <QuestionCircleFilled
            className="icon-style"
            style={{ fontSize: "18px" }}
          />{" "}
          Help Center{" "}
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item key="4" className="header-menu-item-2">
          <span role="button" style={{ cursor: "pointer" }} onClick={() => redirectToEntraLogoutScreen()}>
            <LogoutOutlined
              className="icon-style"
              style={{ fontSize: "18px" }}
            />{" "}
            Log out{" "}
          </span>
        </Menu.Item>
      </Menu>
    );
  }

  let loginedRold = localStorage.getItem("entitlementType");
  loginedRold = loginedRold ? loginedRold : localStorage.getItem("guestRole");
  useState(() => {
    if (
      (loginedRold &&
        loginedRold.toString().toLocaleLowerCase() === "subscriber") ||
      (loginedRold && loginedRold.toString().toLocaleLowerCase() === "guest")
    ) {
      setShowItem(false);
    }
  }, []);

  const myTaskPages = getPermissionObject(MY_TASK_PAGE, MAIN_PAGE);
  const userManagementPages = getPermissionObject(
    USER_MANAGEMENT_PAGE,
    MAIN_PAGE
  );

  const masterDataPages = getPermissionObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MAIN_PAGE
  );

  const subscriptionManagementPages = getPermissionObject(
    SUBSCRIPTION_PAGE,
    SUBSCRIPTION_MAIN_PAGE
  );

  return (
    <Layout>
      <Header className="Main-header">
        <div className="logo" id="corp-logo">
          <img src="/images/EDP_logo_whiteText.svg" alt="logo" />
        </div>
        <Menu className="header-bar" theme="dark" mode="horizontal" style={{ display: "block" }}>
          <Menu.Item key="1">
            <NavLink to="/catalog" activeClassName="page-selected">
              Catalogue
            </NavLink>
          </Menu.Item>

          {showItem &&
            masterDataPages &&
            (masterDataPages.permission === "RW" ||
              masterDataPages.permission === "R") ? (
            <Menu.Item key="2">
              <NavLink to="/masterData" activeClassName="page-selected">
                Master Data
              </NavLink>
            </Menu.Item>
          ) : (
            <Menu.Item key="2"></Menu.Item>
          )}

          {showItem &&
            myTaskPages &&
            (myTaskPages.permission === "RW" ||
              myTaskPages.permission === "R") ? (
            <Menu.Item key="3">
              <NavLink to="/myTasks" activeClassName="page-selected">
                My Tasks
              </NavLink>
            </Menu.Item>
          ) : null}
          {/*showItem &&
          userManagementPages &&
          (userManagementPages.permission === "RW" ||
            userManagementPages.permission === "R") ? (
            <Menu.Item key="4">
              <NavLink to="/userManagement" activeClassName="page-selected">
                User Management
              </NavLink>
            </Menu.Item>
            ) : null*/}

          {showItem &&
            subscriptionManagementPages &&
            (subscriptionManagementPages.permission === "R" ||
              subscriptionManagementPages.permission === "RW") ? (
            <Menu.Item key="4">
              <NavLink
                to="/subscriptionManagement"
                activeClassName="page-selected"
              >
                Subscriptions
              </NavLink>
            </Menu.Item>
          ) : null}

          {/* Right side Menu Items */}

          <Menu.Item
            key="5"
            className="right-item-1"
            style={{ padding: "0 -1px" }}
          >
            <Avatar
              style={{ backgroundColor: "#87d068", padding: "0px" }}
              icon={<UserOutlined />}
            />
            <Dropdown overlay={USER_MENU}>
              <a
                href="/#"
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                &nbsp; <DownOutlined />
              </a>
            </Dropdown>
          </Menu.Item>

          {!guestRole ? (
            <Menu.Item
              key="6"
              className="right-item-2"
              style={{ padding: "0px" }}
              icon={
                <BellFilled
                  className="notification-bell"
                  style={{ fontSize: "21px", color: "#FFFFFF" }}
                />
              }
            />
          ) : null}
        </Menu>
      </Header>
    </Layout>
  );
}

function mapStateToProps(state) {
  return {
    login: state.login,
    userProfile: state.userProfile.data,
  };
}
export default connect(mapStateToProps)(Headers);