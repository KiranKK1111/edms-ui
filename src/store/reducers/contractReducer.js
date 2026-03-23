import {
  CONTRACT_DETAILS,
  CONTRACT_DELETED,
  CONTRACT_UPDATED,
  VENDOR_CONTACTS,
  SEND_DATA,
  SAVE_FINAL_DATA,
  UPLOAD,
  SELECTED_CONTRACT,
  AGREEMENT_BY_ID,
  RESET,
} from "../actions/contractAction";
let initialState = {
  contractDetails: [],
  data: [],
  vendorContacts: [],
  saveFinalData: {},
  selectedContract: {},
  agreementById: {},
  loading: false,
  upload: [],
};

const ContractReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_CONTRACTS":
      return {
        ...state,
        data: [action.payload],
      };
    case CONTRACT_DETAILS:
      return {
        ...state,
        contractDetails: action.payload,
      };
    case SELECTED_CONTRACT:
      return {
        ...state,
        selectedContract: action.payload,
      };
    case VENDOR_CONTACTS:
      return {
        ...state,
        vendorContacts: action.payload,
      };
    case SEND_DATA:
      return {
        ...state,
        response: action.payload,
      };
    case SAVE_FINAL_DATA:
      return {
        ...state,
        saveFinalData: action.payload,
      };
    case UPLOAD:
      return {
        ...state,
        upload: action.payload,
      };
    case CONTRACT_DELETED:
      return {
        ...state,
        contractDetails: action.payload,
      };
    case CONTRACT_UPDATED:
      return {
        ...state,
        contractDetails: action.payload,
      };
    case AGREEMENT_BY_ID:
      return {
        ...state,
        agreementById: action.payload,
        loading: action.loading,
      };
    case RESET:
      return {
        ...state,
        selectedContract: {},
        contractDetails: [],
        upload: [],
        vendorContacts: [],
      };

    default:
      return state;
  }
};

export default ContractReducer;