import {
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Checkbox,
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
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<PaymentMethodFilter>(
    getInitialFilterSelected()
  );

  const handleInstallmentChanging = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked; 

    setPaymentMethodFilter(prev => ({
      ...prev,         
      installment: checked, 
    }));
  };


  // Handle radio selection change
  const handlePaymentMethodFilterChanging = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // eslint-disable-next-line no-console
    console.log(event);
    const value = event.target.value as PaymentMethodFilterType;

    setPaymentMethodFilter(prev => ({
      ...prev,
      paymentType: value,
    }));
  };

  // Handle apply button click
  const handleApply = () => {
    onSelect(paymentMethodFilter);
    onClose();
  };

  // Handle cancel button click
  const handleCancel = () => {
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
          {t("paymentChoicePage.drawer.title")}
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
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t("paymentChoicePage.drawer.byType")}
          </Typography>
          <RadioGroup
            tabIndex={0}
            aria-label="paymentChoiceDrawer-options"
            name="paymentChoiceDrawer-options"
            value={paymentMethodFilter.paymentType}
            onChange={handlePaymentMethodFilterChanging}
          >
            <FormControlLabel
              value={PaymentMethodFilterType.CARD}
              control={<Radio />}
              label={
                <Box id="paymentChoiceDrawer-card">
                  <Typography variant="body1">
                    {t("paymentChoicePage.drawer.card")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentMethodFilterType.BALANCE}
              control={<Radio />}
              label={
                <Box id="paymentChoiceDrawer-balance">
                  <Typography variant="body1">
                    {t("paymentChoicePage.drawer.balance")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentMethodFilterType.APP_APM}
              control={<Radio />}
              label={
                <Box id="paymentChoiceDrawer-appApm">
                  <Typography variant="body1">
                    {t("paymentChoicePage.drawer.appApm")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
          </RadioGroup>
        </FormControl>
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
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t("paymentChoicePage.drawer.byFunc")}
          </Typography>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={paymentMethodFilter.installment}
                onChange={handleInstallmentChanging}
              />
            } 
            label={
              <Box id="paymentChoiceDrawer-payByPlan">
                <Typography variant="body1">
                  {t("paymentChoicePage.drawer.payByPlan")}
                </Typography>
              </Box>
            }
          />
        </FormControl>
        {/* Spacer to push button to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Apply button */}
        <Button
          id="paymentChoiceDrawer-applyFilter"
          variant="contained"
          fullWidth
          onClick={handleApply}
          sx={{ mt: 2 }}
        >
          {t("paymentPspListPage.drawer.showResults")}
        </Button>

        {/* Cancel button */}
        <Button
          id="paymentChoiceDrawer-cancelFilter"
          variant="outlined"
          fullWidth
          onClick={handleCancel}
          sx={{ mt: 2 }}
        >
          {t("paymentPspListPage.drawer.remove")}
        </Button>
      </Box>
    </CustomDrawer>
  );
};
