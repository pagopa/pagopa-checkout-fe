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

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstruments>;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const paymentInstruments = [
    {
      description: "Postepay",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "Postepay",
      paymentTypeCode: "PPAY",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "ciccio",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "ciccio",
      paymentTypeCode: "PPAY",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "Postepay",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "Postepay",
      paymentTypeCode: "CP",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "Postepay",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "Postepay",
      paymentTypeCode: "CP",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "Postepay",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "Postepay",
      paymentTypeCode: "CP",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "pasticcio",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "pasticcio",
      paymentTypeCode: "CC",
      status: "ENABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "pasticcio",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "pasticcio",
      paymentTypeCode: "CP",
      status: "DISABLED",
      ranges: [],
      asset: "",
    },
    {
      description: "pasticcio",
      id: "19d8771f-e8d1-4ead-bcc0-b9b8bc6a2c4f",
      name: "pasticcio",
      paymentTypeCode: "PPAY",
      status: "DISABLED",
      ranges: [],
      asset: "",
    },
  ];

  const handleClickOnMethod = React.useCallback((paymentType: string) => {
    const route: string = PaymentMethodRoutes[paymentType]?.route;
    navigate(`/${route}`);
  }, []);

  const getPaymentsMethods = React.useCallback(
    (status: string = "ENABLED") => {
      const filteredMethods = paymentInstruments
        .filter((method) => method.status === status)
        .reduce((prev, current) => {
          if (
            PaymentMethodRoutes[current.paymentTypeCode] &&
            (!prev.length ||
              !prev.some(
                (method) => method.paymentTypeCode === current.paymentTypeCode
              ))
          ) {
            prev.push({
              ...current,
              label: PaymentMethodRoutes[current.paymentTypeCode].label,
              asset:
                PaymentMethodRoutes[current.paymentTypeCode].asset ||
                current.asset,
            });
          }
          return prev;
        }, [] as Array<PaymentInstruments>);

      const methodsArray: Array<PaymentInstruments> = [];
      const methodCP = filteredMethods.find(
        (method) => method.label === TransactionMethods.CP
      );
      const methodCC = filteredMethods.find(
        (method) => method.label === TransactionMethods.CC
      );
      methodCP && methodsArray.push(methodCP);
      methodCC && methodsArray.push(methodCC);

      const methods = methodsArray
        .concat(
          filteredMethods
            .filter(
              (method) =>
                method.label !== TransactionMethods.CP &&
                method.label !== TransactionMethods.CC
            )
            .sort((a, b) => a.label.localeCompare(b.label))
        )
        .map((method, index) => makeMethodComponent(method, index));

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
