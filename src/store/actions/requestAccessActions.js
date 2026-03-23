import moment from "moment";
import axios from "axios";
import {
  API_USER_SUBSCRIPTION_MANAGEMENT_URL,
  API_BASE_ENDPOINT,
  API_SQL_RECORDS_URL,
  API_TECHNICAL_DETAILS_URL,
  API_TEMP_URL,
  EDMS_ACCESS_API_ENDPOINT,
  EDMS_ACCESS_API_ACCESS_ENDPOINT,
  API_SUBSCRIPTION_URL,
  API_TASKLIST_URL,
} from "../../utils/Config";
import { API_BASE_URL_FOR_CHANGE, API_BASE_URL_FOR_SUBSCRIPTION } from "../../urlMappings";
export const BUSINESS_REQUIREMENTS = "BUSINESS_REQUIREMENTS";
export const USAGE = "USAGE";
export const TERMS = "TERMS";

export const SAVE_FINAL_DATA = "SAVE_FINAL_DATA";
export const SEND_DATA = "SEND_DATA";

export const TABLE_INFO = "TABLE_INFO";
export const DATA_BY_ID = "DATA_BY_ID";
export const CLEAR_STORE = "CLEAR_STORE";
export const SAVE_AS_DRAFT = "SAVE_AS_DRAFT";
export const USER_LEVEL_SUB_LIST = "USER_LEVEL_SUB_LIST";
export const businessRequirements = (data) => {
  return {
    type: BUSINESS_REQUIREMENTS,
    payload: data,
  };
};

export const updateBusinessRequirements = (data) => {
  return async (dispatch, getState) => {
    const businessRequirements = getState().requestAccess.businessRequirements;
    let updatedData = {};

    // If data is already present in the store, update it and send it back to the store.
    if (businessRequirements && businessRequirements.length > 0) {
      updatedData = { ...businessRequirements[0], ...data };
    } else {
      updatedData = { ...data };
    }
    dispatch({ type: BUSINESS_REQUIREMENTS, payload: updatedData });
  };
};

export const usage = (data) => {
  return {
    type: USAGE,
    payload: data,
  };
};

export const updateUsage = (data) => {
  return async (dispatch, getState) => {
    const usage = getState().requestAccess.usage;
    let updatedData = {};

    // If data is already present in the store, update it and send it back to the store.
    if (usage && usage.length > 0) {
      updatedData = { ...usage[0], ...data };
    } else {
      updatedData = { ...data };
    }

    dispatch({ type: USAGE, payload: updatedData });
  };
};

export const terms = (status) => {
  return {
    type: TERMS,
    status,
  };
};

export const saveFinalData = (values) => {
  return {
    type: SAVE_FINAL_DATA,
    payload: values,
  };
};

export const userLevelSubscriptionList = (values) => {
  return {
    type: USER_LEVEL_SUB_LIST,
    payload: values,
  };
};

export const saveAsDraftRequest = (values) => {
  // Set the "taskStatus" as "draft" as this method is only for saving draft data..
  values.taskStatus = "Draft";

  return async (dispatch) => {
    try {
      let response = {};

      // If "subscriptionId" is present, update the existing record.
      if (
        values &&
        values.subscriptionId &&
        values.subscriptionId.trim() !== ""
      ) {
        response = await dispatch(approveReject(values));
      } else {
        response = await dispatch(sendData(values));
      }

      dispatch({
        type: SAVE_AS_DRAFT,
        payload: [],
        isSaveAsDraft: true,
      });

      return response;
    } catch (err) {
      dispatch({
        type: SAVE_AS_DRAFT,
        payload: [],
        isSaveAsDraft: true,
      });

      return err;
    }
  };
};

export const sendData = (values) => {
  return async (dispatch) => {
    dispatch({
      type: SEND_DATA,
      payload: {
        loading: true,
        subscriptionId: "",
        errorMessage: "",
      },
    });
    try {
      const response = await axios({
        method: "POST",
        url: `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/createSubscription`,
        data: values,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      dispatch({
        type: SEND_DATA,
        payload: {
          loading: true,
          subscriptionId: response.data.subscriptionManagement.subscriptionId,
          errorMessage: "",
        },
      });
      return response;
    } catch (err) {
      dispatch({
        type: SEND_DATA,
        payload: {
          loading: false,
          subscriptionId: "",
          errorMessage: err.message,
        },
      });

      return err;
    }
  };
};

export const tableInfo = (values) => {
  return {
    type: TABLE_INFO,
    payload: values,
  };
};

export const getDataSubById = async (id) => {
  const response = await axios({
    method: "GET",
    url: `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/getSubscriptionById?subscriptionId=${id}`,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return response;
};

export const getDataSubByCrId = async (crId) => {
  const response = await axios({
    method: "GET",
    url: `${API_BASE_URL_FOR_CHANGE}/${API_BASE_ENDPOINT}/getChangeRequestById?crId=${crId}`,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return response;
};

export const getDataById = (id) => {
  return async (dispatch) => {
    try {
      const response = await getDataSubById(id);
      dispatch({
        type: DATA_BY_ID,
        payload: {
          dataById: response.data.subscriptionManagement,
          errorMsg: "",
        },
      });
      dispatch({
        type: BUSINESS_REQUIREMENTS,
        payload: response.data.subscriptionManagement,
      });
    } catch (error) {
      dispatch({
        type: DATA_BY_ID,
        payload: {
          dataById: {},
          errorMsg: error.message,
        },
      });
    }
  };
};

export const getDataByCrId = (CrId) => {
  return async (dispatch) => {
    try {
      const response = await getDataSubByCrId(CrId);
      dispatch({
        type: DATA_BY_ID,
        payload: {
          dataById: JSON.parse(response.data.changeRequest.crRequest),
          errorMsg: "",
        },
      });
      dispatch({
        type: BUSINESS_REQUIREMENTS,
        payload: response.data.subscriptionManagement,
      });
    } catch (error) {
      dispatch({
        type: DATA_BY_ID,
        payload: {
          dataById: {},
          errorMsg: error.message,
        },
      });
    }
  };
};

export const approveReject = (values) => {
  return async (dispatch) => {
    const val = { ...values, lastUpdatedBy: localStorage.getItem("psid") };
    delete val.createdBy;
    const response = await axios({
      method: "PUT",
      url: `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/updateSubscription`,
      data: val,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response;
  };
};

export const unsubscribe = async (values) => {
  const response = await axios({
    method: "PUT",
    url: `${API_BASE_URL_FOR_SUBSCRIPTION}/${API_BASE_ENDPOINT}/updateSubscription`,
    data: values,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return response;
};

export const updateRequestAccess = (values) => {
  return async () => {
    const res = await approveReject(values);
    return res;
  };
};

export const clearStore = () => {
  return {
    type: CLEAR_STORE,
  };
};

export const deleteSubscription = async (values) => {
  let values1 = { ...values };
  values1["createdBy"] = localStorage.getItem("psid");
  try {
    const response = await axios({
      method: "DELETE",
      url: `${API_USER_SUBSCRIPTION_MANAGEMENT_URL}/${API_BASE_ENDPOINT}/deleteUserLevelSubscription`,
      data: values1,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const generatePassKey = async (id) => {
  const data = {
    subscriptionId: `${id}`,
    apiRequestJsonFormat: "createresponse",

    apiUrl: `${EDMS_ACCESS_API_ENDPOINT}/${API_BASE_ENDPOINT}/${EDMS_ACCESS_API_ACCESS_ENDPOINT}`,
    sampleResponse: "update",
    userId: localStorage.getItem("psid"),
    taskStatus: "approved",
  };
  try {
    const response = await axios({
      method: "POST",
      url: `${API_TECHNICAL_DETAILS_URL}/${API_BASE_ENDPOINT}/createTechnicalDetails`,
      data: data,
    });
    return response;
  } catch (err) {
    return err;
  }
};