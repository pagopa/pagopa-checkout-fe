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
  const { t } = useTranslation();
  const isV4 = (
    m: PaymentInstrumentsType | PaymentInstrumentsTypeV4
  ): m is PaymentInstrumentsTypeV4 => "feeRange" in m;

  const title =
    typeof method.description === "string"
      ? method.description
      : method.description?.it ?? "";

  const subtitle = isV4(method)
    ? method.feeRange?.min === method.feeRange?.max
      ? t("paymentChoicePage.feeSingle", { value: method.feeRange?.min })
      : t("paymentChoicePage.feeRange", {
          min: method.feeRange?.min,
          max: method.feeRange?.max,
        })
    : undefined;

  const normalizedMethod = {
    ...method,
    asset: (method as any).asset || (method as any).paymentMethodAsset,
  };

  return (
    <ClickableFieldContainer
      dataTestId={testable ? method.paymentTypeCode : undefined}
      dataTestLabel={testable ? "payment-method" : undefined}
      title={title}
      subtitle={subtitle}
      onClick={onClick}
      icon={<ImageComponent {...normalizedMethod} />}
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
