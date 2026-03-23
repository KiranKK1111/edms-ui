import {
  SUBSCRIPTION_TAB_INFO,
  SUBSCRIBERS,
  GET_DATASETS,
} from "../actions/DatasetPageActions";
import { DATASET_FORM, CLEAR_DATASET } from '../actions/datasetFormActions';

const initialData = {
  subscriptionInfo: {
    status: null,
    data: {},
    errors: "",
  },
  subscribers: {
    data: {},
    errors: "",
  },
  allDatasets: [],
  formData: {},
  datasetsInfo: []
};

const DatasetReducer = (state = initialData, action) => {
  switch (action.type) {
    case SUBSCRIPTION_TAB_INFO:
      return {
        ...state,
        subscriptionInfo: action.payload,
      };
    case SUBSCRIBERS:
      return {
        ...state,
        subscribers: action.payload,
      };
    case GET_DATASETS:
      return {
        ...state,
        datasetsInfo: action.payload,
      };
    case DATASET_FORM:
      return {
        ...state,
        formData: action.payload,
      }
    case CLEAR_DATASET:
      return {
        ...state,
        formData: {},
      }
    default:
      return state;
  }
};

export default DatasetReducer;