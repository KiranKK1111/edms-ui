import { getAllSubscriptions } from "../services/SubscriptionService";
import { loadCatalogueData } from "../services/CatalogueService";



export const DATASET_DATA = "DATASET_DATA";
export const DATAFEED_DATA = "DATAFEED_DATA";
export const CATALOGUE_LIST = "CATALOGUE_LIST";
export const ALL_SUBSCRIPTION_LIST = "ALL_SUBSCRIPTION_LIST";

// TODO Remove this hardcoded value.
export let userId = localStorage.getItem("psid");

//------------------------ NEW CATALOGUE IMPLEMENTATION ---------------------------------

export const allSubscriptionList = () => {
  let subscriptionList = [];
  return async (dispatch) => {
    dispatch({
      type: ALL_SUBSCRIPTION_LIST,
      subscriptionList: [],
      loading: true,
    });
    try {
      const subscriptionResponse = await getAllSubscriptions();
      await subscriptionResponse().then((response) => {
        if (response && response.data && response.data.subscriptions) {
          subscriptionList = response.data.subscriptions;
        }
      });
    } catch (err) {
      subscriptionList = [];
      return false;
    }
    dispatch({
      type: ALL_SUBSCRIPTION_LIST,
      payload: subscriptionList,
      loading: false,
    });
  };
};

export const newCataloguePageData = () => {
  let catalogueList = [];
  return async (dispatch) => {
    dispatch({
      type: CATALOGUE_LIST,
      catalogueList: [],
      loading: true,
    });
    try {
      const catalogueData = await loadCatalogueData();
      await catalogueData().then((response) => {
        if (response && response.data && response.data.catalogueDetails) {
          catalogueList = response.data.catalogueDetails;
        } else {
          catalogueList = [];
          return false;
        }
      });

      const subscriptionResponse = await getAllSubscriptions();
      await subscriptionResponse().then((response) => {
        if (response && response.data && response.data.subscriptions) {
          const list = response.data.subscriptions.map((d) => {
            return {
              subscriptionId: d.subscriptionId,
              dataFeedId: d.dataFeedId,
              psid: d.subscriber,
              subscriptionStatus: d.subscriptionStatus,
              subscriptionUpdateFlag: d.subscriptionUpdateFlag,
            };
          });
          catalogueList = catalogueList.map((d) => {
            let psid = localStorage.getItem("psid");
            return {
              ...d,
              subscription: list.find(
                (u) =>
                  d.dataFeedId === u.dataFeedId &&
                  u.psid === psid &&
                  u.subscriptionStatus.toString().toLowerCase() !== "inactive"
              ),
            };
          });
        }
      });
    } catch (err) {
      catalogueList = [];
      return false;
    }
    dispatch({
      type: CATALOGUE_LIST,
      payload: catalogueList,
      loading: false,
    });
  };
};
