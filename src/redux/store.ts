import { combineReducers, configureStore } from "@reduxjs/toolkit";
import thresholdReducer from "./slices/threshold";
import userInfoReducer from "./slices/loggedUser";

const ENV = process.env.CHECKOUT_ENV;

const reducer = combineReducers({
  threshold: thresholdReducer,
  userInfo: userInfoReducer,
});

const store = configureStore({
  reducer,
  devTools: ENV !== "PROD",
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer,
    preloadedState,
  });

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
