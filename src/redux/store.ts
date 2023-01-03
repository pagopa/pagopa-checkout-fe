import { combineReducers, configureStore } from "@reduxjs/toolkit";
import securityCodeReducer from "./slices/securityCode";

const reducer = combineReducers({
  securityCode: securityCodeReducer,
});

const store = configureStore({
  reducer,
});

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
