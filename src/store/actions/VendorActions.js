import axios from "axios";
import {
  getVendorById,
  getVendorByChangeRequestId,
} from "../services/VendorService";
import {
  API_BASE_ENDPOINT,
  API_VENDOR_URL,
  API_DATA_ENTITY_URL,
} from "../../utils/Config";
import { API_BASE_URL_FOR_ENTITY } from "../../urlMappings";

export const VENDOR_LOADING = "VENDOR_LOADING";
export const VENDOR_SUCCESS = "VENDOR_SUCCESS";
export const VENDOR_LIST_LOADING = "VENDOR_LIST_LOADING";
export const VENDOR_LIST_SUCCESS = "VENDOR_LIST_SUCCESS";
export const GET_VENDORS = "GET_VENDORS";
export const DELETE_VENDORS = "DELETE_VENDORS";
export const ADD_VENDORS = "ADD_VENDORS";

export const saveLocalData = (data) => {
  return (dispatch) => {
    dispatch({ type: VENDOR_SUCCESS, payload: data });
  };
};

export const setVendors = (vendorList, isLoading) => {
  return {
    type: GET_VENDORS,
    payload: vendorList,
    loading: isLoading,
  };
};

export const startGetVendors = (isMasterData) => {
  return (dispatch) => {
    //Set loading to 'true' if master Data tab clicked
    if (isMasterData && isMasterData === true) {
      dispatch(setVendors([], true));
    }

    return axios
      .get(`${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/getEntities`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        const vendorList = response.data.entityManagementList;
        //set loading to 'false' after response is fetched
        dispatch(setVendors(vendorList, false));
        return response;
      })
      .catch((error) => {
        if (error && error.response && error.response.status === 404) {
          const vendorList = [];
          dispatch(setVendors(vendorList));
        }
        return error;
      });
  };
};

export const addVendors = (vendorList) => {
  return {
    type: ADD_VENDORS,
    payload: vendorList,
  };
};

export const startAddVendor = (formData) => {
  const status = formData.isUpdate ? "updateEntity" : "createEntity";

  return async (dispatch) => {
    try {
      const response = await axios({
        method: "POST",
        url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/${status}`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: formData,
      });
      return response;
    } catch (err) {
      return err;
    }
  };
};

export const startUpdateEntity = async (entityData) => {
  const response = await axios({
    method: "PUT",
    url: `${API_BASE_URL_FOR_ENTITY}/${API_BASE_ENDPOINT}/updateEntity`,
    headers: {
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
    data: entityData,
  });
  return response;
};

export const getVendorDetailsById = (entityId) => {
  return async (dispatch) => {
    try {
      await getVendorById(entityId).then((response) => {
        if (response && response.data && response.data.entityManagement) {
          const vendor = response.data.entityManagement;
          dispatch({ type: VENDOR_SUCCESS, payload: vendor });
        } else {
          dispatch({ type: VENDOR_SUCCESS, payload: [] });
        }
      });
    } catch (error) {
      return error;
    }
  };
};

export const getDetailsByChangeRequestId = (crId) => {
  return async (dispatch) => {
    try {
      await getVendorByChangeRequestId(crId).then((response) => {
        if (response && response.data && response.data.changeRequest) {
          const vendor = JSON.parse(response.data.changeRequest.crRequest);
          dispatch({ type: VENDOR_SUCCESS, payload: vendor });
        } else {
          dispatch({ type: VENDOR_SUCCESS, payload: [] });
        }
      });
    } catch (error) {
      return error;
    }
  };
};

export const deleteVendors = (updateTaskStatus) => {
  return {
    type: DELETE_VENDORS,
    payload: updateTaskStatus,
  };
};

export const startDeleteVendor = (vendorData) => {
  return async (dispatch) => {
    await axios
      .delete(`${API_VENDOR_URL}/${API_BASE_ENDPOINT}/deleteVendor`, {
        data: vendorData,
      })
      .then((response) => {
        if (response.data.hasOwnProperty("errors")) {
          alert("You have errors in deleting records : ", response.data);
        } else {
          vendorData.taskStatus = "pending";
          dispatch(deleteVendors(vendorData));
          return vendorData;
        }
      })
      .catch((error) => {
        return error;
      });
  };
};