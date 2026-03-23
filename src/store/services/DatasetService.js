import Axios from "axios";
import { API_BASE_ENDPOINT, API_DATA_ENTITY_URL } from "../../utils/Config";
import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

export const getDataSetById = async (datasetId) => {
  if (!datasetId) {
    return Promise.reject(new Error("dataset Id cannot be NULL.."));
  }

  const data = `{
    getDataSets (datasetId: "${datasetId}")
    {
      datasetId
      longName
      shortName
      licenseId
      datasetDescription
	    datasetStatus
      createdBy
      createdOn
      lastUpdatedBy
      lastUpdatedOn
      approvedBy
      approvedOn
      entityId
      datasetUpdateFlag
    }
  }`;

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataSetById`,
      data: data,
      headers: {
        "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
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

//----------------------- NEW IMPLEMENTATION ------------------------

const fetchData = (method, url) => {
  const response = Axios({
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

export const getDataSetInfoById = (id) => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataSetById?datasetId=${id}`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};