/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable functional/immutable-data */
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import {
  Accordion,
  AccordionSummary,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import {
  PaymentMethodRoutes,
  TransactionMethods,
} from "../../../../routes/models/paymentMethodRoutes";
import { getConfigOrThrow } from "../../../../utils/config/config";
import { PaymentInstruments } from "../../models/paymentModel";

function ImageComponent(method: PaymentInstruments) {
  const theme = useTheme();
  const config = getConfigOrThrow();
  const [image, setImage] = React.useState<"main" | "alt">("main");
  const onError = React.useCallback(() => setImage("alt"), []);
  const imgSize = { width: "23px", height: "23px" };

  return method.asset && image === "main" ? (
    typeof method.asset === "string" ? (
      <img
        src={
          config.CHECKOUT_PAGOPA_ASSETS_CDN +
          `/${method?.asset.toLowerCase()}.png`
        }
        onError={onError}
        style={
          method.status === "DISABLED"
            ? { color: theme.palette.text.disabled, ...imgSize }
            : { color: theme.palette.text.primary, ...imgSize }
        }
      />
    ) : (
      method.asset(
        method.status === "DISABLED"
          ? { color: theme.palette.text.disabled }
          : {}
      )
    )
  ) : (
    <MobileFriendlyIcon
      color="primary"
      fontSize="small"
      sx={
        method.status === "DISABLED"
          ? { color: theme.palette.text.disabled }
          : {}
      }
    />
  );
}

function groupByTypeCode(array: Array<PaymentInstruments>) {
  return array.reduce((acc, current) => {
    if (!acc[current.paymentTypeCode]) {
      acc[current.paymentTypeCode] = [];
    }

    acc[current.paymentTypeCode].push(current);
    return acc;
  }, {} as { [key: string]: Array<PaymentInstruments> });
}

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstruments>;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClickOnMethod = React.useCallback((paymentType: string) => {
    const route: string = PaymentMethodRoutes[paymentType]?.route;
    navigate(`/${route}`);
  }, []);

  const getPaymentsMethods = React.useCallback(
    (status: string = "ENABLED") => {
      const filteredMethods = props.paymentInstruments.filter(
        (method) => method.status === status
      );
      const groupedMethods = groupByTypeCode(filteredMethods);
      const paymentMethods: Array<PaymentInstruments> = [];
      const methodCP = groupedMethods[TransactionMethods.CP]?.[0];
      const methodCC = groupedMethods[TransactionMethods.CC]?.[0];
      for (const key in groupedMethods) {
        if (
          key !== TransactionMethods.CP &&
          key !== TransactionMethods.CC &&
          PaymentMethodRoutes[key]
        ) {
          paymentMethods.push(groupedMethods[key][0]);
        }
      }

      const sortedMethods = paymentMethods.sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      methodCC && sortedMethods.unshift(methodCC);
      methodCP && sortedMethods.unshift(methodCP);

      const methods = sortedMethods.map((method, index) =>
        makeMethodComponent(method, index)
      );

      if (status === "ENABLED") {
        methods.push(
          <ClickableFieldContainer
            key={methods.length}
            title="paymentChoicePage.others"
            clickable={false}
            icon={<MobileFriendlyIcon color="primary" fontSize="small" />}
            endAdornment={
              <Chip label={t("paymentChoicePage.incoming")} color="secondary" />
            }
          />
        );
        return methods;
      } else {
        if (methods.length) {
          return (
            <Accordion
              key="accordion-1"
              disableGutters
              sx={{
                py: 3,
                bgcolor: theme.palette.background.default,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                aria-controls="payment-methods-content"
                id="payment-methods-header"
              >
                <Typography variant="sidenav" component="div" color="primary">
                  {t("paymentChoicePage.showMore")}
                </Typography>
              </AccordionSummary>
              {methods}
            </Accordion>
          );
        } else {
          return [];
        }
      }
    },
    [props.amount, props.paymentInstruments]
  );
  const makeMethodComponent = React.useCallback(
    (method: PaymentInstruments, index: number) => (
      <ClickableFieldContainer
        key={index}
        title={method.label}
        onClick={() => handleClickOnMethod(method.paymentTypeCode)}
        icon={<ImageComponent {...method} />}
        endAdornment={
          method.status === "ENABLED" && (
            <ArrowForwardIosIcon
              sx={{ color: "primary.main" }}
              fontSize="small"
            />
          )
        }
        disabled={method.status === "DISABLED"}
        clickable={method.status === "ENABLED"}
      />
    ),
    []
  );

  return (
    <>
      {props.loading
        ? Array(3)
            .fill(1)
            .map((_, index) => <ClickableFieldContainer key={index} loading />)
        : [getPaymentsMethods(), getPaymentsMethods("DISABLED")]}
    </>
  );
}
