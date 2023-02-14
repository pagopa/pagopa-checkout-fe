import React from "react";
import { Navigate } from "react-router-dom";
import { Cart, PaymentInfo } from "../../features/payment/models/paymentModel";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";

export default function NoticeGuard(props: { children?: React.ReactNode }) {
  const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;

  return paymentInfo?.rptId || cart?.emailNotice ? (
    <>{props.children}</>
  ) : (
    <Navigate to="/" />
  );
}
