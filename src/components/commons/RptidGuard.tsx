import React from "react";
import { Navigate, useParams } from "react-router-dom";

export default function RptidGuard(props: { children?: React.ReactNode }) {
  const { rptid } = useParams();
  return /\b\d{29}\b/.test(rptid || "") ? (
    <>{props.children}</>
  ) : (
    <Navigate to="/" />
  );
}
