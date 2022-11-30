import React from "react";
import { Navigate } from "react-router-dom";
import { isStateEmpty, SessionItems } from "../../utils/storage/sessionStorage";

export default function Guard(props: {
  item: SessionItems;
  children?: React.ReactNode;
}) {
  return isStateEmpty(props.item) ? <Navigate to="/" /> : <>{props.children}</>;
}
