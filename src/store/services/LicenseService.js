import Axios from "axios";

import {
  API_BASE_ENDPOINT,
  API_LICENSE_MANAGER_URL,
  API_SQL_RECORDS_URL,
  API_AGREEMENT_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import {
  METHOD_GET,
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_AGREEMENT, API_BASE_URL_FOR_CHANGE } from "../../urlMappings";

export const getLicenseById = async (licenseId) => {
  if (!licenseId) {
    return Promise.reject(new Error("Licence ID cannot be NULL.."));
  }

  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getLicenseById?licenseId=${licenseId}`,
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

export const getLicenseByChangeRequestId = async (crId) => {
  if (!crId) {
    return Promise.reject(new Error("Agreement ID cannot be NULL.."));
  }
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/getChangeRequestById?crId=${crId}`,
      headers: {
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getLicensesByLicenseIds = async (licenseIds) => {
  if (!licenseIds || licenseIds.length === 0) {
    return Promise.reject(
      new Error("Licence ID's cannot be NULL while fetching Licences..")
    );
  }

  const data = {
    input:
      "SELECT lm.license_id AS licenseId, lm.product_description AS productDescription, " +
      "lm.contract_id AS contractId, lm.license_cost AS licenseCost FROM license_manager lm WHERE" +
      " lm.license_id in (:valuesList)",
    valuesList: licenseIds,
  };

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_SQL_RECORDS_URL}/${API_BASE_ENDPOINT}/getRecords`,
      data: data,
      headers: {
        "Content-Type": CONTENT_TYPE_APPLICATION_JSON,
        "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    return response;
  } catch (err) {
    return err;
  }
};

export const getLicenseCountById = async (licenseId) => {
  if (!licenseId) {
    return Promise.reject(new Error("Licence ID cannot be NULL.."));
  }

  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getLicenseCount?licenseId=${licenseId}`,
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

export const getLicenseInfoById = (id) => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getLicenseById?licenseId=${id}`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};