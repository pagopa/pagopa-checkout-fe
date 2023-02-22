import { combineReducers, configureStore } from "@reduxjs/toolkit";
import cardDataReducer from "./slices/cardData";

const reducer = combineReducers({
  cardData: cardDataReducer,
});

const store = configureStore({
  reducer,
});

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
