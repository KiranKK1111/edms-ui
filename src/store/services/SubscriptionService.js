import axios from "axios";
import { API_SUBSCRIPTION_URL, API_BASE_ENDPOINT } from "../../utils/Config";
import {
  METHOD_GET,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_SUBSCRIPTION } from "../../urlMappings";

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

export const getAllSubscriptions = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/getSubscription`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};