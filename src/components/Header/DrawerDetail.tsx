import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  Drawer,
  Typography,
  useTheme,
} from "@mui/material";
import React, { ReactEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PaymentCheckData } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../../utils/form/formatters";

interface Props {
  drawstate: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  toggleDrawer: (open: boolean) => ReactEventHandler<{}> | undefined;
  PaymentCheckData: PaymentCheckData;
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
              {t("paymentCheckPage.total")}
            </Typography>
            <Typography variant="h6" component={"div"}>
              {props.PaymentCheckData
                ? moneyFormat(props.PaymentCheckData.amount.amount)
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
          {props.PaymentCheckData &&
            props.PaymentCheckData.detailsList.map((el, index) => (
              <Accordion
                sx={{
                  boxShadow: "none",
                  background: theme.palette.background.default,
                }}
                defaultExpanded={index === 0 ? true : false}
                key={index}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon color="primary" />}
                  aria-controls={`panel-content-${index}`}
                  id={`panel-header-${index}`}
                  sx={{
                    flexDirection: "row-reverse",
                    borderTop: "1px solid",
                    borderTopColor: "divider",
                  }}
                >
                  <Box sx={{ pl: 2, display: "block", textAlign: "left" }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component="div"
                    >
                      {t("mainPage.header.detail.detailTitle")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      component="div"
                      color="GrayText"
                    >
                      {`IUV ${el.IUV}`}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      component="div"
                      color="GrayText"
                      sx={{ mt: 1 }}
                    >
                      {t("mainPage.header.detail.detailAmount")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component="div"
                    >
                      {moneyFormat(el.importo, 0)}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      component="div"
                      color="GrayText"
                      sx={{ mt: 1 }}
                    >
                      {t("mainPage.header.detail.detailSubject")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component="div"
                    >
                      {props.PaymentCheckData.subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={300}
                      component="div"
                      color="GrayText"
                      sx={{ mt: 1 }}
                    >
                      {t("mainPage.header.detail.detailReceiver")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      component="div"
                    >
                      {el.enteBeneficiario}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>
      </Typography>
    </Drawer>
  );
}
