/* eslint-disable functional/immutable-data */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface SecurityCodeState {
  cvv: string;
}

const initialState: SecurityCodeState = {
  cvv: "",
};

const securityCodeSlice = createSlice({
  name: "securityCode",
  initialState,
  reducers: {
    setSecurityCode(state, action: PayloadAction<string>) {
      state.cvv = action.payload || "";
    },
    resetSecurityCode(state) {
      state.cvv = "";
    },
  },
});

export const { setSecurityCode, resetSecurityCode } = securityCodeSlice.actions;
export default securityCodeSlice.reducer;
export const selectSecurityCode = (state: RootState) => state.securityCode.cvv;
