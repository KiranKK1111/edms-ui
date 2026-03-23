import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter } from "react-router-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import reduxThunk from "redux-thunk";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";

import loginReducer from "./store/reducers/loginReducer";
import userProfileReducer from "./store/reducers/userProfileReducer";
import contractReducer from "./store/reducers/contractReducer";
import licenseReducer from "./store/reducers/licenseReducer";
import licenseDetaildReducer from "./store/reducers/licenseDetailsReducer";
import DataFamilyReducer from "./store/reducers/DataFamilyReducer";
import VendorReducer from "./store/reducers/VendorReducer";
import ContractManagementReducer from "./store/reducers/ContractManagementReducer";
import SourceConfigReducer from "./store/reducers/SourceConfigReducer";
import requestAccessReducer from "./store/reducers/requestAccessReducer";
import DatasetReducer from "./store/reducers/DatasetReducer";
import MyTasksReducer from "./store/reducers/MyTasksReducer";
import UserManagementReducer from "./store/reducers/UserManagementReducer";
import CatalogueReducer from "./store/reducers/CatalogueReducer";
import DatafeedReducer from "./store/reducers/DatafeedReducer";
import AgreementReducer from "./store/reducers/AgreementReducer";
import SubscriptionReducer from "./store/reducers/SubscriptionReducer";
import fileReducer from "./store/reducers/fileReducer";
import SubscriptionDataReducer from "./store/reducers/SubscriptionDataReducer";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
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
  licenseReq: licenseDetaildReducer,
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
  allSubscriptionDataList:SubscriptionDataReducer
});

const pReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(pReducer, applyMiddleware(reduxThunk));

const persistor = persistStore(store);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals()
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
