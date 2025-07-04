import { Accordion, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionDetails, Box, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import { PaymentNotice } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../../utils/form/formatters";
import { truncateText } from "../../utils/transformers/text";

interface Props {
  paymentNotices: Array<PaymentNotice>;
}

export default function DrawerCart(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const firstItemExpanded = props.paymentNotices.length === 1;
  const [expanded, setExpanded] = React.useState<string | false>(
    firstItemExpanded ? "paynotice-0" : false
  );

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const ignoreRoutesforNoticeNumber: Array<string> = [
    CheckoutRoutes.INSERISCI_EMAIL,
    CheckoutRoutes.SCEGLI_METODO,
    CheckoutRoutes.INSERISCI_CARTA,
  ];
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const cartClientId: string =
    (getSessionItem(SessionItems.cartClientId) as string | undefined) ||
    "CHECKOUT";
  const isWispRedirectClient = cartClientId === "WISP_REDIRECT";
  const showPaymentNoticeAndFiscalCode =
    !isWispRedirectClient ||
    (isWispRedirectClient &&
      !ignoreRoutesforNoticeNumber.includes(currentPath));

  return (
    <>
      {props.paymentNotices.map((el: PaymentNotice, index: number) => (
        <Accordion
          key={`paynotice-${index}`}
          onChange={handleChange(`paynotice-${index}`)}
          expanded={expanded === `paynotice-${index}`}
          disableGutters
          square
          sx={{
            p: 0,
            bgcolor: theme.palette.background.default,
            borderTop: 1,
            borderBottom: index > 0 ? 1 : 0,
            borderColor: "grey.300",
            backgroundImage: "none",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon color="primary" />}
            aria-controls={`paynotice-${index}`}
            id={`paynotice-${index}`}
            sx={{
              p: 0,
            }}
          >
            <Box>
              <Typography
                component="div"
                typography="sidenav"
                display="block"
                sx={{
                  color: "custom.drawer.card.sectionBody.primary",
                }}
              >
                {el.description && truncateText(el.description, 30)}
              </Typography>
              <Typography
                component="div"
                typography="body2"
                color="custom.drawer.card.sectionTitle.primary"
              >
                {el.companyName && truncateText(el.companyName, 30)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" ml="auto" mr={1}>
              <Typography variant="button" display="block" color="primary.main">
                {moneyFormat(el.amount)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: 0,
              borderTop: 1,
              borderColor: "grey.300",
              backgroundColor:
                theme.palette.custom.drawer?.card?.background?.default,
            }}
          >
            <Typography
              component="div"
              typography="body2"
              display="block"
              color="custom.drawer.card.sectionTitle.primary"
              mt={2}
            >
              {t("cartDetail.amount")}
            </Typography>
            <Typography
              sx={{
                color: "custom.drawer.card.sectionBody.primary",
              }}
              component="div"
              typography="sidenav"
              display="block"
            >
              {moneyFormat(el.amount)}
            </Typography>
            <Typography
              component="div"
              typography="body2"
              display="block"
              mt={2}
              color="custom.drawer.card.sectionTitle.primary"
            >
              {t("cartDetail.description")}
            </Typography>
            <Typography
              component="div"
              typography="sidenav"
              display="block"
              style={{ overflowWrap: "break-word" }}
              sx={{
                color: "custom.drawer.card.sectionBody.primary",
              }}
            >
              {el.description}
            </Typography>
            <Typography
              component="div"
              typography="body2"
              display="block"
              mt={2}
              color="custom.drawer.card.sectionTitle.primary"
            >
              {t("cartDetail.companyName")}
            </Typography>
            <Typography
              component="div"
              typography="sidenav"
              display="block"
              style={{ overflowWrap: "break-word" }}
              sx={{
                color: "custom.drawer.card.sectionBody.primary",
              }}
            >
              {el.companyName}
            </Typography>
            {showPaymentNoticeAndFiscalCode && (
              <>
                <Typography
                  component="div"
                  typography="body2"
                  display="block"
                  mt={2}
                  color="custom.drawer.card.sectionTitle.primary"
                >
                  {el.creditorReferenceId
                    ? t("cartDetail.iuv")
                    : t("cartDetail.noticeNumber")}
                </Typography>
                <Typography
                  component="div"
                  typography="sidenav"
                  display="block"
                  sx={{
                    color: "custom.drawer.card.sectionBody.primary",
                  }}
                >
                  {el.creditorReferenceId ?? el.noticeNumber}
                </Typography>
                <Typography
                  component="div"
                  typography="body2"
                  display="block"
                  mt={2}
                  color="custom.drawer.card.sectionTitle.primary"
                >
                  {t("cartDetail.fiscalCode")}
                </Typography>
                <Typography
                  component="div"
                  typography="sidenav"
                  display="block"
                  sx={{
                    color: "custom.drawer.card.sectionBody.primary",
                  }}
                >
                  {el.fiscalCode}
                </Typography>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
