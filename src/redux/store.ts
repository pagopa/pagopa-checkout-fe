import { combineReducers, configureStore } from "@reduxjs/toolkit";
import thresholdReducer from "./slices/threshold";
import formaDataReducer from "./slices/formData";

const ENV = process.env.CHECKOUT_ENV;

const reducer = combineReducers({
  threshold: thresholdReducer,
  formaData: formaDataReducer,
});

const store = configureStore({
  reducer,
  devTools: ENV !== "PROD",
});

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
