import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  PaymentMethodFilter,
  PaymentMethodFilterType,
} from "../../../../utils/PaymentMethodFilterUtil";
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import { useSmallDevice } from "../../../../hooks/useSmallDevice";

export const PaymentChoiceFilterDrawer = (props: {
  open: boolean;
  onClose: () => void;
  paymentMethodFilterModel?: PaymentMethodFilter;
  onSelect: (sortingModel: PaymentMethodFilter | null) => void;
}) => {
  const { open, onClose, paymentMethodFilterModel, onSelect } = props;
  const { t } = useTranslation();

  // Determine initial sorting type based on provided model
  const getInitialFilterSelected = (): PaymentMethodFilter => ({
    paymentType: paymentMethodFilterModel?.paymentType,
    installment: paymentMethodFilterModel
      ? paymentMethodFilterModel.installment
      : false,
  });
  // Initialize sorting type
  const [paymentMethodFilter] = React.useState<PaymentMethodFilter>(
    getInitialFilterSelected()
  );

  // Handle radio selection change
  const handlePaymentMethodFilterChanging = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // eslint-disable-next-line no-console
    console.log(event);
  };

  // Handle apply button click
  const handleApply = () => {
    onSelect(paymentMethodFilter);
    onClose();
  };

  return (
    <CustomDrawer open={open} onClose={onClose}>
      <Box
        sx={{
          py: 1,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: useSmallDevice() ? "auto" : "400px",
        }}
      >
        <Typography variant="h6" component={"div"}>
          {t("paymentPspListPage.sort")}
        </Typography>

        <FormControl
          component="fieldset"
          sx={{ mt: 2 }}
          onKeyDown={(e: React.KeyboardEvent<HTMLFieldSetElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              handleApply();
            }
          }}
        >
          <RadioGroup
            tabIndex={0}
            aria-label="sorting-options"
            name="sorting-options"
            value={paymentMethodFilter}
            onChange={handlePaymentMethodFilterChanging}
          >
            <FormControlLabel
              value={PaymentMethodFilterType.CARD}
              control={<Radio />}
              label={
                <Box id="sort-psp-list-drawer-default-order">
                  <Typography variant="body1">
                    {t("paymentPspListPage.drawer.sorting.default")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentMethodFilterType.BALANCE}
              control={<Radio />}
              label={
                <Box id="sort-psp-list-drawer-order-by-name">
                  <Typography variant="body1">
                    {t("paymentPspListPage.drawer.sorting.name")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentMethodFilterType.APP_APM}
              control={<Radio />}
              label={
                <Box id="sort-psp-list-drawer-order-by-amount">
                  <Typography variant="body1">
                    {t("paymentPspListPage.drawer.sorting.amount")}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Spacer to push button to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Apply button */}
        <Button
          id="sort-psp-list-drawer"
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{ mt: 2 }}
        >
          {t("paymentPspListPage.drawer.showResults")}
        </Button>
      </Box>
    </CustomDrawer>
  );
};
