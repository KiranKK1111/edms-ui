import axios from "axios";
import { API_SCB_BASE_ENDPOINT, API_SCB_LOGIN_URL } from "../../utils/Config";
import base64 from "base-64";

export const SET_USER = "SET_USER";
export const REMOVE_USER = "REMOVE_USER";
export const REFRESH_USER = "REFRESH_USER";
export const LOGIN_FAILED = "LOGIN_FAILED";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

/*FIRST TIME LOGIN (NO TOKEN IN LOCALSTORAGE)*/
export const startUserLogin = (userCredentials, redirect) => {
  const userData = JSON.stringify(userCredentials);
  var encodedPassword = base64.encode(userData.password);

  return async (dispatch) => {
    await axios({
      method: "post",
      url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/login`,
      data: userData,
      body: {
        Type: "x-www-form-urlencoded",
        grant_type: "password",
        username: userData.username,
        password: encodedPassword,
      },
    })
      .then((response) => {
        /*ACCESS TOKEN RECEIVED FROM SCB DATABASE */

        if (response.data.hasOwnProperty("error")) {
          alert("PSID or password is incorrect. Try again.");
        } else {
          const user = {
            psid: userCredentials.username,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            tokenRefreshed: false,
            firstLoginDate: new Date(),
            lastLoginDate: new Date(),
            validLogin: true,
          };

          dispatch(setUser(user));

          /*SETTING UP THE LOCALSTORAGE WITH USERID & TOKEN*/
          // localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          localStorage.setItem("token_refreshed", false);
          localStorage.setItem("psid", userCredentials.username);

          /*GET ENTITLEMENT FROM USERPROFILE API AND STORE IN USERPROFILE TABLE
          

          /*REDIRECT TO CATALOG PAGE*/
          redirect();

          return response;
        }
      })
      .catch((err) => {
        return err;
      });
  };
};

export const getUserProfile = async (psid) => {
  await axios({
    method: "post",
    url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/userDetail`,
    data: psid,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access-token")}`,
    },
  })
    .then((response) => {
      /*ENTITLEMENT RECEIVED FROM SCB DATABASE*/

      const title = response.data.role;
      localStorage.setItem("entitlementType", title);
      return response;
    })
    .catch((err) => {
      return err;
    });
};

export const refreshUser = (refreshedUser) => {
  return {
    type: REFRESH_USER,
    payload: refreshedUser,
  };
};

/*IF THE ACCESS TOKEN IS EXPIRED FETCH A NEW ACCESS TOKEN*/
export const startGetRefreshToken = (redirect) => {
  const storedRefreshToken = localStorage.getItem("refresh_token");

  return async (dispatch) => {
    await axios({
      method: "post",
      url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/login`,
      data: localStorage.getItem("refresh_token"),
      body: {
        Type: "x-www-form-urlencoded",
        grant_type: "refresh_token",
        refresh_token: storedRefreshToken,
      },
    })
      .then((response) => {
        if (response.data.hasOwnProperty("error")) {
          dispatch(startLogOut(storedRefreshToken));
        } else {
          const refreshedUser = {
            /*ACCESS TOKEN RECEIVED FROM SCB DATABASE AFTER REDRESH*/
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            tokenRefreshed: true,
            lastLoginDate: new Date(),
          };
          dispatch(refreshUser(refreshedUser));
          /*SETTING UP THE LOCALSTORAGE WITH REFRESHED ACCESS_TOKE   N*/
          // localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          localStorage.setItem("token_refreshed", true);
          redirect(); /*REDIRECT TO CATALOG PAGE*/
        }
      })
      .catch((err) => {
        return err;
      });
  };
};

export const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

export const startLogOut = () => {
  return async (dispatch) => {
    await axios({
      method: "post",
      url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/logout/`,
      data: {},
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access-token")}`,
      },
      body: {},
    })
      .then((response) => {
        if (response.data.hasOwnProperty("error")) {
          alert("You are not logged in");
        } else {
          /*CLEAR LOCAL STORAGE */
          dispatch({ type: "RESET" });
          localStorage.clear();
          dispatch(removeUser());
        }
      })
      .catch((err) => {
        return err;
      });
  };
};