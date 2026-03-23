
import axios from "axios";
import { API_BASE_ENDPOINT, API_ADD_ROLE_URL } from "../../utils/Config";
import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITLEMENT } from "../../urlMappings";

export const ROLE_LIST = "ROLE_LIST";
export const ALL_USERS_DATA = "ALL_USERS_DATA";

const fetchData = (method, url) => {
  const response = axios({
    method: method,
    url: url,
    headers: {
      "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
      "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    },
  });
  return response;
};

export const roleList = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/getRole`
      );
      dispatch({
        type: ROLE_LIST,
        payload: response.data.roleList,
      });
    } catch (err) {}
  };
};

export const allUsersData = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/getAllUserRoles`
      );
      dispatch({
        type: ALL_USERS_DATA,
        payload: response.data.userRoles,
      });
    } catch (err) {}
  };
};

export const addNewUser = (data, status) => {
  return async (dispatch) => {
    let url =
      status === "new"
        ? `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/createUserWithMultipleRoles`
        : `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/updateUserWithMultipleRoles`;
    try {
      const response = await axios({
        method: status === "new" ? METHOD_POST : "PUT",
        url: url,
        data: data,
      });
      return response;
    } catch (err) {
      return err;
    }
  };
};