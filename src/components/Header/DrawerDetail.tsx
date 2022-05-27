import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Container,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer
      anchor={isMobileDevice ? "bottom" : "right"}
      open={props.drawstate}
      onBackdropClick={props.toggleDrawer(false)}
      PaperProps={{
        sx: { background: theme.palette.background.default },
      }}
    >
      <Container sx={{ p: 3 }} maxWidth="xs">
        <Typography
          variant="body2"
          component="div"
          sx={{ textAlign: "center" }}
        >
          <Box
            sx={{ width: "auto", background: theme.palette.background.default }}
            role="presentation"
          >
            <Box display="flex" justifyContent="end" alignItems="center">
              <IconButton
                aria-label={t("ariaLabels.close")}
                onClick={props.toggleDrawer(false)}
                sx={{
                  color: "action.active",
                  p: 0,
                }}
                aria-hidden="true"
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{
                borderBottom: "1px solid",
                borderBottomColor: "divider",
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
              <Typography
                variant="body2"
                fontWeight={600}
                component="div"
                pb={2}
              >
                {props.PaymentInfo.receiver}
              </Typography>
            </Box>
          </Box>
        </Typography>
      </Container>
    </Drawer>
  );
}
