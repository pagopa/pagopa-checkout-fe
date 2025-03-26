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
import { CustomDrawer } from "../../../../components/modals/CustomDrawer";
import { useSmallDevice } from "../../../../hooks/useSmallDevice";
import { PspOrderingModel } from "./../../../../utils/SortUtil";

// Define an enum for the sorting type
export enum PaymentPspSortingType {
  DEFAULT = "default",
  NAME = "alphabetical",
  AMOUNT = "amount",
}

export const PaymentPspListSortingDrawer = (props: {
  open: boolean;
  onClose: () => void;
  pspSortingModel?: PspOrderingModel;
  onSelect: (sortingModel: PspOrderingModel | null) => void;
}) => {
  const { open, onClose, pspSortingModel, onSelect } = props;
  const { t } = useTranslation();

  // Determine initial sorting type based on provided model
  const getInitialSortingType = (): PaymentPspSortingType => {
    if (!pspSortingModel) {
      return PaymentPspSortingType.DEFAULT;
    }

    if (pspSortingModel.fieldName === "pspBusinessName") {
      return PaymentPspSortingType.NAME;
    } else if (pspSortingModel.fieldName === "taxPayerFee") {
      return PaymentPspSortingType.AMOUNT;
    }

    return PaymentPspSortingType.DEFAULT;
  };

  // Initialize sorting type
  const [sortingType, setSortingType] = React.useState<PaymentPspSortingType>(
    getInitialSortingType()
  );

  // Get the appropriate PspOrderingModel based on type
  const getSortingModel = (
    type: PaymentPspSortingType
  ): PspOrderingModel | null => {
    switch (type) {
      case PaymentPspSortingType.DEFAULT:
        return null; // DEFAULT is represented as null in the callback

      case PaymentPspSortingType.NAME:
        return {
          fieldName: "pspBusinessName",
          direction: "asc",
        };

      case PaymentPspSortingType.AMOUNT:
        return {
          fieldName: "taxPayerFee",
          direction: "asc",
        };
    }
  };

  // Handle radio selection change
  const handleSortingTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSortingType(event.target.value as PaymentPspSortingType);
  };

  // Handle apply button click
  const handleApply = () => {
    onSelect(getSortingModel(sortingType));
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
            value={sortingType}
            onChange={handleSortingTypeChange}
          >
            <FormControlLabel
              value={PaymentPspSortingType.DEFAULT}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">
                    {t("paymentPspListPage.drawer.sorting.default")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentPspSortingType.NAME}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">
                    {t("paymentPspListPage.drawer.sorting.name")}
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value={PaymentPspSortingType.AMOUNT}
              control={<Radio />}
              label={
                <Box>
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
          id="sort-psp-list"
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
