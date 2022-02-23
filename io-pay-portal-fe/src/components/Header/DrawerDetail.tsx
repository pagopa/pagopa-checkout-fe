import React, { ReactEventHandler } from "react";
import {
  Drawer,
  Box,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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

  return (
    <Drawer
      anchor="bottom"
      open={props.drawstate}
      onBackdropClick={props.toggleDrawer(false)}
    >
      <Typography variant="body2" component="div" sx={{ textAlign: "center" }}>
        <Box sx={{ width: "auto" }} p={2} role="presentation">
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
          <Box
            sx={{
              my: 2,
              display: "flex",
              alignItems: "center",
              p: 2,
              bgcolor: "info.main",
            }}
          >
            <InfoOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="body2" component={"div"} textAlign="left">
              {t("mainPage.header.disclaimer")}
            </Typography>
          </Box>
          {props.PaymentCheckData &&
            props.PaymentCheckData.detailsList.map((el, index) => (
              <Accordion
                sx={{ boxShadow: "none" }}
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
                      {moneyFormat(el.importo, 1)}
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
