import React from "react";
import { Navigate } from "react-router-dom";
import { isStateEmpty } from "../../utils/storage/sessionStorage";

export default function Guard(props: {
  item: string;
  children?: React.ReactNode;
}) {
  return isStateEmpty(props.item) ? (
    <Navigate to="/payment" />
  ) : (
    <>{props.children}</>
  );
}
