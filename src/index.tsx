import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ThemeContextProvider } from "./components/themeContextProvider/themeContextProvider";
import { App } from "./App";
import store from "./redux/store";

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);
