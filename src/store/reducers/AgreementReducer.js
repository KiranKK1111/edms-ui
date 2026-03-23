import { CONTRACT_DETAILS } from "../actions/contractAction";
let initialState = {
  agreementById: {},
};
const AgreementReducer = (state = initialState, action) => {
  switch (action.type) {
    case CONTRACT_DETAILS:
      return {
        ...state,
        agreementById: action.payload,
      };
    default:
      return state;
  }
};

export default AgreementReducer;