import {
  DATA_FAMILY_LIST_LOADING,
  DATA_FAMILY_LIST_SUCCESS,
  DATA_FAMILY_LOADING,
  DATA_FAMILY_SUCCESS,
  DATA_FAMILY_FILTERED_LIST,
  DATASET_BY_ID,
} from "../actions/DataFamilyActions";

const INITIAL_STATE = {
  loading: false,
  data: {},
  list: [],
  filteredList: [],
  datasetById: {},
};

const DataFamilyReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case DATA_FAMILY_LOADING:
      return {
        ...state,
        loading: true,
        data: {},
      };

    case DATA_FAMILY_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };

    case DATA_FAMILY_LIST_LOADING:
      return {
        ...state,
        loading: true,
        list: [],
      };

    case DATA_FAMILY_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
      };

    case DATA_FAMILY_FILTERED_LIST:
      return {
        ...state,
        loading: false,
        filteredList: action.payload,
      };
    case DATASET_BY_ID:
      return {
        ...state,
        datasetById: action.payload,
        loading: action.loading,
      };
    default:
      return state;
  }
};

export default DataFamilyReducer;