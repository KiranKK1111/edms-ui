import Axios from "axios";

import {
  API_BASE_ENDPOINT,
  API_CONTRACT_MANAGEMENT_URL,
  API_SQL_RECORDS_URL,
  API_AGREEMENT_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import {
  METHOD_POST,
  METHOD_GET,
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
} from "../../utils/Constants";
import { API_BASE_URL_FOR_AGREEMENT, API_BASE_URL_FOR_CHANGE } from "../../urlMappings";

export const getContractById = async (agreementId) => {
  if (!agreementId) {
    return Promise.reject(new Error("Agreement ID cannot be NULL.."));
  }
  try {
    const response = await Axios({
      method: METHOD_GET,
      url: `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getAgreementById?agreementId=${agreementId}`,
      headers: {
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getContractByChangeRequestId = async (crId) => {
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

export const getContractsByContractIds = async (contractIds) => {
  if (!contractIds || contractIds.length === 0) {
    return Promise.reject(
      new Error("Contract ID's cannot be NULL for fetching Contracts..")
    );
  }

  const data = {
    input:
      "SELECT cm.contract_id AS contractId, cm.vendor_id AS vendorId, " +
      "cm.authorized_by AS authorizedBy FROM contract_management cm WHERE " +
      "cm.contract_id IN (:valuesList)",
    valuesList: contractIds,
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
export const metaTabTableData = async () => {
  const data = {
    input:
      "SELECT DataFamilyID, AttributeSchemaName, AttributeTableName, AttributeName, " +
      "DataType, DataLength, ParentTableName, Tablerank FROM DataFamilyMgmt_Detail " +
      "ORDER BY AttributeSchemaName, AttributeTableName, FieldIndexvalue",
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
    return response.data;
  } catch (err) {
    return err;
  }
};

export const DataDictionaryTableData = async () => {
  const data = {
    input:
      "SELECT DataFamilyID, AttributeSchemaName, AttributeTableName, AttributeName, " +
      "DataClassification, Datadefinition, Factordimension,derivedororiginal,derivationlogic " +
      "FROM DataFamilyMgmt_Detail ORDER BY AttributeSchemaName, AttributeTableName, " +
      "FieldIndexvalue",
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
    return response.data;
  } catch (err) {
    return err;
  }
};

export const auditlogVendorOverview = async (id) => {
  const data = {
    input: "SELECT * FROM audit_log WHERE pkey = :customField1",
    customField1: id,
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
    return response.data;
  } catch (err) {
    return err;
  }
};

export const auditlogLicenseService = async (id) => {
  const data = {
    input:
      "SELECT * FROM audit_log WHERE table_name IN ('recurrence_scheduler', " +
      "'source_configuration', 'license_manager') AND pkey = :customField1",
    customField1: id,
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
    return response.data;
  } catch (err) {
    return err;
  }
};

export const auditlogSubscriptionLevel = async (id) => {
  const data = {
    input:
      "SELECT * FROM audit_log WHERE table_name = 'user_lvl_sub_mgmt' AND pkey = :customField1",
    customField1: id,
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

    return response.data;
  } catch (err) {
    return err;
  }
};

//------------------- NEW IMPLEMENTATION ---------------------

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

export const getAgreementById = (id) => {
  return async (dispatch) => {
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getAgreementById?agreementId=${id}`
      );
      return response;
    } catch (err) {
      return err;
    }
  };
};