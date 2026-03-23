import {
  SOURCE_CONFIG_LOADING,
  SOURCE_CONFIG_SUCCESS,
  SCHEDULER_DATA,
  SCHEDULER_INFO,
  SCHEDULER_CLEAR,
  DATA_FORMAT,
  TAB_CONFIG,
  DATA_PROTOCOL,
  TOTAL_RESPONSE,
  TAB_CONFIG_PROTO,
  PROTO_CLEAN,
  FILE_ID_STATUS,
  PROTO_ID_STATUS,
  API_REQUEST_PARAMS,
  API_RESPONSE_CONFIG,
  API_PARAMS_STATUS,
  API_CONFIG_STATUS,
} from "../actions/SourceConfigActions";

const INITIAL_STATE = {
  loading: false,
  data: {},
  schedulerData: {},
  licenseId: "",
  idExistInScheduler: false,
  dataFormat: {},
  tabConfig: {},
  dataProtocol: {},
  totalResponse: {},
  tabConfigProtocol: {},
  protoIdStatus: false,
  fileIdStatus: false,
  apiRequestParamsData: [
    {
      key: 0,
      rank: 1,
      paramType: "Dummy 123",
      parameter: "Dummy 345",
      value: "123456",
    },
  ],
  apiParamsStatus: false,
  apiResponseConfigData: [
    {
      key: 0,
      httpStatusCode: "404",
      data: "Dummy 123",
      error: "Access denied",
      errorMessage: "Access denied",
      nextAction: "Select Next Action",
    },
  ],
  apiResponseConfigStatus: false,
};

const SourceConfigReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SOURCE_CONFIG_LOADING:
      return {
        ...state,
        loading: true,
        data: {},
      };

    case SOURCE_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case SCHEDULER_DATA:
      return {
        ...state,
        schedulerData: action.payload,
      };
    case SCHEDULER_INFO:
      return {
        ...state,
        licenseId: action.licenseId,
        idExistInScheduler: action.idExistInScheduler,
      };
    case SCHEDULER_CLEAR:
      return {
        ...state,
        schedulerData: {},
        licenseId: "",
        idExistInScheduler: false,
        dataFormat: {},
        dataProtocol: {},
        apiRequestParamsData: [
          {
            key: 0,
            rank: 1,
            paramType: "Dummy 123",
            parameter: "Dummy 345",
            value: "123456",
          },
        ],
        apiResponseConfigData: [
          {
            key: 0,
            httpStatusCode: "404",
            data: "Dummy 123",
            error: "Access denied",
            errorMessage: "Access denied",
            nextAction: "Select Next Action",
          },
        ],
      };
    case DATA_FORMAT:
      return {
        ...state,
        dataFormat: action.payload,
      };
    case TAB_CONFIG:
      return {
        ...state,
        tabConfig: action.payload,
      };
    case DATA_PROTOCOL:
      return {
        ...state,
        dataProtocol: action.payload,
      };
    case TOTAL_RESPONSE:
      return {
        ...state,
        totalResponse: action.payload,
      };
    case TAB_CONFIG_PROTO:
      return {
        ...state,
        tabConfigProtocol: action.payload,
      };
    case PROTO_CLEAN:
      return {
        ...state,
        dataProtocol: {},
        apiRequestParamsData: [
          {
            key: 0,
            rank: 1,
            paramType: "Dummy 123",
            parameter: "Dummy 345",
            value: "123456",
          },
        ],
      };
    case PROTO_ID_STATUS:
      return {
        ...state,
        protoIdStatus: action.payload,
      };
    case FILE_ID_STATUS:
      return {
        ...state,
        fileIdStatus: action.payload,
      };
    case API_REQUEST_PARAMS:
      return {
        ...state,
        apiRequestParamsData: action.payload,
      };
    case API_RESPONSE_CONFIG:
      return {
        ...state,
        apiResponseConfigData: action.payload,
      };
    case API_PARAMS_STATUS:
      return {
        ...state,
        apiParamsStatus: action.payload,
      };
    case API_CONFIG_STATUS:
      return {
        ...state,
        apiResponseConfigStatus: action.payload,
      };
    default:
      return state;
  }
};

export default SourceConfigReducer;