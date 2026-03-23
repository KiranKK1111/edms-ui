import { ALL_SUBSCRIPTION_LIST } from "../actions/CatalogPageActions";
const INITIAL_DATA = {
  allSubscriptionList:[],
  loading: false,
};

const SubscriptionReducer = (state = INITIAL_DATA, action) => {
    switch (action.type) {
        case ALL_SUBSCRIPTION_LIST:
            return {
            ...state,
            allSubscriptionList: action.payload,
            loading: action.loading,
        };
        default:
            return state;
    }
};

export default SubscriptionReducer;