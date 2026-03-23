import axios from "axios";
import {
  API_SCB_BASE_ENDPOINT,
  API_SCB_LOGIN_URL,
  API_ADD_ROLE_URL,
  API_BASE_ENDPOINT,
  API_AUTH_URL,
} from "../../utils/Config";
import {
  GRANT_TYPE,
  PASSWORD_KEY,
  USERNAME_KEY,
  OVERRIDE_SESSION,
  PASSWORD_TEXT,
  LOCAL_STORAGE_ACCESS_TOKEN,
  LOCAL_STORAGE_ENTITLEMENT_TYPE,
  ROLE_OWNER,
  ROLE_CONSUMER,
  ROLE_ADMIN,
  LOCAL_STORAGE_OBJECT_MATRIX,
} from "../../utils/Constants";
import { message } from "antd";
import { setLocalStorage } from "../../utils/UserUtils";
import { userLogin, userLoginForgerock } from "../services/AuthService";
import { fetchUserMatrix } from "../services/AuthService";
import moment from "moment";


export const SET_USER = "SET_USER";
export const REMOVE_USER = "REMOVE_USER";
export const REFRESH_USER = "REFRESH_USER";
export const LOGIN_FAILED = "LOGIN_FAILED";
export const OBJECT_MATRIX = "OBJECT_MATRIX";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const setUserMatrix = (matrix) => {
  return {
    type: OBJECT_MATRIX,
    payload: matrix,
  };
};

/*FIRST TIME LOGIN (NO TOKEN IN LOCALSTORAGE)*/
export const startUserLogin = (userCredentials, redirect) => {
  return async (dispatch) => {
    const formData = new FormData();
    formData.append(GRANT_TYPE, PASSWORD_TEXT);
    formData.append(USERNAME_KEY, userCredentials.username);

    formData.append(PASSWORD_KEY, btoa(userCredentials.password));
    formData.append(OVERRIDE_SESSION, false);

    userLogin(formData)
      .then((loginResponse) => {
        // If response is not valid, display error message.
        if (!loginResponse || !loginResponse.data) {
          message.error("Error logging in, please refresh page and try again!");
        }
        const rolesUser =
          loginResponse.data.roles &&
          loginResponse.data.roles.length > 0 &&
          loginResponse.data.roles[0];

        let userMatrixData = [];
        fetchUserMatrix(rolesUser)
          .then((matrixResponse) => {
            const { objectMatrix } = matrixResponse.data;
            userMatrixData.push(objectMatrix);
            localStorage.setItem(
              LOCAL_STORAGE_OBJECT_MATRIX,
              JSON.stringify(objectMatrix)
            );
            dispatch(setUserMatrix(objectMatrix));
          })
          .catch((err) => {
            message.error("Error logging in getting roles! ");
          });

        /*ACCESS TOKEN RECEIVED FROM SCB DATABASE*/
        const user = {
          psid: userCredentials.username,
          accessToken: loginResponse.data.access_token,
          refreshToken: loginResponse.data.refresh_token,
          tokenRefreshed: false,
          uiUserRoleNew:
            loginResponse.data.roles &&
            loginResponse.data.roles.length > 0 &&
            loginResponse.data.roles[0],
          firstLoginDate: new Date(),
          lastLoginDate: new Date(),
        };

        dispatch(setUser(user));

        if (!user.uiUserRoleNew) {
          message.error("Error, not authorised!");
          return null;
        } else {
          localStorage.setItem(
            LOCAL_STORAGE_ENTITLEMENT_TYPE,
            user.uiUserRoleNew
          );
        }
        setLocalStorage(
          loginResponse.data.access_token,
          loginResponse.data.refresh_token,
          false,
          userCredentials.username,
          userMatrixData
        );
        redirect();
      })
      .catch((error) => {
        //
        // If a valid error response is recieved, display the error message else
        // display a generic error message.
        // Once Login functionality is sorted out, uncomment the below lines and
        // delete hard coded values
        //
        if (
          error &&
          error.response &&
          error.response.data &&
          error.response.data.description
        ) {
          message.error(error.response.data.description);
        } else {
          message.error("Error logging in, please refresh page and try again!");
        }

        // Call the mock Login API and proceed.

        return error;
      });
  };
};

export const startUserLoginForgerock = (code, redirect, viewAsGuest) => {
  return async (dispatch) => {
    try {
      const loginResponse = await userLoginForgerock(code);
      // If response is not valid, display error message.
      if (
        !loginResponse ||
        !loginResponse.data ||
        !loginResponse.data.role.length
      ) {
        // message.error("Error logging in, please refresh page and try again!");
        viewAsGuest();
      }

      const rolesUser =
        loginResponse.data.role &&
        loginResponse.data.role.length > 0 &&
        loginResponse.data.role[0];
      let jwtToken = loginResponse.data && loginResponse.data.jwtToken;
      if (jwtToken) {
        localStorage.setItem("access_token", jwtToken);
        localStorage.setItem("currentUserRole", rolesUser)
      }
      let userMatrixData = [];
      const resUserMatrix = await fetchUserMatrix(rolesUser);
      if (resUserMatrix && resUserMatrix.data) {
        const { objectMatrix } = resUserMatrix.data;
        userMatrixData.push(objectMatrix);
        localStorage.setItem(
          LOCAL_STORAGE_OBJECT_MATRIX,
          JSON.stringify(objectMatrix)
        );
        dispatch(setUserMatrix(objectMatrix));
      } else {
        //message.error("Error logging in getting roles! ");
        viewAsGuest();
      }

      /*ACCESS TOKEN RECEIVED FROM SCB DATABASE*/
      const user = {
        psid: loginResponse.data.psid,
        tokenRefreshed: false,
        uiUserRoleNew:
          loginResponse.data.role &&
          loginResponse.data.role.length > 0 &&
          loginResponse.data.role[0],
        firstLoginDate: new Date(),
        lastLoginDate: new Date(),
      };

      dispatch(setUser(user));

      if (!user.uiUserRoleNew) {
        //message.error("Error, not authorised!");
        viewAsGuest();
        return null;
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_ENTITLEMENT_TYPE,
          user.uiUserRoleNew
        );
      }
      setLocalStorage(jwtToken ? jwtToken : null, null, false, user.psid);
      redirect();
      return loginResponse;
    } catch (error) {
      //
      // If a valid error response is recieved, display the error message else
      // display a generic error message.
      // Once Login functionality is sorted out, uncomment the below lines and
      // delete hard coded values
      //
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.description
      ) {
        message.error(error.response.data.description);
      } else {
        // message.error("Error logging in, please refresh page and try again!");
        viewAsGuest();
      }

      // Call the mock Login API and proceed.

      return error;
    }
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

//
function getDynamicRole(psid) {
  return axios.get(
    `${API_ADD_ROLE_URL}/${API_BASE_ENDPOINT}/getRolesForUser?userId=${psid}`,
    {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    }
  );
}

export function userDetailsLogin() {
  return axios.post(`${API_ADD_ROLE_URL}/${API_BASE_ENDPOINT}/feedLoginTime`, {
    psid: localStorage.getItem("psid"),
    loginTime: moment(new Date()).format(),
  });
}
export function userDetailsLogout() {
  return axios.put(`${API_ADD_ROLE_URL}/${API_BASE_ENDPOINT}/updateLogout`, {
    psid: localStorage.getItem("psid"),
    lastLoginTime: moment(new Date()).format(),
  });
}

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
          localStorage.setItem("access_token", response.data.access_token);
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
      url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/logout`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          LOCAL_STORAGE_ACCESS_TOKEN
        )}`,
      },
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
export const startLogOutForgerock = () => {
  return async (dispatch) => {
    await axios({
      method: "get",
      url: `${API_AUTH_URL}/${API_BASE_ENDPOINT}/logout?token=Bearer ${localStorage.getItem(
        "access_token"
      )}`,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        return console.log(err);
      });
  };
};

export const getUIUserRole = (response) => {
  let updatedRole = "";
  let role = "";
  if (
    response &&
    response.data &&
    response.data.Role &&
    response.data.Role.length > 0
  ) {
    role = response.data.Role[0].Value;
  }

  switch (role) {
    case "Admin":
      updatedRole = ROLE_ADMIN;
      localStorage.setItem(LOCAL_STORAGE_ENTITLEMENT_TYPE, updatedRole);
      break;

    case "DatasetConsumer":
      updatedRole = ROLE_CONSUMER;
      localStorage.setItem(LOCAL_STORAGE_ENTITLEMENT_TYPE, updatedRole);
      break;

    case "DatasetOwner":
      updatedRole = ROLE_OWNER;
      localStorage.setItem(LOCAL_STORAGE_ENTITLEMENT_TYPE, updatedRole);
      break;

    default:
      break;
  }
  return updatedRole;
};