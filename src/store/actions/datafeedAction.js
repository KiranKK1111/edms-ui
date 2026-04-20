import axios from "axios";
import { message } from "antd";
import {
  API_BASE_ENDPOINT,
} from "../../utils/Config";
import {
  getDataFeedById,
  getDataFeedByChangeRequestId,
} from "../services/DatafeedService";
import { API_BASE_URL_FOR_DATAFLOW, API_BASE_URL_FOR_ENTITY, API_BASE_URL_FOR_SCHEMAS } from "../../urlMappings";
export const DATAFEED_DETAILS = "DATAFEED_DETAILS";
export const DATAFEED_DELETED = "DATAFEED_DELETED";
export const DATAFEED_SUSPENDED = "DATAFEED_SUSPENDED";
export const SELECTED_DATAFEED = "SELECTED_DATAFEED";
export const DATAFEED_BY_ID = "DATAFEED_BY_ID";
export const METADATA_INFO = "METADATA_INFO";
export const METADATA_INFO_DETAIL = "METADATA_INFO_DETAIL";
export const GET_DATAFEEDS = "GET_DATAFEEDS";
export const FORM_DATA = "FORM_DATA";
export const CLEAR_FEED = "CLEAR_FEED";
export const GET_DATAFEEDS_CR_ID = "GET_DATAFEEDS_CR_ID";
export const GET_ALL_DOCUMENTS = "GET_ALL_DOCUMENTS";
export const ADD_DOCUMENTS = "ADD_DOCUMENTS";
export const UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT";
export const DELETE_DOCUMENT = "DELETE_DOCUMENT";
export const DOWNLOAD_DOCUMENT = "DOWNLOAD_DOCUMENT";
export const CONFIG_UI = "CONFIG_UI";
export const CLEAR_CONFIG = "CLEAR_CONFIG";
export const GET_SCHEMAS = "GET_SCHEMAS";
export const UPLOAD_SCHEMAS = "UPLOAD_SCHEMAS";
//============================ POSTING DATA OF NEW LICENSE TO DATABASE ==================================

export const formDataFn = (values) => {
  return {
    type: FORM_DATA,
    payload: values,
  };
};

export const configUiFn = (values, value) => {
  return {
    type: CONFIG_UI,
    payload: values,
    loading: value,
  };
};

export const getSchemas = (schemas) => {
  return {
    type: GET_SCHEMAS,
    payload: schemas,
  };
};

export const addDatafeed = (datafeed) => {
  return {
    type: "ADD_DATAFEED",
    payload: datafeed,
  };
};

export const clearFeed = () => {
  return {
    type: CLEAR_FEED,
  };
};

export const clearConfigData = () => {
  return {
    type: CLEAR_CONFIG,
  };
};

export const startAddDatafeed = (formData) => {
  const isUpdate = formData.isUpdate;
  delete formData.isUpdate;
  return async (dispatch) => {
    try {
      const response = await axios({
        method: isUpdate ? "PUT" : "POST",
        url: isUpdate
          ? `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateDataFeed`
          : `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/createDataFeed`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: {
          ...formData,
        },
      });
      return response;
    } catch (err) {
      return err;
    }
  };
};

export const checkIfRouteIsRunning = () => {
  return async (dispatch) => {
    try {
      const response = axios({
        method: "GET",
        url: `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails?page=0&size=1000000`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response;
    }
    catch (err) {
      message.error(err.message);
    }
  }
}

export const startConfigUi = (isUpdate, formData, isRouteRunning) => {
  return async () => {
    const response = await axios({
      method: isUpdate ? "PUT" : "POST",
      url: isUpdate
        ? `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/updateRoute`
        : !isRouteRunning ?
          `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/createRoute` :
          message.error(`Route is already running with routeName ${formData.routeName}`),
      headers: {
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
      data: formData,
    });
    if (response && response.data) {
      if (response.data.status == "EXCEPTION") {
        message.error(response.data.message);
      } else {
        message.success(response.data.message);
      }
    }
    return response.data.status !== "EXCEPTION" ? response : null;
  };
};

export const startConfigUiHistory = (values) => {
  return async (dispatch) => {
    try {
      const res = await axios({
        method: "POST",
        url: `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/historicloaddetails`,
        data: values,
      });
      if (res && res.data) {
        message.success(`Successfully submitted! `);
      }
      // console.log(res);
      return res;
    } catch (err) {
      message.error(err.message);
    }
  };
};

export const startConfigUiSplit = (formData) => {
  return async (dispatch) => {
    const data = new FormData();
    data.append("schema", formData.schema);
    data.append("schemaMetaData", formData.schemaMetaData);
    const config = {
      method: "POST",
      url: `${API_BASE_URL_FOR_SCHEMAS}/${API_BASE_ENDPOINT}/declareSchema`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
      data: data,
    };

    const res = await axios(config)
      .then((response) => {
        dispatch({ type: UPLOAD_SCHEMAS, payload: response.data });
        return response.data;
      })
      .catch((error) => {
        dispatch({ type: UPLOAD_SCHEMAS, payload: {} });
        return error && error.response && error.response.data;
      });
    return res;
  };
};

export const findConfigDetails = (id) => {
  return axios({
    method: "GET",
    url: `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/byDataFeedId?dataFeedId=${id}`,
    headers: {
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

export const getConfigById = (id) => {
  return async (dispatch) => {
    try {
      dispatch(configUiFn({}, true));
      const res = await axios({
        method: "GET",
        url: `${API_BASE_URL_FOR_DATAFLOW}/${API_BASE_ENDPOINT}/datafeeddetails/byDataFeedId?dataFeedId=${id}`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (res && res.data) {
        const { data } = res;
        const values = {
          dataFeedConfigurationId: data["dataFeedDetailsId"],
          configurationCreatedOn: data["created"],
          createdBy: data["createdByUserId"],
          startDate: data["start"],
          expiryDate: data["expiry"],
          cronScheduler: data["cronExpression"],
          sourceHostName: data["sourceHostName"],
          sourceProcessor: data["sourceProcessor"],
          sourcePortInteger: data["sourcePort"],
          sourceUsername: data["sourceUser"],
          sourcePasswordProperty: data["sourcePasswordProperty"],
          sourceProtocol: data["sourceProtocol"],
          sourceFolder: data["sourceFolder"],
          destinationExpression: data["destinationExpression"],
          filenameFormat: data["filePattern"],
          dataFeedId: data["dataFeedId"],
          keyLocation: data["keyLocation"],
          routeName: data["routeName"],
          lastUpdatedBy: data["lastUpdatedBy"],
          lastUpdatedOn: data["lastUpdatedOn"],
          splittingRequirement:
            data["splittingCanonicalClass"] != null &&
            data["splittingCanonicalClass"] !== ""
              ? "Yes"
              : "No",
          routeType: data["routeTypeCanonicalClass"],
          configurationStatus:
            data["isEnabled"] === true ? "Active" : "Inactive",
          proxyRequirement: data["proxyUsed"] === true ? "Yes" : "No",
          proxyHostname: data["proxyHost"],
          proxyPort: data["proxyPort"],
          filenameDateSuffix: data["fileSuffix"] == null ? "No" : "Yes",
          filenameExtension: data["fileExtension"],
          asynchronousRoute: data["isAsyncRoute"] === true ? "True" : "False",
          routeTypeCanonicalClass: data["routeTypeCanonicalClass"],
          splittingPathExpression: data["splittingPathExpression"],
          splittingSourceExpression: data["splittingSourceExpression"],
          splitterCanonicalClass: data["splittingCanonicalClass"],
          storageLocation:
            data["storageLocation"] != "" ? data["storageLocation"] : "",
          schemaId: data["schemaId"],
          emptyFilePattern: null,
          isChecksum: data["isChecksum"],
          vendorRequestConfig: data["vendorRequestConfig"]
        };
        dispatch(configUiFn(values, false));
      } else {
        dispatch(configUiFn({}, false));
      }
    } catch (err) {
      dispatch(configUiFn({}, false));
      message.error(err.message);
    }
  };
};

export const getSchemasID = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: GET_SCHEMAS, payload: {}, loading: true });
      axios
        .get(
          `${API_BASE_URL_FOR_SCHEMAS}/${API_BASE_ENDPOINT}/getSchemas?latestOnly=true`,
          {
            headers: {
              token: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        )
        .then((res) => {
          if (res.data) {
            dispatch(getSchemas(res.data));
          } else {
            dispatch(getSchemas([]));
          }
        })
        .catch((err) => {
          return err;
        });
    } catch (err) {
      message.error(err.message);
    }
  };
};

//-----------------------------Fetching Datafeed Records  *----------------------//

export const setSelectedDatafeed = (selectedDatafeed) => {
  return {
    type: SELECTED_DATAFEED,
    payload: selectedDatafeed,
  };
};
export const setDatafeeds = (datafeedList) => {
  return {
    type: GET_DATAFEEDS,
    payload: datafeedList,
  };
};

export const startGetDatafeeds = () => {
  return (dispatch) => {
    axios
      .get(`${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getDataFeeds`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        dispatch(setDatafeeds(response.data.datafeedList));
      })
      .catch((err) => {
        return err;
      });
  };
};

export const getDatafeedDetailsById = (datafeedId) => {
  return async (dispatch) => {
    try {
      await getDataFeedById(datafeedId).then((response) => {
        if (response && response.data && response.data.length > 0) {
          const datafeed = response.data[0];
          dispatch({ type: DATAFEED_DETAILS, payload: datafeed });
        } else {
          dispatch({ type: DATAFEED_DETAILS, payload: [] });
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const getDatafeedDetailsByCrId = (crId) => {
  return async (dispatch) => {
    try {
      await getDataFeedByChangeRequestId(crId).then((response) => {
        if (response && response.data && response.data) {
          const datafeed = JSON.parse(response.data.changeRequest.crRequest);
          dispatch({ type: DATAFEED_DETAILS, payload: [datafeed] });
        } else {
          dispatch({ type: DATAFEED_DETAILS, payload: [] });
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const startUpdateDataFeed = async (dataFeedData) => {
  const response = await axios({
    method: "PUT",
    url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateDataFeed`,
    headers: {
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
    data: dataFeedData,
  });
  return response;
};

export const startGetAllDocuments = () => {
  return async (dispatch) => {
    const res = axios
      .get(`${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getAllDocuments`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        dispatch({ type: GET_ALL_DOCUMENTS, payload: response.data });
        return response.data;
      })
      .catch((err) => {
        dispatch({ type: GET_ALL_DOCUMENTS, payload: [] });
        return err;
      });
    return res;
  };
};

export const startDeleteDocument = (docDid) => {
  return async (dispatch) => {
    const psid = localStorage.getItem("psid") || 1588229;
    const config = {
      method: "DELETE",
      url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/deleteDocOrURL/${docDid}/${psid}`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
    };

    const res = await axios(config)
      .then((response) => {
        dispatch({ type: DELETE_DOCUMENT, payload: response.data });
        return response.data;
      })
      .catch((error) => {
        dispatch({ type: DELETE_DOCUMENT, payload: error });
        return error;
      });
    return res;
  };
};

export const startSubmittingDocumentsOrUrl = (formData, docObjectIds) => {
  return async (dispatch) => {
    let urlLink = "";
    const data = new FormData();
    if (
      formData.docObj &&
      formData.docObj.docDisplayFilename &&
      formData.docObj.docDisplayFilename.includes("http")
    ) {
      if (docObjectIds) {
        urlLink = `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateURL`;
        data.append("newUrl", formData.docObj.newUrl);
        delete formData.docObj.newUrl;
      } else {
        urlLink = `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/uploadURL`;
      }
    } else {
      if (docObjectIds) {
        urlLink = `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateDocument`;
      } else {
        urlLink = `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/uploadDocument`;
      }
      data.append("file", formData.file);
    }

    data.append(
      "docObj",
      new Blob([JSON.stringify(formData.docObj)], {
        type: "application/json",
      })
    );

    const config = {
      method: docObjectIds ? "PUT" : "POST",
      url: urlLink,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        token: `Bearer ${localStorage.getItem("access_token")}`,
      },
      data: data,
    };

    const res = await axios(config)
      .then((response) => {
        dispatch({ type: UPLOAD_DOCUMENT, payload: response.data });
        return response.data;
      })
      .catch((error) => {
        dispatch({ type: UPLOAD_DOCUMENT, payload: {} });
        return error && error.response && error.response.data;
      });
    return res;
  };
  //return res;
};

export const startDownloadDocument = (fileName, docObjectId) => {
  return async (dispatch) => {
    const res = await axios
      .get(
        `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/downloadDocument/${docObjectId}/${fileName}`,
        {
          responseType: "blob",
          headers: {
            token: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        dispatch({ type: DOWNLOAD_DOCUMENT, payload: url });

        return "Document Downloaded Successfully!";
      })
      .catch((error) => {
        dispatch({ type: DOWNLOAD_DOCUMENT, payload: {} });
        return "Document Downloaded Error!";
      });
    return res;
  };
};

export const startCheckDocument = (fileName, docObjectId) => {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(
    `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/checkDocument/${docObjectId}/${fileName}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));

  return async (dispatch) => { };
};