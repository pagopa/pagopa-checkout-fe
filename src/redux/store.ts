import { combineReducers, configureStore } from "@reduxjs/toolkit";
import securityCodeReducer from "./slices/securityCode";
import cardDataReducer from "./slices/cardData";
import paymentMethodReducer from "./slices/paymentMethod";

const reducer = combineReducers({
  securityCode: securityCodeReducer,
  cardData: cardDataReducer,
  paymentMethod: paymentMethodReducer,
});

const store = configureStore({
  reducer,
});

export default store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
