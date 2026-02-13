import React from "react";
import { Grid, RadioGroup } from "@mui/material";
import { Bundle } from "../../../../../generated/definitions/payment-ecommerce/Bundle";
import { PaymentPSPListGridItem } from "./PaymentPspListGridItem";

interface PSPGridProps {
  pspList: Array<Bundle>;
  onPspSelected: (psp: Bundle) => void;
  currentSelectedPsp?: Bundle;
}

export const PaymentPSPListGrid = ({
  pspList,
  onPspSelected,
  currentSelectedPsp,
}: PSPGridProps) => {
  const selectedId = currentSelectedPsp?.idPsp ?? "";
  return (
    <RadioGroup
      name="psp-selector"
      value={selectedId}
      onChange={(_, value) => {
        const found = pspList.find((p) => p.idPsp === value);
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
            isSelected={pspItem.idPsp === selectedId}
          />
        ))}
      </Grid>
    </RadioGroup>
  );
};
