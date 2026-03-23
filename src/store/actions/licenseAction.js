import axios from "axios";
import {
  API_BASE_ENDPOINT,
  API_LICENSE_MANAGER_URL,
  API_AGREEMENT_URL,
} from "../../utils/Config";
import {
  getLicenseById,
  getLicenseByChangeRequestId,
} from "../services/LicenseService";
import { API_BASE_URL_FOR_AGREEMENT } from "../../urlMappings";
export const LICENSE_DETAILS = "LICENSE_DETAILS";
export const LICENSE_DELETED = "LICENSE_DELETED";
export const LICENSE_SUSPENDED = "LICENSE_SUSPENDED";
export const SELECTED_LICENSE = "SELECTED_LICENSE";
export const LICENCE_RESPONSE = "LICENCE_RESPONSE";
export const CLEAN_RESPONSE = "CLEAN_RESPONSE";

//============================ POSTING DATA OF NEW LICENSE TO DATABASE ==================================

export const addLicense = (license) => {
  return {
    type: "ADD_LICENSE",
    payload: license,
  };
};

export const licenceResponse = (res) => {
  return {
    type: LICENCE_RESPONSE,
    payload: res,
  };
};

export const cleanResponse = () => {
  return {
    type: CLEAN_RESPONSE,
  };
};

export const startAddLicense = (formData) => {
  const isUpdate = formData.isUpdate;
  delete formData.isUpdate;
  return async (dispatch) => {
    try {
      const response = await axios({
        method: isUpdate ? "PUT" : "POST",
        url: isUpdate
          ? `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/updateLicense`
          : `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/createLicense`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: {
          ...formData,
        },
      });
      dispatch(licenceResponse(response.data));
      dispatch(startGetLicenses());
      return response;
    } catch (err) {
      dispatch(licenceResponse(err));
      return err;
    }
  };
};

//-----------------------------Fetching license Records  *----------------------//
export const setLicenses = (licenseList) => {
  return {
    type: "GET_LICENSES",
    payload: licenseList,
  };
};

export const setSelectedLicense = (selectedLicense) => {
  return {
    type: SELECTED_LICENSE,
    payload: selectedLicense,
  };
};

export const startGetLicenses = () => {
  return (dispatch) => {
    axios
      .get(`${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getLicenses`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        const licenseList = response.data.licenseList;
        dispatch(setLicenses(licenseList));
      })
      .catch((err) => {
        return err;
      });
  };
};

export const getLicenseDetailsById = (licenseId) => {
  return async (dispatch) => {
    try {
      await getLicenseById(licenseId).then((response) => {
        if (response && response.data && response.data.license) {
          const license = response.data.license;
          dispatch({ type: LICENSE_DETAILS, payload: license });
        } else {
          dispatch({ type: LICENSE_DETAILS, payload: [] });
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const getLicenseDetailsByCrId = (crId) => {
  return async (dispatch) => {
    try {
      await getLicenseByChangeRequestId(crId).then((response) => {
        if (response && response.data) {
          const license = JSON.parse(response.data.changeRequest.crRequest);
          dispatch({ type: LICENSE_DETAILS, payload: license });
        } else {
          dispatch({ type: LICENSE_DETAILS, payload: [] });
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const startDeleteLicense = (licenseData) => {
  return async (dispatch) => {
    await axios
      .delete(`${API_LICENSE_MANAGER_URL}/${API_BASE_ENDPOINT}/deleteLicense`, {
        data: licenseData,
      })
      .then((response) => {
        if (response.data.hasOwnProperty("errors")) {
        } else {
          dispatch({ type: LICENSE_DELETED, payload: licenseData });
          dispatch(startGetLicenses());
        }
      })
      .catch((err) => {
        return err;
      });
  };
};

export const startUpdateLicense = (licenseData) => {
  return async (dispatch) => {
    await axios
      .post(
        `${API_LICENSE_MANAGER_URL}/${API_BASE_ENDPOINT}/updateLicense`,
        licenseData,
        { headers: { token: `Bearer ${localStorage.getItem("access_token")}` } }
      )
      .then((response) => {
        if (response.data.hasOwnProperty("errors")) {
        } else {
          dispatch({ type: LICENSE_SUSPENDED, payload: licenseData });
          dispatch(startGetLicenses());
        }
      })
      .catch((error) => {
        return error;
      });
  };
};