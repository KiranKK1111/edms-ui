import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import reduxThunk from "redux-thunk";

import loginReducer from "./reducers/loginReducer";
import userProfileReducer from "./reducers/userProfileReducer";
import contractReducer from "./reducers/contractReducer";
import licenseReducer from "./reducers/licenseReducer";
import licenseDetailsReducer from "./reducers/licenseDetailsReducer";
import DataFamilyReducer from "./reducers/DataFamilyReducer";
import VendorReducer from "./reducers/VendorReducer";
import ContractManagementReducer from "./reducers/ContractManagementReducer";
import SourceConfigReducer from "./reducers/SourceConfigReducer";
import requestAccessReducer from "./reducers/requestAccessReducer";
import DatasetReducer from "./reducers/DatasetReducer";
import MyTasksReducer from "./reducers/MyTasksReducer";
import UserManagementReducer from "./reducers/UserManagementReducer";
import CatalogueReducer from "./reducers/CatalogueReducer";
import DatafeedReducer from "./reducers/DatafeedReducer";
import AgreementReducer from "./reducers/AgreementReducer";
import SubscriptionReducer from "./reducers/SubscriptionReducer";
import fileReducer from "./reducers/fileReducer";
import SubscriptionDataReducer from "./reducers/SubscriptionDataReducer";

const persistConfig = {
  key: "localPersist",
  storage,
  whitelist: ["userProfile", "vendor", "contract", "license", "catalogueList"],
};

const rootReducer = combineReducers({
  login: loginReducer,
  userProfile: userProfileReducer,
  contract: contractReducer,
  license: licenseReducer,
  licenseReq: licenseDetailsReducer,
  fileUpload: fileReducer,
  vendor: VendorReducer,
  contractManagement: ContractManagementReducer,
  sourceConfig: SourceConfigReducer,
  dataFamily: DataFamilyReducer,
  requestAccess: requestAccessReducer,
  dataset: DatasetReducer,
  myTasks: MyTasksReducer,
  UserManagement: UserManagementReducer,
  catalogueList: CatalogueReducer,
  datafeedInfo: DatafeedReducer,
  agreement: AgreementReducer,
  allSubscriptionList: SubscriptionReducer,
  allSubscriptionDataList: SubscriptionDataReducer,
});

// Only wire the Redux DevTools enhancer outside production. In production the
// DevTools extension serializes every dispatched action + the whole state tree
// on each change, which is pure overhead for end users.
const composeEnhancers =
  process.env.NODE_ENV !== "production" &&
  typeof window !== "undefined" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(
  persistReducer(persistConfig, rootReducer),
  composeEnhancers(applyMiddleware(reduxThunk))
);

const persistor = persistStore(store);

export { store, persistor };
export default store;
