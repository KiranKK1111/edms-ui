import moment from "moment";

import {
  OWNER_ROLES,
  ROLE_OWNER,
  CONSUMER_ROLES,
  ROLE_CONSUMER,
  ADMIN_ROLES,
  ROLE_ADMIN,
  LOCAL_STORAGE_ACCESS_TOKEN,
  LOCAL_STORAGE_REFRESH_TOKEN,
  LOCAL_STORAGE_PSID,
  LOCAL_STORAGE_TOKEN_REFRESHED,
} from "./Constants";

/**
 * Method to check against hard coded roles. If found a valid role is returned or
 * else "null" is rturned.
 *
 * @param {*} psid the PSID number or string.
 */
export const getHardCodedRole = (psid) => {
  const psidString = "" + psid;
  let role = null;

  role = OWNER_ROLES.includes(psidString) ? ROLE_OWNER : null;
  role =
    role === null && CONSUMER_ROLES.includes(psidString) ? ROLE_CONSUMER : role;
  role = role === null && ADMIN_ROLES.includes(psidString) ? ROLE_ADMIN : role;

  return role;
};

/**
 * Method to update the local storage with the provided values.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {boolean} tokenRefreshed
 * @param {string} psid
 */
export const setLocalStorage = (
  accessToken,
  refreshToken,
  tokenRefreshed,
  psid
) => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, accessToken);
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN, refreshToken);
  localStorage.setItem(LOCAL_STORAGE_TOKEN_REFRESHED, tokenRefreshed);
  localStorage.setItem(LOCAL_STORAGE_PSID, psid);
};

/**
 * Method to create a new User Profile object.
 *
 * @param {string} psid the PSID of the user.
 */
export const createNewUserProfile = (psid, userRole) => {
  return {
    psId: psid,
    entitlementType: userRole,
    lastLogin: moment().format(),
    firstLogin: moment().format(),
    newSubscriptions: "Y",
    systemMessages: "Y",
  };
};
