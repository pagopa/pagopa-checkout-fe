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
import {
  getMethodDescriptionForCurrentLanguage,
  getMethodNameForCurrentLanguage,
} from "../../../../utils/paymentMethods/paymentMethodsHelper";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentInstrumentsType } from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { ImageComponent } from "./PaymentMethodImage";

export const MethodComponentList = ({
  methods,
  onClick,
  testable,
}: {
  methods: Array<PaymentInstrumentsType>;
  onClick?: (method: PaymentInstrumentsType) => void;
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
  methods: Array<PaymentInstrumentsType>;
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
  method: PaymentInstrumentsType;
  onClick?: () => void;
  testable?: boolean;
}) => (
  <ClickableFieldContainer
    dataTestId={testable ? method.paymentTypeCode : undefined}
    dataTestLabel={testable ? "payment-method" : undefined}
    title={getMethodDescriptionForCurrentLanguage(method)}
    onClick={onClick}
    icon={
      <ImageComponent
        {...{
          asset: method.asset,
          name: getMethodNameForCurrentLanguage(method),
        }}
      />
    }
    endAdornment={
      method.status === PaymentMethodStatusEnum.ENABLED && (
        <ArrowForwardIosIcon sx={{ color: "primary.main" }} fontSize="small" />
      )
    }
    disabled={method.status === PaymentMethodStatusEnum.DISABLED}
    clickable={method.status === PaymentMethodStatusEnum.ENABLED}
  />
);
