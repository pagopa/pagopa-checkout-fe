/* eslint-disable functional/immutable-data */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Box, Grid, Typography } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";

function ClickableFieldContainer(props: {
  title: string;
  icon: React.ReactNode;
  endAdornment?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  sx?: SxProps;
  itemSx?: SxProps;
}) {
  const { t } = useTranslation();
  const defaultStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: props.clickable ? "pointer" : "auto",
    borderBottom: "1px solid",
    borderBottomColor: "divider",
    pt: 3,
    pb: 3,
    ...props.sx,
  };

  return (
    <Grid
      container
      sx={defaultStyle}
      onClick={props.onClick}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          !!props.onClick && props.onClick();
        }
      }}
      {...(props.clickable ? { tabIndex: 0 } : {})}
    >
      <Grid item xs={9}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            pl: 2,
            pr: 2,
            ...props.itemSx,
          }}
        >
          {props.icon}
          <Typography variant="sidenav" component={"div"}>
            {t(props.title)}
          </Typography>
        </Box>
      </Grid>
      <Grid
        item
        xs={3}
        sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}
      >
        {props.endAdornment}
      </Grid>
    </Grid>
  );
}

ClickableFieldContainer.defaultProps = {
  flexDirection: "column",
  clickable: true,
};

export default ClickableFieldContainer;
