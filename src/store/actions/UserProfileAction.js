import axios from "axios";
import moment from "moment";
import { API_BASE_ENDPOINT } from "../../utils/Config";
import { LOCAL_STORAGE_ENTITLEMENT_TYPE } from "../../utils/Constants";
import { API_BASE_URL_FOR_ENTITLEMENT } from "../../urlMappings";

export const SET_USER_PROFILE = "SET_USER_PROFILE";
export const UPDATE_USER_PROFILE = "UPDATE_USER_PROFILE";
export const REMOVE_USER_PROFILE = "REMOVE_USER_PROFILE";
export const LOAD_USER_PROFILE = "LOAD_USER_PROFILE";

export const startGetUserProfile = (psid) => {
  return async (dispatch) => {
    await axios
      .get(`${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/getUserProfile`)
      .then((response) => {
        const userData = response.data.userProfile.find(
          (ele) => Number(ele.psId) === Number(psid)
        );
        if (!userData) {
          const Profile = {
            psId: psid,
            entitlementType: localStorage.getItem(
              LOCAL_STORAGE_ENTITLEMENT_TYPE
            ),
            lastLogin: moment().format(),
            firstLogin: moment().format(),
            newSubscriptions: "Y",
            systemMessages: "Y",
          };

          dispatch(AddUserProfile(Profile));
        } else {
          dispatch(UpdateUserProfile(userData));
        }
      })
      .catch((error) => {
        return error.message;
      });
  };
};

export const startLoadUserProfile = (psid) => {
  return async (dispatch) => {
    await axios
      .get(`${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/getUserProfile`)
      .then((response) => {
        const respData = response.data.userProfile;
        const userData = respData.filter(
          (ele) => Number(ele.psId) === Number(psid)
        );
        if (userData) {
          dispatch({ type: LOAD_USER_PROFILE, payload: userData });
        }
      })
      .catch((error) => {
        return error.message;
      });
  };
};

export const AddUserProfile = (Profile) => {
  return async (dispatch) => {
    await axios
      .post(
        `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/createUserProfile`,
        Profile
      )
      .then((response) => {
        dispatch({ type: SET_USER_PROFILE, payload: Profile });
      })
      .catch((error) => {
        return error;
      });
  };
};

export const UpdateUserProfile = (userData) => {
  const Profile1 = {
    psId: userData.psId,
    entitlementType: userData.entitlementType,
    
    lastLogin: moment().format(),
    firstLogin: userData.firstLogin,
    newSubscriptions: userData.newSubscriptions,
    systemMessages: userData.systemMessages,
  };

  return async (dispatch) => {
    await axios
      .put(
        `${API_BASE_URL_FOR_ENTITLEMENT}/${API_BASE_ENDPOINT}/updateUserProfile`,
        Profile1
      )
      .then((response) => {
        dispatch({ type: UPDATE_USER_PROFILE, payload: Profile1 });
      })
      .catch((error) => {
        if (error.response) {
          return error.response;
        }
      });
  };
};

export const startRemoveUserProfile = (psid) => {
  return async (dispatch) => {
    try {
      dispatch({ type: REMOVE_USER_PROFILE });
    } catch (e) {
      return e;
    }
  };
};