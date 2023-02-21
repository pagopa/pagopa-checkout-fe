import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks/hooks";
import { selectCardData } from "../../redux/slices/cardData";
import { CheckoutRoutes } from "../../routes/models/routeModel";

export default function CvvGuard(props: { children?: React.ReactNode }) {
  const cvv = useAppSelector(selectCardData)?.cvv;
  return cvv ? (
    <>{props.children}</>
  ) : (
    <Navigate to={`/${CheckoutRoutes.INSERISCI_CARTA}`} />
  );
}
