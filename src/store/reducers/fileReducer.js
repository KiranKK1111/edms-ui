import {
  FILE_DETAILS,
  DOWNLOAD,
  GET_ALL_DOCUMENTS,
  UPLOAD,
  DELETE_DOCUMENT,
} from "../actions/fileUploadAction";
import {
  DOWNLOAD_DOCUMENT,
  UPLOAD_DOCUMENT,
  ADD_DOCUMENTS,
} from "../actions/datafeedAction";
// import {
//   LICENSE_DELETED,
//   LICENSE_SUSPENDED,
//   SELECTED_LICENSE,
//   LICENCE_RESPONSE,
//   CLEAN_RESPONSE,
// } from "../actions/licenseAction";

const initialState = {
  upload: [],
  data: [],
  fileLists: [],
  list: [],
  loading: false,
  response: {},
  addDocument: {},
  deleteMessage: undefined,
  downloadMessage: undefined,
};

const FileReducer = (state = initialState, action) => {
  switch (action.type) {
    case FILE_DETAILS:
      return {
        ...state,
        data: [action.payload],
      };
    case GET_ALL_DOCUMENTS:
      return {
        ...state,
        fileLists: action.payload || [],
      };

    case ADD_DOCUMENTS:
      return {
        ...state,
        addDocument: action.payload,
      };
    case DELETE_DOCUMENT:
      return {
        ...state,
        deleteMessage: action.payload,
      };
    case DOWNLOAD_DOCUMENT:
      return {
        ...state,
        downloadMessage: action.payload,
      };
    case UPLOAD_DOCUMENT:
      return {
        ...state,
        upload: action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

export default FileReducer;