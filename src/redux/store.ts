import { combineReducers, configureStore } from "@reduxjs/toolkit";
import checkDataReducer from "./slices/checkData";

const reducer = combineReducers({
  checkData: checkDataReducer,
});

const store = configureStore({
  reducer,
});

export default store;
export type RootState = ReturnType<typeof reducer>;
