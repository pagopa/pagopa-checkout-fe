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
import * as React from "react";
import { useTranslation } from "react-i18next";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { TransactionMethods } from "../../../../routes/models/paymentMethodRoutes";
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

const MethodComponentList = ({
  methods,
  onClick,
}: {
  methods: Array<PaymentInstruments>;
  onClick?: (typecode: TransactionMethods) => void;
}) => (
  <>
    {methods.map((method, index) => (
      <MethodComponent
        method={method}
        key={index}
        onClick={onClick ? () => onClick(method.paymentTypeCode) : undefined}
      />
    ))}
  </>
);

export const EnabledPaymentMethods = ({
  methods,
  onClick,
}: {
  methods: Array<PaymentInstruments>;
  onClick: (typecode: TransactionMethods) => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <MethodComponentList methods={methods} onClick={onClick} />
      <ClickableFieldContainer
        title="paymentChoicePage.others"
        clickable={false}
        icon={<MobileFriendlyIcon color="primary" fontSize="small" />}
        endAdornment={
          <Chip label={t("paymentChoicePage.incoming")} color="secondary" />
        }
      />
    </>
  );
};

export const DisabledPaymentMethods = ({
  methods,
}: {
  methods: Array<PaymentInstruments>;
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

export const MethodComponent = ({
  method,
  onClick,
}: {
  method: PaymentInstruments;
  onClick?: () => void;
}) => (
  <ClickableFieldContainer
    title={method.label}
    onClick={onClick}
    icon={<ImageComponent {...method} />}
    endAdornment={
      method.status === "ENABLED" && (
        <ArrowForwardIosIcon sx={{ color: "primary.main" }} fontSize="small" />
      )
    }
    disabled={method.status === "DISABLED"}
    clickable={method.status === "ENABLED"}
  />
);
