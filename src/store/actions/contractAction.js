import axios from "axios";
import {
  API_BASE_ENDPOINT,
  API_CONTRACT_MANAGEMENT_URL,
  API_AGREEMENT_URL,
} from "../../utils/Config";
import {
  getContractById,
  getContractByChangeRequestId,
} from "../services/ContractService";
import { API_BASE_URL_FOR_AGREEMENT } from "../../urlMappings";
export const CONTRACT_DETAILS = "CONTRACT_DETAILS";
export const VENDOR_CONTACTS = "VENDOR_CONTACTS";
export const SEND_DATA = "SEND_DATA";
export const SAVE_FINAL_DATA = "SAVE_FINAL_DATA";
export const UPLOAD = "UPLOAD";
export const CONTRACT_DELETED = "CONTRACT_DELETED";
export const CONTRACT_UPDATED = "CONRACT_UPDATED";
export const SELECTED_CONTRACT = "SELECTED_CONTRACT";
export const AGREEMENT_BY_ID = "AGREEMENT_BY_ID";
export const RESET = "RESET";

//-----------------------------Fetching contract Records for vendor dashboard page *----------------------//
export const setContracts = (contractList) => {
  return {
    type: "GET_CONTRACTS",
    payload: contractList,
  };
};

export const resetState = () => {
  return {
    type: RESET,
  };
};

export const startGetContracts = () => {
  return (dispatch) => {
    axios
      .get(`${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/getAgreements`, {
        headers: { token: `Bearer ${localStorage.getItem("access_token")}` },
      })
      .then((response) => {
        const contractList = response.data.agreementList;
        dispatch(setContracts(contractList));
      })
      .catch((err) => {
        return err;
      });
  };
};

export const contractDetails = (data) => {
  return {
    type: CONTRACT_DETAILS,
    payload: data,
  };
};

export const selectedContract = (data) => {
  return {
    type: SELECTED_CONTRACT,
    payload: data,
  };
};

export const vendorContacts = (data) => {
  return {
    type: VENDOR_CONTACTS,
    payload: data,
  };
};

export const saveFinalData = (values) => {
  return {
    type: SAVE_FINAL_DATA,
    payload: values,
  };
};

export const upload = (data) => {
  return {
    type: UPLOAD,
    payload: data,
  };
};

export const startUpdateAgreement = async (agreementData) => {
  const response = await axios({
    method: "PUT",
    url: `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/updateAgreement`,
    headers: {
      token: `Bearer ${localStorage.getItem("access_token")}`,
    },
    data: agreementData,
  });
  return response;
};

export const sendData = (values) => {
  const isUpdate = values.isUpdate;
  const validateMethod = values.isUpdate;
  delete values.isUpdate;

  return async (dispatch) => {
    dispatch({
      type: SEND_DATA,
      payload: {
        loading: true,
      },
    });
    try {
      const response = await axios({
        method: validateMethod ? "PUT" : "POST",
        url: isUpdate
          ? `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/updateAgreement`
          : `${API_BASE_URL_FOR_AGREEMENT}/${API_BASE_ENDPOINT}/createAgreement`,
        headers: {
          token: `Bearer ${localStorage.getItem("access_token")}`,
        },
        data: values,
      });
      dispatch({
        type: SEND_DATA,
        payload: {
          loading: false,
          subscriptionId: response.data.contractId,
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

export const getContractDetailsById = (id) => {
  return async (dispatch) => {
    try {
      await getContractById(id).then((response) => {
        if (response && response.data && response.data.agreement) {
          const contract = response.data.agreement;
          dispatch({ type: CONTRACT_DETAILS, payload: contract });
          return contract;
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const getContractDetailsByChangeRequestId = (crId) => {
  return async (dispatch) => {
    try {
      await getContractByChangeRequestId(crId).then((response) => {
        if (response && response.data && response.data.changeRequest) {
          const contract = JSON.parse(response.data.changeRequest.crRequest);
          dispatch({ type: CONTRACT_DETAILS, payload: contract });
          return contract;
        }
      });
    } catch (e) {
      return e;
    }
  };
};

export const startDeleteContract = (contractData) => {
  return async (dispatch) => {
    await axios
      .delete(
        `${API_CONTRACT_MANAGEMENT_URL}/${API_BASE_ENDPOINT}/deleteContract`,
        {
          data: contractData,
        }
      )
      .then((response) => {
        if (response.data.hasOwnProperty("errors")) {
        } else {
          dispatch({ type: CONTRACT_DELETED, payload: contractData });
          dispatch(startGetContracts());
        }
      })
      .catch((error) => {
        return error;
      });
  };
};

export const startUpdateContract = async (contractData) => {
  const response = await axios({
    method: "PUT",
    url: `${API_CONTRACT_MANAGEMENT_URL}/${API_BASE_ENDPOINT}/updateContract`,
    data: contractData,
  });
  return response;
  // return async (dispatch) => {
  //   await axios
  //     .put(
  //       `${API_CONTRACT_MANAGEMENT_URL}/${API_BASE_ENDPOINT}/updateContract`,
  //       contractData
  //     )
  //     .then((response) => {
  //       if (response.data.hasOwnProperty("errors")) {
  //       } else {
  //         dispatch({ type: CONTRACT_UPDATED, payload: contractData });
  //         dispatch(startGetContracts());
  //       }
  //     })
  //     .catch((err) => {
  //       return err;
  //     });
  // };
};