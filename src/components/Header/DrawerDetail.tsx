import { Alert, Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  PaymentInfoData,
  Cart,
} from "../../features/payment/models/paymentModel";
import { getTotalFromCart } from "../../utils/cart/cart";
import { moneyFormat } from "../../utils/form/formatters";
import { CustomDrawer } from "../modals/CustomDrawer";
import DrawerCart from "./DrawerCart";
import DrawerPaymentInfo from "./DrawerPaymentInfo";
interface Props {
  drawstate: boolean;
  toggleDrawer: () => void;
  PaymentInfo: PaymentInfoData;
  CartInfo: Cart;
}

export default function DrawerDetail(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <CustomDrawer open={props.drawstate} onClose={props.toggleDrawer}>
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{
          textAlign: "left",
          pt: 1,
        }}
      >
        <Typography variant="h6" component={"div"}>
          {t("mainPage.header.detail.detailAmount")}
        </Typography>
        <Typography variant="h6" component={"div"}>
          {props.PaymentInfo && props.PaymentInfo.amount
            ? moneyFormat(props.PaymentInfo.amount)
            : ""}
          {props.CartInfo && props.CartInfo.paymentNotices
            ? moneyFormat(getTotalFromCart(props.CartInfo))
            : ""}
        </Typography>
      </Box>
      <Alert
        severity="info"
        variant="standard"
        sx={{
          my: 2,
          borderLeftColor: theme.palette.info.main + " !important",
          borderLeft: "4px solid",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          component={"div"}
          textAlign="left"
          whiteSpace="normal"
        >
          {t("mainPage.header.disclaimer")}
        </Typography>
      </Alert>

      {props.CartInfo && <DrawerCart CartInfo={props.CartInfo} />}

      {props.PaymentInfo.subject && (
        <DrawerPaymentInfo PaymentInfo={props.PaymentInfo} />
      )}
    </CustomDrawer>
  );
}
