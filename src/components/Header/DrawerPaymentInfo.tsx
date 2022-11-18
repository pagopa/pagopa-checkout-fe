import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  PaymentInfoData,
  Cart,
} from "../../features/payment/models/paymentModel";

interface Props {
  PaymentInfo: PaymentInfoData;
}

export default function DrawerPaymentInfo(props: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ textAlign: "left" }}>
      <Typography
        variant="body2"
        fontWeight={300}
        component="div"
        sx={{ mt: 1 }}
      >
        {t("mainPage.header.detail.detailSubject")}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div">
        {props.PaymentInfo.subject}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={300}
        component="div"
        sx={{ mt: 1 }}
      >
        {t("mainPage.header.detail.detailReceiver")}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div" pb={2}>
        {props.PaymentInfo.receiver}
      </Typography>
    </Box>
  );
}
