/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JwtUser } from "@pagopa/mui-italia";
import { RootState } from "../store";

interface LoggedUser {
  userInfo?: JwtUser;
}

const initialState: LoggedUser = {
  userInfo: undefined,
};

export const loggeUserSlice = createSlice({
  name: "loggedUser",
  initialState,
  reducers: {
    setLoggedUser(state, action: PayloadAction<JwtUser>) {
      state.userInfo = action.payload;
    },
    removeLoggedUser(state) {
      state.userInfo = undefined;
    },
  },
});

export const { setLoggedUser, removeLoggedUser } = loggeUserSlice.actions;
export default loggeUserSlice.reducer;
export const getLoggedUser = (state: RootState) => state.userInfo;
