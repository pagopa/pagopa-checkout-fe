import React from "react";
import { Navigate } from "react-router-dom";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";

export default function MaintenanceGuard(props: {
  children?: React.ReactNode;
}) {
  const isMaintenanceEnabled =
    getSessionItem(SessionItems.enableMaintenance) === "true";

  return isMaintenanceEnabled ? (
    <>{props.children}</>
  ) : (
    <Navigate to="/" replace />
  );
}
