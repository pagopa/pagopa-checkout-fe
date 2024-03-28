/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CreateSessionResponse } from "../../../generated/definitions/payment-ecommerce/CreateSessionResponse";
import { RootState } from "../store";

interface FormData {
  data?: CreateSessionResponse;
}

const initialState: FormData = {
  data: undefined,
};

export const formDataSlice = createSlice({
  name: "formData",
  initialState,
  reducers: {
    setFormData(
      state,
      action: PayloadAction<{
        formData: CreateSessionResponse;
      }>
    ) {
      state.data = JSON.parse(JSON.stringify(action.payload.formData));
    },
    resetFormData(state) {
      state.data = undefined;
    },
  },
});

export const { setFormData, resetFormData } = formDataSlice.actions;
export default formDataSlice.reducer;

export const selectFormData = (state: RootState) => state.formaData;
