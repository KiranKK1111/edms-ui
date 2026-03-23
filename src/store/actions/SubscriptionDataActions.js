import axios from "axios";
import { API_BASE_ENDPOINT } from "../../utils/Config";
import {
  METHOD_GET,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_AGREEMENT, API_BASE_URL_FOR_SUBSCRIPTION } from "../../urlMappings";

export const ALL_SUBSCRIPTION_DATA = "ALL_SUBSCRIPTION_DATA";
export const ALL_DATAOWNER_DATA = "ALL_DATAOWNER_DATA";

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

export const getAllSubscriptionDataList = () => {
  return async (dispatch) => {
    const res = axios
      .get(`${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/getSubscription`, {
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        dispatch({
          type: ALL_SUBSCRIPTION_DATA,
          payload: response.data.subscriptions,
          loading: true,
        });
        return response.data;
      })
      .catch((err) => {
        dispatch({ type: ALL_SUBSCRIPTION_DATA, payload: [] });
        return err;
      });
    return res;
  };
};

export const getAllDataOwner = () => {
  return async (dispatch) => {
    const result = axios
    .get(`${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getAllDatasetOwners`, 
      {
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        dispatch({
          type: ALL_DATAOWNER_DATA,
          payload: response.data.agreementMgrBankId,
          loading: true,
        });
        return response.data;
      })
      .catch((err) => {
        return err;
      });
    return result;
  };
};