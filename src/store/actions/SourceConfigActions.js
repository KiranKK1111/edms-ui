import axios from "axios";
import delayAdapterEnhancer from "axios-delay";
import {
  API_RECURRENCE_SCHEDULER_URL,
  API_FILE_FORMAT_URL,
  API_BASE_ENDPOINT,
} from "../../utils/Config";

export const SOURCE_CONFIG_LOADING = "SOURCE_CONFIG_LOADING";
export const SOURCE_CONFIG_SUCCESS = "SOURCE_CONFIG_SUCCESS";
export const SCHEDULER_DATA = "SCHEDULER_DATA";
export const SCHEDULER_INFO = "SCHEDULER_INFO";
export const SCHEDULER_CLEAR = "SCHEDULER_CLEAR";
export const DATA_FORMAT = "DATA_FORMAT";
export const TAB_CONFIG = "TAB_CONFIG";
export const DATA_PROTOCOL = "DATA_PROTOCOL";
export const TOTAL_RESPONSE = "TOTAL_RESPONSE";
export const TAB_CONFIG_PROTO = "TAB_CONFIG_PROTO";
export const PROTO_CLEAN = "PROTO_CLEAN";
export const FILE_ID_STATUS = "FILE_ID_STATUS";
export const PROTO_ID_STATUS = "PROTO_ID_STATUS";
export const API_REQUEST_PARAMS = "API_REQUEST_PARAMS";
export const API_RESPONSE_CONFIG = "API_RESPONSE_CONFIG";
export const API_PARAMS_STATUS = "API_PARAMS_STATUS";
export const API_CONFIG_STATUS = "API_CONFIG_STATUS";

export const fileIdStatusInfo = (status) => {
  return {
    type: FILE_ID_STATUS,
    payload: status,
  };
};
export const protoIdStatusInfo = (status) => {
  return {
    type: PROTO_ID_STATUS,
    payload: status,
  };
};
export const loadSourceConfigData = (licenseId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: SOURCE_CONFIG_LOADING });
      dispatch({ type: SOURCE_CONFIG_SUCCESS, payload: "" });
    } catch (err) {
      return err;
    }
  };
};

export const schedulerData = (data) => {
  return {
    type: SCHEDULER_DATA,
    payload: data,
  };
};
export const schedulerClear = () => {
  return {
    type: SCHEDULER_CLEAR,
  };
};
export const schedulerInfo = (id, exist) => {
  return {
    type: SCHEDULER_INFO,
    licenseId: id,
    idExistInScheduler: exist,
  };
};
export const dataFormatInfo = (data) => {
  return {
    type: DATA_FORMAT,
    payload: data,
  };
};
export const tabConfigInfo = (data) => {
  return {
    type: TAB_CONFIG,
    payload: data,
  };
};
export const dataProtocolInfo = (data) => {
  return {
    type: DATA_PROTOCOL,
    payload: data,
  };
};
export const totalResponseInfo = (data) => {
  return {
    type: TOTAL_RESPONSE,
    payload: data,
  };
};
export const tabConfigProtoInfo = (data) => {
  return {
    type: TAB_CONFIG_PROTO,
    payload: data,
  };
};
export const ptotoCleanInfo = () => {
  return {
    type: PROTO_CLEAN,
  };
};
export const apiRequestParamsInfo = (data) => {
  return {
    type: API_REQUEST_PARAMS,
    payload: data,
  };
};
export const apiResponseConfigInfo = (data) => {
  return {
    type: API_RESPONSE_CONFIG,
    payload: data,
  };
};
export const apiParamsStatusInfo = (data) => {
  return {
    type: API_PARAMS_STATUS,
    payload: data,
  };
};
export const apiConfigStatusInfo = (data) => {
  return {
    type: API_CONFIG_STATUS,
    payload: data,
  };
};
export const schedulerDatabase = async (values) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_RECURRENCE_SCHEDULER_URL}/${API_BASE_ENDPOINT}/getRecurrenceScheduler`,
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
export const dataProtocolDatabase = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/getSourceConfig`,
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

export const dataProtocolById = async (id) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/getSourceConfigById/licenseId/${id}`,
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

export const fileFormatDatabase = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/getFileFormatConfig`,
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
export const apiRequestParamsAllData = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/getApiRequestParams`,
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
export const apiSourceConfigAllData = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/getApiResponseConfig`,
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
export const recurrenceScheduler = async (values, idExistInScheduler) => {
  const createUpdate = idExistInScheduler
    ? "updateRecurrenceScheduler"
    : "createRecurrenceScheduler";
  const api = axios.create({
    adapter: delayAdapterEnhancer(axios.defaults.adapter),
  });

  try {
    const response = await api({
      method: idExistInScheduler ? "PUT" : "POST",
      url: `${API_RECURRENCE_SCHEDULER_URL}/${API_BASE_ENDPOINT}/${createUpdate}`,
      data: values,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      delay: 2500,
    });

    return response;
  } catch (err) {
    return err;
  }
};
export const fileFormatData = async (values, fileIdStatus) => {
  const createUpdate = fileIdStatus
    ? "updateFileFormatConfig"
    : "createFileFormatConfig";

  try {
    const response = await axios({
      method: fileIdStatus ? "PUT" : "POST",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/${createUpdate}`,
      data: values,
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
export const dataProtocolData = async (values, protoIdStatus) => {
  const createUpdate = protoIdStatus
    ? "updateSourceConfig"
    : "createSourceConfig";

  try {
    const response = await axios({
      method: protoIdStatus ? "PUT" : "POST",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/${createUpdate}`,
      data: values,
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
export const apiRequestParamsDatabase = async (values, apiParamsStatus) => {
  const createUpdate = apiParamsStatus
    ? "updateApiRequestParams"
    : "createApiRequestParams";

  try {
    const response = await axios({
      method: apiParamsStatus ? "PUT" : "POST",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/${createUpdate}`,
      data: values,
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

export const apiResponseConfigDatabase = async (
  values,
  apiResponseConfigStatus
) => {
  const createUpdate = apiResponseConfigStatus
    ? "updateApiResponseConfig"
    : "createApiResponseConfig";
  const api = axios.create({
    adapter: delayAdapterEnhancer(axios.defaults.adapter),
  });

  try {
    const response = await api({
      method: apiResponseConfigStatus ? "PUT" : "POST",
      url: `${API_FILE_FORMAT_URL}/${API_BASE_ENDPOINT}/${createUpdate}`,
      data: values,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      delay: 1000,
    });

    return response;
  } catch (err) {
    return err;
  }
};

export const sourceConfigAllReqs = (
  dataProtocolValues,
  protoIdStatus,
  requestParamTable,
  apiParamsStatus,
  responseConfigTable,
  apiResponseConfigStatus,
  dataFormatValues,
  fileIdStatus,
  schedulerValues,
  idExistInScheduler
) => {
  return async (dispatch) => {
    try {
      const response = await axios.all([
        dataProtocolData(dataProtocolValues, protoIdStatus),
        apiRequestParamsDatabase(requestParamTable, apiParamsStatus),
        apiResponseConfigDatabase(responseConfigTable, apiResponseConfigStatus),
        fileFormatData(dataFormatValues, fileIdStatus),
        recurrenceScheduler(schedulerValues, idExistInScheduler),
      ]);
      return response;
    } catch (err) {
      return err;
    }
  };
};