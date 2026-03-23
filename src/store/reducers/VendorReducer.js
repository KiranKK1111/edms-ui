import {
  VENDOR_LOADING,
  VENDOR_SUCCESS,
  ADD_VENDORS,
  VENDOR_LIST_LOADING,
  VENDOR_LIST_SUCCESS,
  GET_VENDORS,
  DELETE_VENDORS,
} from "../actions/VendorActions.js";


const INITIAL_STATE = {
  loading: false,
  data: {},
  list: [],
};

const VendorReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case VENDOR_LOADING:
      return {
        ...state,
        loading: true,
        data: {},
      };

    case VENDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };

    case VENDOR_LIST_LOADING:
      return {
        ...state,
        loading: true,
        list: [],
      };

    case VENDOR_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };
    case ADD_VENDORS:
      return {
        ...state,
        loading: false,
        list: state.list.contact(action.payload),
      };
    case GET_VENDORS:
      return {
        ...state,
        loading: action.loading,
        list: action.payload,
      };
    case DELETE_VENDORS: {
      return {
        ...state,
        list: state.list.map((ele) => {
          if (ele.vendorId === action.payload.vendorId) {
            return { ...ele, taskStatus: action.payload.taskStatus };
          } else {
            return ele;
          }
        }),
      };
    }
    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default VendorReducer;