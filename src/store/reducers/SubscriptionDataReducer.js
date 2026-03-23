import { ALL_SUBSCRIPTION_DATA,ALL_DATAOWNER_DATA} from "../actions/SubscriptionDataActions";

const INITIAL_DATA = {
  subscriptionList:[],
  agreementMgrBankId:null,
  loading: false,
};

const SubscriptionDataReducer = (state = INITIAL_DATA, action) => {
    switch (action.type) {
        case ALL_SUBSCRIPTION_DATA:
            return {
            ...state,
            subscriptionList: action.payload,
            loading: action.loading,
        };
        case ALL_DATAOWNER_DATA:
            return {
            ...state,
            agreementMgrBankId: action.payload,
            loading: action.loading,
        };
        default:
            return state;
    }
};

export default SubscriptionDataReducer;