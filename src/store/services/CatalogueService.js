import axios from "axios";
import { API_DATA_ENTITY_URL, API_BASE_ENDPOINT } from "../../utils/Config";
import {
  METHOD_GET,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

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

export const loadCatalogueData = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getEntityAggregate`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};