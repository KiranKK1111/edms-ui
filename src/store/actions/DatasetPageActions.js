import Axios from "axios";
import { API_DATA_ENTITY_URL } from "../../utils/Config";
import { getContractById } from "../services/ContractService";
import {
  getDataFamilyById,
  getDatasetById,
} from "../services/DataFamilyService";
import { getLicenseById, getLicenseInfoById } from "../services/LicenseService";
import { getVendorById } from "../services/VendorService";
import { getDataFeedById, getMetadata } from "../services/DatafeedService";
import { getAgreementById } from "../services/ContractService";
import {
  API_TECHNICAL_DETAILS_URL,
  API_BASE_ENDPOINT,
  API_SCHEMAS_URL,
  API_DATAFLOW_URL,
  API_SUBSCRIPTION_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import {
  CONTENT_TYPE_APPLICATION_JSON,
  ACCESS_CONTROL_ALLOW_ORIGIN_STAR,
  METHOD_GET,
  METHOD_POST,
} from "../../utils/Constants";

import { CONTRACT_MANAGEMENT_SUCCESS } from "./ContractManagementActions";
import { AGREEMENT_BY_ID } from "../actions/contractAction";
import {
  DATA_FAMILY_LOADING,
  DATA_FAMILY_SUCCESS,
  DATASET_BY_ID,
} from "./DataFamilyActions";
import { LICENSE_SUCCESS, LICENSE_BY_ID } from "./LicenseActions";
import { VENDOR_SUCCESS } from "./VendorActions";
import {
  getDataSubById,
  businessRequirements,
  usage,
  terms,
  USER_LEVEL_SUB_LIST,
  getDataSubByCrId,
} from "./requestAccessActions";
import {
  DATAFEED_BY_ID,
  METADATA_INFO,
  METADATA_INFO_DETAIL,
} from "./DatafeedActions";
import axios from "axios";
import { API_BASE_URL_FOR_CHANGE, API_BASE_URL_FOR_DATAFLOW, API_BASE_URL_FOR_ENTITY, API_BASE_URL_FOR_SCHEMAS, API_BASE_URL_FOR_SUBSCRIPTION } from "../../urlMappings";

export const SUBSCRIPTION_TAB_INFO = "SUBSCRIPTION_TAB_INFO";
export const SUBSCRIBERS = "SUBSCRIBERS";
export const GET_DATASETS = "GET_DATASETS";

export const loadDatasetPageData = (dataFamilyId) => {
  return async (dispatch) => {
    try {
      let licenseId = null;
      let contractId = null;
      let vendorId = null;

      dispatch({ type: DATA_FAMILY_LOADING });

      await getDataFamilyById(dataFamilyId).then((response) => {
        if (response && response.data && response.data.length > 0) {
          const dataFamily = response.data[0];
          licenseId = dataFamily.licenseId;
          dispatch({ type: DATA_FAMILY_SUCCESS, payload: dataFamily });
        }
      });

      await getLicenseById(licenseId).then((response) => {
        if (response && response.data && response.data.length > 0) {
          const license = response.data[0];
          contractId = license.contractId;
          dispatch({ type: LICENSE_SUCCESS, payload: license });
        }
      });

      await getContractById(contractId).then((response) => {
        if (response && response.data && response.data.length > 0) {
          const contract = response.data[0];
          vendorId = contract.vendorId;
          dispatch({ type: CONTRACT_MANAGEMENT_SUCCESS, payload: contract });
        }
      });

      await getVendorById(vendorId).then((response) => {
        if (response && response.data && response.data.length > 0) {
          const vendor = response.data[0];
          dispatch({ type: VENDOR_SUCCESS, payload: vendor });
        }
      });

      dispatch(getSubscribers());
    } catch (err) {
      return err;
    }
  };
};

export const subscriptionTabInfo = (value) => {
  if (value === null) {
    return {
      type: SUBSCRIPTION_TAB_INFO,
      payload: {
        status: value,
        data: {},
        errors: "",
      },
    };
  } else {
    return async (dispatch) => {
      try {
        const response = await getDataSubById(value);
        dispatch({
          type: SUBSCRIPTION_TAB_INFO,
          payload: {
            status: response.data.subscriptionManagement.subscriptionStatus,
            data: response.data.subscriptionManagement,
            errors: "",
          },
        });
        dispatch(businessRequirements(response.data.subscriptionManagement));
        dispatch(terms(true));
      } catch (err) {
        dispatch({
          type: SUBSCRIPTION_TAB_INFO,
          payload: {
            status: null,
            data: {},
            errors: err.message,
          },
        });
      }
    };
  }
};

export const subscriptionTabInfoByCrId = (crId) => {
  if (crId === null) {
    return {
      type: SUBSCRIPTION_TAB_INFO,
      payload: {
        status: crId,
        data: {},
        errors: "",
      },
    };
  } else {
    return async (dispatch) => {
      try {
        const response = await getDataSubByCrId(crId);
        dispatch({
          type: SUBSCRIPTION_TAB_INFO,
          payload: {
            status: response.data.subscriptionManagement.subscriptionStatus,
            data: response.data.subscriptionManagement,
            errors: "",
          },
        });
        dispatch(businessRequirements(response.data.subscriptionManagement));
        dispatch(terms(true));
      } catch (err) {
        dispatch({
          type: SUBSCRIPTION_TAB_INFO,
          payload: {
            status: null,
            data: {},
            errors: err.message,
          },
        });
      }
    };
  }
};

export const getSubscribers = () => {
  return async (dispatch) => {
    const response = await Axios.get(
      `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/getSubscription`,
      { headers: { token: `Bearer ${localStorage.getItem("access_token")}` } }
    );

    dispatch({
      type: SUBSCRIBERS,
      payload: {
        data: response.data.subscriptions,
        errors: "",
      },
    });

    dispatch({
      type: USER_LEVEL_SUB_LIST,
      payload: response.data.subscriptions,
    });

    return response;
  };
};

export const deleteSubscriber = (value) => {
  const data = { ...value };
  return async (dispatch) => {
    try {
      const response = await Axios({
        method: "PUT",
        url: `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/updateSubscription`,
        data: data,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      return response;
    } catch (err) {
      return err;
    }
  };
};

export const fetchUrlsInfo = (id) => {
  const dataById = `{getTechnicalDetailsBySubscriptionId(subscriptionId:"${id}") {
    userId
    subscriptionId
    passCommonKey
    apiUrl
    }}`;
  return async (dispatch) => {
    try {
      const response = await Axios({
        method: "POST",
        url: `${API_TECHNICAL_DETAILS_URL}/${API_BASE_ENDPOINT}/getTechnicalDetailsBySubscriptionId`,
        data: dataById,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return response;
    } catch (err) {
      return err;
    }
  };
};

//------------------- NEW IMPLEMENTATION ------------------

export const catalogueDetailsData = (datafeedId, datasetId) => {
  return async (dispatch) => {
    dispatch({ type: DATAFEED_BY_ID, payload: {}, loading: true });
    dispatch({ type: DATASET_BY_ID, payload: {}, loading: true });
    try {
      const response1 = await getDataFeedById(datafeedId);
      await response1().then((response) => {
        if (response && response.datafeed) {
          dispatch({
            type: DATAFEED_BY_ID,
            payload: response,
            loading: false,
          });
        } else {
          dispatch({ type: DATAFEED_BY_ID, payload: {}, loading: false });
        }
      });
      const response2 = await getDatasetById(datasetId);
      await response2().then((response) => {
        if (response && response.data && response.data.dataset) {
          const { licenseId } = response.data.dataset;
          dispatch(getLicenseDetailsById(licenseId));
          dispatch({
            type: DATASET_BY_ID,
            payload: response.data.dataset,
            loading: false,
          });
        } else {
          dispatch({ type: DATASET_BY_ID, payload: {}, loading: false });
        }
      });
    } catch (err) {
      return err;
    }
  };
};

export const getLicenseDetailsById = (id) => {
  return async (dispatch) => {
    dispatch({ type: LICENSE_BY_ID, payload: {}, loading: true });
    try {
      const response3 = await getLicenseInfoById(id);

      await response3().then((response) => {
        if (response && response.data && response.data.license) {
          const { licenseAgreementId } = response.data.license;
          dispatch(getAgreementDetailsById(licenseAgreementId));
          dispatch({
            type: LICENSE_BY_ID,
            payload: response.data.license,
            loading: false,
          });
        } else {
          dispatch({ type: LICENSE_BY_ID, payload: {}, loading: false });
        }
      });
    } catch (err) {
      return err;
    }
  };
};

export const getAgreementDetailsById = (id) => {
  return async (dispatch) => {
    dispatch({ type: AGREEMENT_BY_ID, payload: {}, loading: true });
    try {
      const response4 = await getAgreementById(id);
      await response4().then((res) => {
        if (res && res.data && res.data.agreement) {
          dispatch({
            type: AGREEMENT_BY_ID,
            payload: res.data.agreement,
            loading: false,
          });
        } else {
          dispatch({ type: AGREEMENT_BY_ID, payload: {}, loading: false });
        }
      });
    } catch (err) {
      return err;
    }
  };
};

const fetchData = (method, url) => {
  const response = Axios({
    method: method,
    url: url,
    redirect: "follow",
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return response;
};

export const getMatadataInfo = (id) => {
  return async (dispatch) => {
    dispatch({ type: METADATA_INFO_DETAIL, payload: {}, loading: true });
    try {
      const response = await fetchData(
        METHOD_GET,
        `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/byDataFeedId?dataFeedId=${id}`
      );
      if (response.data) {
        const res = await fetchData(
          METHOD_GET,
          `${API_BASE_URL_FOR_SCHEMAS}/${API_BASE_ENDPOINT}/schemaByName/${response.data.schemaId}?latest=false&version=0`
        );
        dispatch({ type: METADATA_INFO_DETAIL, payload: res, loading: false });
      } else {
        dispatch({ type: METADATA_INFO_DETAIL, payload: {}, loading: false });
      }
    } catch (err) {
      dispatch({ type: METADATA_INFO_DETAIL, payload: {}, loading: false });
      return err;
    }
  };
};

export const getDatasetMetadataInfo = (id) => {
  return (dispatch) => {
    axios
      .get(
        `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/byDataFeedId?dataFeedId=${id}`,
        { headers: { token: `Bearer ${localStorage.getItem("access_token")}` } }
      )
      .then((response) => {
        dispatch({ type: METADATA_INFO, payload: response, loading: false });
      })
      .catch((err) => {
        return err;
      });
  };
};

export const setDatasets = (datasetList) => {
  return {
    type: GET_DATASETS,
    payload: datasetList,
  };
};

export const gerDatasetByCrId = (crId) => {
  return (dispatch) => {
    axios
      .get(
        `${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/getChangeRequestById?crId=${crId}`,
        { headers: { token: `Bearer ${localStorage.getItem("access_token")}` } }
      )
      .then((response) => {
        dispatch(
          setDatasets([JSON.parse(response.data.changeRequest.crRequest)])
        );
      })
      .catch((err) => {
        return err;
      });
  };
};

export const startGetDatasets = () => {
  return (dispatch) => {
    axios
      .get(`${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataSets`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        dispatch(setDatasets(response.data.datasetList));
      })
      .catch((err) => {
        return err;
      });
  };
};