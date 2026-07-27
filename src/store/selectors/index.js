import createMemoSelector from "./createMemoSelector";

/*
  Centralised selectors. Importing from a single barrel keeps consumers
  decoupled from store shape; later refactors only touch this file.

  Memoization rules:
    - Direct passthrough selectors (state.x.y) do NOT need memoization;
      useSelector already does reference equality.
    - Derived collections / mapped values DO need it, otherwise every
      render returns a new array reference and forces re-render downstream.
*/

/* ---------- Catalogue ---------- */
const catalogueSlice = (state) => state.catalogueList;

export const selectCatalogueState = catalogueSlice;

export const selectCatalogueList = createMemoSelector(
  [catalogueSlice],
  (slice) => (slice && slice.catalogueList) || []
);

export const selectCatalogueLoading = (state) =>
  Boolean(state.catalogueList && state.catalogueList.loading);

export const selectVisibleCatalogueList = createMemoSelector(
  [selectCatalogueList],
  (list) =>
    list.filter(
      (item) =>
        item.dataFeedStatus &&
        item.dataFeedStatus.toLowerCase() !== "deleted"
    )
);

/* ---------- Vendor ---------- */
const vendorSlice = (state) => state.vendor;

export const selectVendorState = vendorSlice;

export const selectVendorList = createMemoSelector(
  [vendorSlice],
  (vendor) => (vendor && vendor.list) || []
);

export const selectVendorLoading = (state) =>
  Boolean(state.vendor && state.vendor.loading);

export const selectActivePendingVendors = createMemoSelector(
  [selectVendorList],
  (list) =>
    list.filter((entity) => {
      const status = entity?.entityStatus?.toLowerCase?.();
      return status === "active" || status === "pending";
    })
);

export const selectInactiveVendors = createMemoSelector(
  [selectVendorList],
  (list) =>
    list.filter(
      (entity) => entity?.entityStatus?.toLowerCase?.() === "inactive"
    )
);

/* ---------- Datasets / Datafeeds ---------- */
export const selectDatasetsInfo = (state) =>
  (state.dataset && state.dataset.datasetsInfo) || null;

export const selectDatafeedsInfo = (state) =>
  (state.datafeedInfo && state.datafeedInfo.datafeedsData) || null;

/* ---------- Contracts ---------- */
export const selectContractData = (state) =>
  (state.contract && state.contract.data) || null;

/* ---------- My Tasks ---------- */
const myTasksSlice = (state) => state.myTasks;

export const selectMyTasksList = createMemoSelector(
  [myTasksSlice],
  (slice) => (slice && slice.list) || []
);

export const selectMyTasksPending = createMemoSelector(
  [myTasksSlice],
  (slice) => (slice && slice.pendingList) || []
);

export const selectMyTasksCompleted = createMemoSelector(
  [myTasksSlice],
  (slice) => (slice && slice.completedList) || []
);

export const selectMyTasksCount = (state) =>
  (state.myTasks && state.myTasks.data) || {};

/* ---------- User Profile / Login ---------- */
export const selectUserProfile = (state) =>
  (state.userProfile && state.userProfile.data) || null;

export const selectLoginState = (state) => state.login;

/* ---------- Subscriptions ---------- */
export const selectAllSubscriptionList = (state) =>
  state.allSubscriptionList || null;

export const selectAllSubscriptionDataList = (state) =>
  state.allSubscriptionDataList || null;

export { createMemoSelector };
