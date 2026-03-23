import {
  BUSINESS_REQUIREMENTS,
  TERMS,
  USAGE,
  SAVE_FINAL_DATA,
  TABLE_INFO,
  SEND_DATA,
  DATA_BY_ID,
  CLEAR_STORE,
  SAVE_AS_DRAFT,
  USER_LEVEL_SUB_LIST
} from "../actions/requestAccessActions";
const initialData = {
  businessRequirements: [],
  usage: [],
  terms: false,
  clarityExist: false,
  saveFinalData: {},
  tableInfo: {},
  userLevelSubscriptionList: [],
  response: {
    loading: false,
    subscriptionId: "",
    errorMessage: "",
  },
  dataByIdResponse: {
    dataById: {},
    errorMsg: "",
  },
};

const RequestAccessReducer = (state = initialData, action) => {
  switch (action.type) {
    case BUSINESS_REQUIREMENTS:
      return {
        ...state,
        businessRequirements: [action.payload],
      };
    case USAGE:
      return {
        ...state,
        usage: [action.payload],
      };
    case TERMS:
      return {
        ...state,
        terms: action.status,
      };
    case SAVE_FINAL_DATA:
      return {
        ...state,
        saveFinalData: action.payload,
      };
    case TABLE_INFO:
      return {
        ...state,
        tableInfo: action.payload,
      };
    case SEND_DATA:
      return {
        ...state,
        response: action.payload,
      };
    case SAVE_AS_DRAFT:
      return {
        ...state,
        isSaveAsDraft: action.isSaveAsDraft
      }
    case DATA_BY_ID:
      return {
        ...state,
        dataByIdResponse: action.payload,
      };
      case USER_LEVEL_SUB_LIST:
        return {
          ...state,
          userLevelSubscriptionList: action.payload,
        };
    case CLEAR_STORE:
      return {
        ...state,
        businessRequirements: [],
        usage: [],
        terms: false,
        response: {
          loading: false,
          subscriptionId: "",
          errorMessage: "",
        }
      }
    default:
      return state;
  }
};

export default RequestAccessReducer;