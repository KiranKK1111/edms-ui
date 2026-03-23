import axios from "axios";
import Axios from "axios";
import {
  API_DATA_ENTITY_URL,
  API_BASE_ENDPOINT,
  API_SCHEMAS_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_CHANGE, API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

const fetchData = (method, url) => {
  const response = axios({
    method: method,
    url: url,
    headers: {
      "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
      "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return response;
};

export const getAllDataFeeds = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataFeeds`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};

export const getDataFeedById = (id) => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataFeedById?datafeedId=${id}`
      );
      return response.data;
    } catch (err) {
      return err;
    }
  };
};

export const getDataFeedByChangeRequestId = async (crId) => {
  if (!crId) {
    return Promise.reject(new Error("Change Request ID cannot be NULL.."));
  }
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/getChangeRequestById?crId=${crId}`,
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getMetadata = (schemaName) => {
  return async (dispatch) => {};
};