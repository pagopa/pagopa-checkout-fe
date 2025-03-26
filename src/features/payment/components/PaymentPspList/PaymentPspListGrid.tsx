import React from "react";
import { Grid } from "@mui/material";
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
}: PSPGridProps) => (
  <Grid container>
    {pspList.map((pspItem, index) => (
      <PaymentPSPListGridItem
        key={pspItem.idPsp ?? `pspItem-${index}`}
        pspItem={pspItem}
        isSelected={pspItem.idPsp === currentSelectedPsp?.idPsp}
        handleClick={() => {
          onPspSelected(pspItem);
        }}
      />
    ))}
  </Grid>
);
