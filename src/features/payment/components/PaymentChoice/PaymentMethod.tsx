import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import {
  Accordion,
  AccordionSummary,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import {
  PaymentCodeType,
  PaymentInstrumentsType,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";

const DefaultIcon = ({ method }: { method: PaymentInstrumentsType }) => {
  const theme = useTheme();
  return (
    <MobileFriendlyIcon
      color="primary"
      fontSize="small"
      sx={
        method.status === PaymentMethodStatusEnum.DISABLED
          ? { color: theme.palette.text.disabled }
          : {}
      }
    />
  );
};

function ImageComponent(method: PaymentInstrumentsType) {
  const theme = useTheme();
  const [image, setImage] = React.useState<"main" | "alt">("main");
  const onError = React.useCallback(() => setImage("alt"), []);
  const imgSize = { width: "23px", height: "23px" };

  const paymentMethodConfig =
    PaymentMethodRoutes[method.paymentTypeCode as PaymentCodeType];

  const iconDefault = <DefaultIcon method={method} />;

  if (!paymentMethodConfig?.asset || image !== "main") {
    return iconDefault;
  }

  if (typeof paymentMethodConfig?.asset === "string") {
    return (
      <img
        src={paymentMethodConfig?.asset}
        onError={onError}
        style={
          method.status === PaymentMethodStatusEnum.DISABLED
            ? { color: theme.palette.text.disabled, ...imgSize }
            : { color: theme.palette.text.primary, ...imgSize }
        }
      />
    );
  }

  if (typeof paymentMethodConfig?.asset === "function") {
    return paymentMethodConfig.asset(
      method.status === PaymentMethodStatusEnum.DISABLED
        ? { color: theme.palette.text.disabled }
        : {}
    );
  }

  return iconDefault;
}

export const MethodComponentList = ({
  methods,
  onClick,
  testable,
}: {
  methods: Array<PaymentInstrumentsType>;
  onClick?: (typeCode: PaymentCodeType, paymentMethodId: string) => void;
  testable?: boolean;
}) => (
  <>
    {methods.map((method, index) => (
      <MethodComponent
        testable={testable}
        method={method}
        key={index}
        onClick={
          onClick ? () => onClick(method.paymentTypeCode, method.id) : undefined
        }
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
    title={method.description}
    onClick={onClick}
    icon={<ImageComponent {...method} />}
    endAdornment={
      method.status === PaymentMethodStatusEnum.ENABLED && (
        <ArrowForwardIosIcon sx={{ color: "primary.main" }} fontSize="small" />
      )
    }
    disabled={method.status === PaymentMethodStatusEnum.DISABLED}
    clickable={method.status === PaymentMethodStatusEnum.ENABLED}
  />
);
