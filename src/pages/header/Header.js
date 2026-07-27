import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { connect } from "react-redux";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Person as PersonIcon,
  HelpOutlined as HelpIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { NavLink, Link, useHistory, useLocation } from "react-router-dom";

import "./header.css";
import { useThemeMode, THEME_STORAGE_KEY } from "../../design-system";
import BrandLogo from "./BrandLogo";
import { getNavPages } from "../../config/pageConfig";
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

export const deleteCookies = (cookie, hostname) => {
  cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, (name) =>
    hostname
      .split(".")
      .reverse()
      .reduce((domain) => {
        domain = domain.replace(/^\.?[^.]+/, "");
        document.cookie = `${name}=;max-age=0;path=/;domain=${domain}`;
        return domain;
      }, hostname)
  );
};

export const deleteAllCookiesAndSiteData = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }
  // Preserve the user's theme preference across logout so the landing page
  // keeps the chosen light/dark mode after the storage is cleared.
  const themePref = localStorage.getItem(THEME_STORAGE_KEY);
  localStorage.clear();
  sessionStorage.clear();
  if (themePref) {
    localStorage.setItem(THEME_STORAGE_KEY, themePref);
  }
};

function Headers() {
  const [showItem, setShowItem] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { isDark, toggleMode } = useThemeMode();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 992 : false
  );
  const loggedInUserId = localStorage.getItem("psid");
  const loggedInTitle = localStorage.getItem("entitlementType");
  const guestRole = localStorage.getItem("guestRole");

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const history = useHistory();
  const location = useLocation();

  const redirectToEntraLogoutScreen = () => {
    const url = window.location.host;
    const logoutUrl = `${ENTRA_URL}/logout?post_logout_redirect_uri=https://${url}/&client_id=1aabad22-8830-401f-9480-42967d62ca9b`;
  
    deleteAllCookiesAndSiteData();
    window.location.assign(logoutUrl);
  };

  const closeUserMenu = () => setUserMenuOpen(false);

  // Close the user menu whenever the route changes — protects against the
  // menu persisting after a navigation.
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onDocClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userMenuOpen]);

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  const goTo = (path) => {
    setUserMenuOpen(false);
    history.push(path);
  };

  const loginedRold =
    localStorage.getItem("entitlementType") || localStorage.getItem("guestRole");
  useEffect(() => {
    if (
      loginedRold &&
      (loginedRold.toLowerCase() === "subscriber" ||
        loginedRold.toLowerCase() === "guest")
    ) {
      setShowItem(false);
    }
  }, [loginedRold]);

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

  const navLinks = useMemo(() => {
    const navPages = getNavPages();
    const byKey = (key) => navPages.find((p) => p.key === key);

    // Permission gate per nav key. Catalogue is always shown.
    const isAllowed = (key) => {
      if (key === "catalogue") return true;
      if (!showItem) return false;
      if (key === "masterData") {
        return (
          masterDataPages &&
          (masterDataPages.permission === "RW" ||
            masterDataPages.permission === "R")
        );
      }
      if (key === "myTasks") {
        return (
          myTaskPages &&
          (myTaskPages.permission === "RW" || myTaskPages.permission === "R")
        );
      }
      if (key === "subscriptions") {
        return (
          subscriptionManagementPages &&
          (subscriptionManagementPages.permission === "R" ||
            subscriptionManagementPages.permission === "RW")
        );
      }
      return false;
    };

    return navPages
      .filter((page) => isAllowed(page.key))
      .map((page) => ({
        key: page.key,
        to: page.path,
        label: page.navLabel,
      }));
  }, [showItem, masterDataPages, myTaskPages, subscriptionManagementPages]);

  const renderNavLink = (item, onClick) => (
    <NavLink
      key={item.key}
      to={item.to}
      activeClassName="page-selected"
      className="app-nav-link"
      onClick={onClick}
    >
      {item.label}
    </NavLink>
  );

  return (
    <>
      <AppBar
        position="static"
        className="Main-header app-header"
        elevation={0}
      >
        <Toolbar disableGutters sx={{ width: "100%", justifyContent: "space-between" }}>
          <div className="app-header-left">
            {isMobile && (
              <IconButton
                aria-label="Open navigation"
                className="app-header-menu-btn"
                onClick={() => setDrawerOpen(true)}
                size="small"
                sx={{ color: "inherit" }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <div className="logo" id="corp-logo">
              <Link to="/catalog">
                <BrandLogo className="app-logo-svg" />
              </Link>
            </div>
            {!isMobile && (
              <nav className="app-header-nav">
                {navLinks.map((item) => renderNavLink(item))}
              </nav>
            )}
          </div>

          <div className="app-header-right">
            {!guestRole && (
              <button
                type="button"
                className="app-header-bell"
                aria-label="Notifications"
              >
                <NotificationsIcon fontSize="small" />
              </button>
            )}
            <Box
              ref={userMenuRef}
              sx={{ position: "relative", display: "inline-flex" }}
            >
              <Box
                role="button"
                className="app-user-trigger"
                onClick={toggleUserMenu}
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                sx={{ display: "inline-flex", alignItems: "center", cursor: "pointer", gap: 0.5 }}
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <ArrowDownIcon className="app-user-caret" fontSize="small" />
              </Box>

              {userMenuOpen && (
                <div className="app-user-dropdown" role="menu">
                  {guestRole ? (
                    <div className="app-user-dropdown-item is-disabled">
                      <span className="app-user-dropdown-label">
                        <strong>Guest</strong>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="app-user-dropdown-item"
                      onClick={() => goTo(`/userProfile/${loggedInUserId}`)}
                    >
                      <span className="app-user-dropdown-label">
                        <span className="header-user-psid">
                          PSID : {loggedInUserId}
                        </span>
                        <strong>{loggedInTitle}</strong>
                      </span>
                    </button>
                  )}

                  <div className="app-user-dropdown-divider" />

                  {!guestRole && (
                    <button
                      type="button"
                      className="app-user-dropdown-item"
                      onClick={() => goTo(`/userProfile/${loggedInUserId}`)}
                    >
                      <span className="app-user-dropdown-icon">
                        <SettingsIcon fontSize="small" />
                      </span>
                      <span className="app-user-dropdown-label">Settings</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="app-user-dropdown-item"
                    onClick={closeUserMenu}
                  >
                    <span className="app-user-dropdown-icon">
                      <HelpIcon fontSize="small" />
                    </span>
                    <span className="app-user-dropdown-label">Help Center</span>
                  </button>

                  <div className="app-user-dropdown-divider" />

                  <button
                    type="button"
                    className="app-user-dropdown-item"
                    onClick={toggleMode}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    <span className="app-user-dropdown-icon">
                      {isDark ? (
                        <LightModeIcon fontSize="small" />
                      ) : (
                        <DarkModeIcon fontSize="small" />
                      )}
                    </span>
                    <span className="app-user-dropdown-label">
                      {isDark ? "Light mode" : "Dark mode"}
                    </span>
                  </button>

                  <div className="app-user-dropdown-divider" />

                  <button
                    type="button"
                    className="app-user-dropdown-item"
                    onClick={() => {
                      closeUserMenu();
                      redirectToEntraLogoutScreen();
                    }}
                  >
                    <span className="app-user-dropdown-icon">
                      {guestRole ? (
                        <LoginIcon fontSize="small" />
                      ) : (
                        <LogoutIcon fontSize="small" />
                      )}
                    </span>
                    <span className="app-user-dropdown-label">
                      {guestRole ? "Login" : "Log out"}
                    </span>
                  </button>
                </div>
              )}
            </Box>
          </div>
        </Toolbar>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: Math.min(
                  280,
                  (typeof window !== "undefined" ? window.innerWidth : 360) - 40
                ),
              },
            },
          }}
        >
          <Box sx={{ p: 2, fontWeight: 600, borderBottom: "1px solid var(--color-border-secondary)" }}>
            Menu
          </Box>
          <Box className="app-drawer-nav">
            {navLinks.map((item) =>
              renderNavLink(item, () => setDrawerOpen(false))
            )}
          </Box>
        </Drawer>
      </AppBar>
    </>
  );
}

function mapStateToProps(state) {
  return {
    login: state.login,
    userProfile: state.userProfile.data,
  };
}
export default connect(mapStateToProps)(Headers);
