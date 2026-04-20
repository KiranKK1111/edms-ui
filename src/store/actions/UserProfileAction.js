import axios from "axios";
import moment from "moment";
import { API_BASE_ENDPOINT } from "../../utils/Config";
import { API_BASE_URL_FOR_ENTITLEMENT } from "../../urlMappings";

export const SET_USER_PROFILE = "SET_USER_PROFILE";
export const UPDATE_USER_PROFILE = "UPDATE_USER_PROFILE";
export const REMOVE_USER_PROFILE = "REMOVE_USER_PROFILE";
export const LOAD_USER_PROFILE = "LOAD_USER_PROFILE";

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