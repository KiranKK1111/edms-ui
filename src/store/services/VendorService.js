import Axios from "axios";

import {
  API_BASE_ENDPOINT,
  API_SQL_RECORDS_URL,
  API_DATA_ENTITY_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import {
  METHOD_POST,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
  METHOD_GET,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

export const getVendorById = async (entityId) => {
  if (!entityId) {
    return Promise.reject(new Error("Vendor ID cannot be NULL.."));
  }
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getEntityById?entityId=${entityId}`,
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

export const getVendorByChangeRequestId = async (crId) => {
  if (!crId) {
    return Promise.reject(new Error("Change Request ID cannot be NULL.."));
  }
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_TASKLIST_URL}/${API_BASE_ENDPOINT}/getChangeRequestById?crId=${crId}`,
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

export const getVendorsByVendorIds = async (vendorIds) => {
  if (!vendorIds || vendorIds.length === 0) {
    return Promise.reject(
      new Error("Vendor ID's cannot be NULL for fetching Vendors..")
    );
  }

  const data = {
    input:
      "SELECT vo.vendor_id AS vendorId, vo.name AS name, vo.country AS country, " +
      "vo.task_status AS taskStatus FROM vendor_overview vo WHERE vo.vendor_id IN (:valuesList)",
    valuesList: vendorIds,
  };

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_SQL_RECORDS_URL}/${API_BASE_ENDPOINT}/getRecords`,
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

export const getOverViewRecords = async () => {
  const data = {
    input:
      "SELECT * FROM task_list WHERE creation_date < NOW() - INTERVAL '7 DAYS'",
  };

  try {
    const response = await Axios({
      method: METHOD_POST,
      url: `${API_SQL_RECORDS_URL}/${API_BASE_ENDPOINT}/getDefaultRecords`,
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