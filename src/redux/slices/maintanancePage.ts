/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface MaintenancePageState {
  maintenanceEnabled?: boolean;
}

const initialState: MaintenancePageState = {
  maintenanceEnabled: false,
};

export const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    setMaintenanceEnabled(
      state,
      action: PayloadAction<{
        maintenanceEnabled: boolean;
      }>
    ) {
      state.maintenanceEnabled = action.payload?.maintenanceEnabled;
    },
    resetMaintenanceEnabled(state) {
      state.maintenanceEnabled = false;
    },
  },
});

export const { setMaintenanceEnabled, resetMaintenanceEnabled } =
  maintenanceSlice.actions;
export default maintenanceSlice.reducer;
export const selectMaintenanceEnabled = (state: RootState) => ({
  maintenanceEnabled: state.maintenance.maintenanceEnabled,
});
