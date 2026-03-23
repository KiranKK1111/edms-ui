import Axios from "axios";

import {
  API_BASE_ENDPOINT,
  API_DATA_FAMILY_URL,
  API_DATA_ENTITY_URL,
} from "../../utils/Config";
import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

export const getAllDataFamily = async () => {
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_DATA_FAMILY_URL}/${API_BASE_ENDPOINT}/getDataFamily`,
      headers: {
        "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
      },
    });

    return response;
  } catch (err) {
    return err;
  }
};

export const getDataFamilyById = async (dataFamilyId) => {
  if (!dataFamilyId) {
    return Promise.reject(new Error("Data Family ID cannot be NULL.."));
  }

  const data = `{
    getDataFamilyMgmtById (dataFamilyId: "${dataFamilyId}") {
      dataFamilyId
      dataFamilyName
      licenseId
      dataFamilyCreator
      originalDerived
      parentDataFamily1
      secondaryDataFamily1
      secondaryDataFamily2
      secondaryDataFamily3
      secondaryDataFamily4
      bpsiSchemaID
      periodicity
      frequency
      occurrence
      descriptionOfDataFamily
      publisher
      taskStatus
      creationDate
      createdBy
      authorizationDate
      authorizedBy
    }
  }`;

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_DATA_FAMILY_URL}/${API_BASE_ENDPOINT}/getDataFamilyById`,
      data: data,
      headers: {
        "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

//---------------------- NEW DATASET IMPLEMENTATION --------------------------
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

export const getAllDatasets = () => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataSets`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};

export const getDatasetById = (id) => {
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