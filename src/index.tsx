import React from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import store from "./redux/store";

const root = createRoot(document.getElementById("root")!); // createRoot(container!) if you use TypeScript

root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
