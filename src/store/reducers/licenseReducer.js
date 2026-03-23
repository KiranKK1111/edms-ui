import {
  LICENSE_LIST_LOADING,
  LICENSE_LIST_SUCCESS,
  LICENSE_LOADING,
  LICENSE_SUCCESS,
  LICENSE_DETAILS,
  LICENSE_BY_ID,
} from "../actions/LicenseActions";
import {
  LICENSE_DELETED,
  LICENSE_SUSPENDED,
  SELECTED_LICENSE,
  LICENCE_RESPONSE,
  CLEAN_RESPONSE,
} from "../actions/licenseAction";

const initialState = {
  data: [],
  list: [],
  selectedLicense: {},
  licenseList: [],
  licenseById: {},
  loading: false,
  response: {},
};

const LicenseReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_LICENSE":
      return {
        data: [action.payload],
      };
    case SELECTED_LICENSE:
      return {
        ...state,
        selectedLicense: action.payload,
      };
    case "GET_LICENSES":
      return {
        ...state,
        data: [action.payload],
        licenseList: [action.payload],
      };
    case LICENCE_RESPONSE:
      return {
        response: action.payload,
      };
    case LICENSE_DETAILS:
      return {
        ...state,
        data: [action.payload],
      };

    case LICENSE_LOADING:
      return {
        ...state,
        loading: true,
        data: [],
      };

    case LICENSE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };

    case LICENSE_LIST_LOADING:
      return {
        ...state,
        loading: true,
        list: [],
      };

    case LICENSE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case CLEAN_RESPONSE:
      return {
        ...state,
        response: {},
      };

    case LICENSE_DELETED:
      return {
        ...state,
        data: action.payload,
      };

    case LICENSE_SUSPENDED:
      return {
        ...state,
        data: action.payload,
      };

    case "RESET":
      return initialState;
    case LICENSE_BY_ID:
      return {
        ...state,
        licenseById: action.payload,
        loading: action.loading,
      };

    default:
      return state;
  }
};

export default LicenseReducer;