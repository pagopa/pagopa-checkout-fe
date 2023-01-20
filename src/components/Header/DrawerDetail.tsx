import { Alert, Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentInfoData } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../../utils/form/formatters";
import { CustomDrawer } from "../modals/CustomDrawer";

interface Props {
  drawstate: boolean;
  toggleDrawer: () => void;
  PaymentInfo: PaymentInfoData;
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
          {props.PaymentInfo ? moneyFormat(props.PaymentInfo.amount) : ""}
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
    </CustomDrawer>
  );
}
