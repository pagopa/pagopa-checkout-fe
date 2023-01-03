import React from "react";
import { Navigate } from "react-router-dom";
import { getCart, getPaymentInfo } from "../../utils/api/apiService";

export default function NoticeGuard(props: { children?: React.ReactNode }) {
  const paymentInfo = getPaymentInfo();
  const cart = getCart();

  return paymentInfo.rptId || cart?.emailNotice ? (
    <>{props.children}</>
  ) : (
    <Navigate to="/" />
  );
}
