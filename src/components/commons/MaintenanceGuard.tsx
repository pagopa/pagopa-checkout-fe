import React from "react";
import { Navigate } from "react-router-dom";
import { selectMaintenanceEnabled } from "../../redux/slices/maintanancePage";
import { useAppSelector } from "../../redux/hooks/hooks";

export default function MaintenanceGuard(props: {
  children?: React.ReactNode;
}) {
  const isMaintenanceEnabled = useAppSelector(
    selectMaintenanceEnabled
  ).maintenanceEnabled;

  return isMaintenanceEnabled ? (
    <>{props.children}</>
  ) : (
    <Navigate to="/" replace />
  );
}
