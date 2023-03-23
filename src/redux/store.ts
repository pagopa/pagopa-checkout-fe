import { combineReducers, configureStore } from "@reduxjs/toolkit";
import cardDataReducer from "./slices/cardData";
import thresholdReducer from "./slices/threshold";

const { CHECKOUT_ENV } = process.env;

const reducer = combineReducers({
  cardData: cardDataReducer,
  threshold: thresholdReducer,
});

const store = configureStore({
  reducer,
  devTools: CHECKOUT_ENV !== "PROD",
});

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
