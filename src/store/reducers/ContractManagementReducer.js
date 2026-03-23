import {
  CONTRACT_MANAGEMENT_LIST_LOADING,
  CONTRACT_MANAGEMENT_LIST_SUCCESS,
  CONTRACT_MANAGEMENT_LOADING,
  CONTRACT_MANAGEMENT_SUCCESS,
} from "../actions/ContractManagementActions";
import { AGREEMENT_BY_ID } from "../actions/contractAction";

const INITIAL_STATE = {
  loading: false,
  data: {},
  list: [],
};

const ContractManagementReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "GET_CONTRACTS":
      return {
        data: [action.payload],
      };

    case CONTRACT_MANAGEMENT_LOADING:
      return {
        ...INITIAL_STATE,
        loading: true,
      };

    case CONTRACT_MANAGEMENT_SUCCESS:
      return {
        ...INITIAL_STATE,
        data: action.payload,
      };

    case CONTRACT_MANAGEMENT_LIST_LOADING:
      return {
        ...INITIAL_STATE,
        loading: true,
      };

    case CONTRACT_MANAGEMENT_LIST_SUCCESS:
      return {
        ...INITIAL_STATE,
        list: action.payload,
      };
    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default ContractManagementReducer;