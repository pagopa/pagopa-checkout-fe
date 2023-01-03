import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks/hooks";
import { selectSecurityCode } from "../../redux/slices/securityCode";
import { CheckoutRoutes } from "../../routes/models/routeModel";

export default function CvvGuard(props: { children?: React.ReactNode }) {
  const cvv = useAppSelector(selectSecurityCode);
  return cvv ? (
    <>{props.children}</>
  ) : (
    <Navigate to={`/${CheckoutRoutes.INSERISCI_CARTA}`} />
  );
}
