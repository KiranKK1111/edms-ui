import {
  LICENSE_DETAILS,
  USAGE,
  STORAGE,
  DATASET,
  SUPPORT,
  UPLOAD,
} from "../actions/licensedataAction";
import {
  CLEAN_RESPONSE,
} from "../actions/licenseAction";
const initialData = {
  licenseDetailsRequirements: [],
  usage: [],
  storage: [],
  dataset: [],
  support: [],
  upload: [],
};

const LicenseDetailsReducer = (state = initialData, action) => {
  switch (action.type) {
    case LICENSE_DETAILS:
      return {
        ...state,
        licenseDetailsRequirements: action.payload,
      };
    case USAGE:
      return {
        ...state,
        usage: action.payload,
      };
    case STORAGE:
      return {
        ...state,
        storage: action.payload,
      };
    case DATASET:
      return {
        ...state,
        dataset: action.payload,
      };
    case SUPPORT:
      return {
        ...state,
        support: action.payload,
      };
    case UPLOAD:
      return {
        ...state,
        upload: action.payload,
      };
    case CLEAN_RESPONSE:
      return {
        ...state,
        licenseDetailsRequirements: [],
      }
    case 'RESET':
      return initialData
    default:
      return state;
  }
};

export default LicenseDetailsReducer;