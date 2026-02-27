import React from "react";
import { Grid, RadioGroup } from "@mui/material";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { PaymentPSPListGridItem } from "./PaymentPspListGridItem";

interface PSPGridProps {
  pspList: Array<Bundle>;
  onPspSelected: (psp: Bundle) => void;
  currentSelectedPsp?: Bundle;
}

const getPspValue = (psp: Bundle, index: number) =>
  String(psp.idPsp ?? `pspItem-${index}`);

export const PaymentPSPListGrid = ({
  pspList,
  onPspSelected,
  currentSelectedPsp,
}: PSPGridProps) => {
  const selectedId =
    currentSelectedPsp != null ? String(currentSelectedPsp.idPsp ?? "") : "";

  return (
    <RadioGroup
      name="psp-selector"
      value={selectedId}
      onChange={(_, value) => {
        const found = pspList.find(
          (p, index) => getPspValue(p, index) === value
        );
        if (found) {
          onPspSelected(found);
        }
      }}
    >
      <Grid container>
        {pspList.map((pspItem, index) => (
          <PaymentPSPListGridItem
            key={pspItem.idPsp ?? `pspItem-${index}`}
            pspItem={pspItem}
            radioValue={getPspValue(pspItem, index)}
            isSelected={getPspValue(pspItem, index) === selectedId}
          />
        ))}
      </Grid>
    </RadioGroup>
  );
};
