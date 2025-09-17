import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import {
  PaymentInstrumentsType,
  PaymentInstrumentsTypeV4,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { ImageComponent } from "./PaymentMethodImage";

export const MethodComponentList = ({
  methods,
  onClick,
  testable,
}: {
  methods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
  onClick?: (method: PaymentInstrumentsType | PaymentInstrumentsTypeV4) => void;
  testable?: boolean;
}) => (
  <>
    {methods.map((method, index) => (
      <MethodComponent
        testable={testable}
        method={method}
        key={index}
        onClick={onClick ? () => onClick(method) : undefined}
      />
    ))}
  </>
);

export const DisabledPaymentMethods = ({
  methods,
}: {
  methods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return methods.length ? (
    <>
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
        <MethodComponentList methods={methods} />
      </Accordion>
    </>
  ) : null;
};

const MethodComponent = ({
  method,
  onClick,
  testable,
}: {
  method: PaymentInstrumentsType | PaymentInstrumentsTypeV4;
  onClick?: () => void;
  testable?: boolean;
}) => {
  const currentLanguage = (
    localStorage.getItem("i18nextLng") ?? "IT"
  ).toUpperCase();
  const methodDescription =
    typeof method.description === "object"
      ? method.description[currentLanguage] ?? method.description.IT
      : method.description;

  const methodName =
    typeof method.name === "object"
      ? method.name[currentLanguage] ?? method.name.IT
      : (method as PaymentInstrumentsType).name;

  const methodAsset =
    "asset" in method
      ? method.asset
      : (method as PaymentInstrumentsTypeV4).paymentMethodAsset;

  return (
    <ClickableFieldContainer
      dataTestId={testable ? method.paymentTypeCode : undefined}
      dataTestLabel={testable ? "payment-method" : undefined}
      title={methodDescription}
      onClick={onClick}
      icon={
        <ImageComponent
          asset={methodAsset}
          name={methodName}
          disabled={method.status === PaymentMethodStatusEnum.DISABLED}
        />
      }
      endAdornment={
        method.status === PaymentMethodStatusEnum.ENABLED && (
          <ArrowForwardIosIcon
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        )
      }
      disabled={method.status === PaymentMethodStatusEnum.DISABLED}
      clickable={method.status === PaymentMethodStatusEnum.ENABLED}
    />
  );
};
