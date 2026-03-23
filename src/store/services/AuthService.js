import axios from "axios";
import moment from "moment";
import * as jwt from "jsonwebtoken";

import {
  METHOD_POST,
  REACT_CLIENT,
  CLIENT_SECRET,
  CONTENT_TYPE_APPLICATION_FORM_URL_ENCODED,
  METHOD_GET,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import {
  API_SCB_LOGIN_URL,
  API_SCB_BASE_ENDPOINT,
  API_LOGIN_URL,
  API_BASE_ENDPOINT,
  API_ADD_ROLE_URL,
  API_AUTH_URL,
  API_FOR_AUTH,
  API_FOR_ENTITLEMENT,
} from "../../utils/Config";
import { API_BASE_URL_FOR_AUTH, API_BASE_URL_FOR_ENTITLEMENT } from "../../urlMappings";

export const userLogin = async (formData) => {
  return axios({
    method: METHOD_POST,
    url: `${API_SCB_LOGIN_URL}/${API_SCB_BASE_ENDPOINT}/login`,
    auth: {
      username: REACT_CLIENT,
      password: CLIENT_SECRET,
    },
    headers: {
      "Content-Type": CONTENT_TYPE_APPLICATION_FORM_URL_ENCODED,
    },
    data: formData,
  });
};

export const userLoginForgerock = async (code) => {
  return axios({
    method: METHOD_GET,
    url: `${API_BASE_URL_FOR_AUTH}/${API_BASE_ENDPOINT}/getRolesFromEntra?entraCode=${code}`,
  });
};

export const fetchUserMatrix = async (roles) => {
  return axios({
    method: METHOD_GET,
    url: `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/fetchObjectMatrix?role=${roles}`,
    headers: {
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

export const mockUserLogin = async () => {
  return axios({
    method: METHOD_GET,
    url: `${API_LOGIN_URL}/${API_BASE_ENDPOINT}/firstApi`,
  });
};

export const getExpiration = (token) => {
  const decodedToken = jwt.decode(token);
  return moment.unix(decodedToken.exp);
};

export const isValid = (token) => {
  const ActiveToken = moment().isBefore(getExpiration(token));
  return ActiveToken;
};

export const isAuthenticated = () => {
  let token = localStorage.getItem("access_token");
  let refreshToken = localStorage.getItem("refresh_token");

  if (token) {
    if (isValid(token)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};

/*
else if (isValid(refreshToken)) {
      return true;
    }
    */
