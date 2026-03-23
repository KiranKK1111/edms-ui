import { DATAFEED_DATA } from "../actions/CatalogPageActions";
import {
  DATAFEED_BY_ID,
  METADATA_INFO,
  METADATA_INFO_DETAIL,
  GET_DATAFEEDS,
  FORM_DATA,
  CLEAR_FEED,
  DATAFEED_DETAILS,
  ADD_DOCUMENTS,
  CONFIG_UI,
  CLEAR_CONFIG,
  GET_SCHEMAS,
  UPLOAD_SCHEMAS,
} from "../actions/datafeedAction";

const INITIAL_DATA = {
  allDatafeeds: [],
  datafeedById: {},
  loading: false,
  metadata: {},
  formData: {},
  datafeedsData: {},
  formAddDouments: {},
  congigUi: {},
  allSchemas: [],
  loadingConfig: false,
};

const DatafeedReducer = (state = INITIAL_DATA, action) => {
  switch (action.type) {
    case DATAFEED_DATA:
      return {
        ...state,
        allDatafeeds: action.payload,
      };
    case DATAFEED_BY_ID:
      return {
        ...state,
        datafeedById: action.payload,
        loading: action.loading,
      };
    case METADATA_INFO:
      return {
        ...state,
        metadata: action.payload,
        loading: action.loading,
      };
    case METADATA_INFO_DETAIL:
      return {
        ...state,
        metadatadetail: action.payload,
        loading: action.loading,
      };
    case FORM_DATA:
      return {
        ...state,
        formData: action.payload,
      };
    case GET_DATAFEEDS:
      return {
        ...state,
        datafeedsData: action.payload,
      };
    case DATAFEED_DETAILS:
      return {
        ...state,
        datafeedsData: action.payload,
      };
    case CLEAR_FEED:
      return {
        ...state,
        formData: {},
      };

    case ADD_DOCUMENTS:
      return {
        ...state,
        formAddDouments: action.payload,
      };

    case CONFIG_UI:
      return {
        ...state,
        congigUi: action.payload,
        loadingConfig: action.loading,
      };
    case CLEAR_CONFIG:
      return {
        ...state,
        congigUi: {},
      };
    case GET_SCHEMAS:
      return {
        ...state,
        allSchemas: action.payload,
      };
    case UPLOAD_SCHEMAS:
      return {
        ...state,
        upload: action.payload,
      };
    default:
      return state;
  }
};

export default DatafeedReducer;