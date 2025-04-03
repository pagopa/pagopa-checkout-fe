import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux-typefix";
import { App } from "./App";
import store from "./redux/store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
