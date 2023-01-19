/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface PaymentMethodState {
  paymentMethodId: string;
  pspSelected: { code: string; fee: number; businessName: string };
}

const initialState: PaymentMethodState = {
  paymentMethodId: "",
  pspSelected: { code: "", fee: 0, businessName: "" },
};

export const paymentMethodSlice = createSlice({
  name: "paymentMethod",
  initialState,
  reducers: {
    setPaymentMethodId(state, action: PayloadAction<string>) {
      state.paymentMethodId = action.payload || "";
    },
    resetPaymentMethodId(state) {
      state.paymentMethodId = "";
    },
    setPspSelected(
      state,
      action: PayloadAction<{ code: string; fee: number; businessName: string }>
    ) {
      state.pspSelected = action.payload;
    },
    resetPspSelected(state) {
      state.pspSelected = { code: "", fee: 0, businessName: "" };
    },
  },
});

export const {
  setPaymentMethodId,
  resetPaymentMethodId,
  setPspSelected,
  resetPspSelected,
} = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;
export const selectPaymentMethodId = (state: RootState) =>
  state.paymentMethod.paymentMethodId;
export const selectPspSelected = (state: RootState) =>
  state.paymentMethod.pspSelected;
