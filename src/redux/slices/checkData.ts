/* eslint-disable functional/immutable-data */
import { createSlice } from "@reduxjs/toolkit";

export const checkDataSlice = createSlice({
  name: "checkData",
  initialState: {
    amount: {
      currency: "",
      amount: 0,
      decimalDigits: 0,
    },
    bolloDigitale: false,
    fiscalCode: "",
    iban: "",
    id: 0,
    idPayment: "",
    isCancelled: false,
    origin: "",
    receiver: "",
    subject: "",
    urlRedirectEc: "",
    detailsList: [],
  },
  reducers: {
    setCheckData(state, action) {
      state.amount.amount = action.payload?.amount?.amount || 0;
      state.amount.currency = action.payload?.amount?.currency || "";
      state.amount.decimalDigits = action.payload?.amount?.decimalDigits || 0;
      state.bolloDigitale = action.payload?.bolloDigitale || false;
      state.fiscalCode = action.payload?.fiscalCode || "";
      state.iban = action.payload?.iban || "";
      state.id = action.payload?.id || 0;
      state.idPayment = action.payload?.idPayment || "";
      state.isCancelled = action.payload?.isCancelled || false;
      state.origin = action.payload?.origin || "";
      state.receiver = action.payload?.receiver || "";
      state.subject = action.payload?.subject || "";
      state.urlRedirectEc = action.payload?.urlRedirectEc || "";
      state.detailsList = action.payload?.detailsList || [];
    },
    resetCheckData(state) {
      state.amount.amount = 0;
      state.amount.currency = "";
      state.amount.decimalDigits = 0;
      state.bolloDigitale = false;
      state.fiscalCode = "";
      state.iban = "";
      state.id = 0;
      state.idPayment = "";
      state.isCancelled = false;
      state.origin = "";
      state.receiver = "";
      state.subject = "";
      state.urlRedirectEc = "";
      state.detailsList = [];
    },
  },
});

export const { setCheckData, resetCheckData } = checkDataSlice.actions;
export default checkDataSlice.reducer;
