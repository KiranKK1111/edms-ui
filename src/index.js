import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";

import "./design-system/tokens.css";
import "./design-system/utilities.css";
import "./index.css";

import App from "./App";
import { AppProviders } from "./design-system";
import { store, persistor } from "./store";
import reportWebVitals from "./reportWebVitals";

const root = createRoot(document.getElementById("root"));
root.render(
  <AppProviders>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </AppProviders>
);

reportWebVitals();
