import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Drawer, Typography, useTheme } from "@mui/material";
import React, { ReactEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PaymentInfoData } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../../utils/form/formatters";

interface Props {
  drawstate: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  toggleDrawer: (open: boolean) => ReactEventHandler<{}> | undefined;
  PaymentInfo: PaymentInfoData;
}

export default function DrawerDetail(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Drawer
      anchor="bottom"
      open={props.drawstate}
      onBackdropClick={props.toggleDrawer(false)}
    >
      <Typography variant="body2" component="div" sx={{ textAlign: "center" }}>
        <Box
          sx={{ width: "auto", background: theme.palette.background.default }}
          p={2}
          role="presentation"
        >
          <Box display="flex">
            <CloseIcon
              sx={{ ml: "auto", my: 2 }}
              onClick={props.toggleDrawer(false)}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{
              borderBottom: "1px solid",
              borderBottomColor: "divider",
              textAlign: "left",
            }}
          >
            <Typography variant="h6" component={"div"} pr={2}>
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
            <Typography
              variant="body2"
              fontWeight={600}
              component="div"
              sx={{ wordBreak: "break-word" }}
            >
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
        </Box>
      </Typography>
    </Drawer>
  );
}
