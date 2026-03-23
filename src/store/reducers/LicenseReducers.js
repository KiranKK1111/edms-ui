import { LICENSE_LIST_LOADING, LICENSE_LIST_SUCCESS, LICENSE_LOADING, LICENSE_SUCCESS, LICENSE_DETAILS } from "../actions/LicenseActions";
const initialState = {
  data: [],
  list: [],
};

const LicenseReducer = (state = initialState, action) => {

  switch (action.type) {
    case "ADD_LICENSE":
      return {
        data: [action.payload],
      };

    case "GET_LICENSES":
      return {
        ...state,
        data: [action.payload],
        licenseList: [action.payload],
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
        data: []
      };

    case LICENSE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload
      };

    case LICENSE_LIST_LOADING:
      return {
        ...state,
        loading: true,
        list: []
      };

    case LICENSE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload
      };
    case 'RESET':
        return initialState;

    default:
      return state;
  }
};

export default LicenseReducer;