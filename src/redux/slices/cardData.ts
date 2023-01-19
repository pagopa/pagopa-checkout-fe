/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface CardDataState {
  pan: string;
  expDate: string;
  cardHolderName: string;
  cvv: string;
}

const initialState: CardDataState = {
  pan: "",
  expDate: "",
  cardHolderName: "",
  cvv: "",
};

export const cardDataSlice = createSlice({
  name: "cardData",
  initialState,
  reducers: {
    setCardData(
      state,
      action: PayloadAction<{
        pan: string;
        expDate: string;
        cvv: string;
        cardHolderName: string;
      }>
    ) {
      state.pan = action.payload?.pan || "";
      state.expDate = action.payload?.expDate || "";
      state.cardHolderName = action.payload?.cardHolderName || "";
      state.cvv = action.payload?.cvv || "";
    },
    resetCardData(state) {
      state.pan = "";
      state.expDate = "";
      state.cardHolderName = "";
      state.cvv = "";
    },
  },
});

export const { setCardData, resetCardData } = cardDataSlice.actions;
export default cardDataSlice.reducer;
export const selectCardData = (state: RootState) => ({
  pan: state.cardData.pan,
  expDate: state.cardData.expDate,
  cardHolderName: state.cardData.cardHolderName,
  cvv: state.cardData.cvv,
});
