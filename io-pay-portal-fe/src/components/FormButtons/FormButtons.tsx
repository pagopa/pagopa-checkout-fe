/* eslint-disable functional/immutable-data */
import { LoadingButton } from "@mui/lab";
import { Grid } from "@mui/material";
import { default as React } from "react";
import { useTranslation } from "react-i18next";
import { useSmallDevice } from "../../hooks/useSmallDevice";

export function FormButtons(props: {
  handleSubmit: () => void;
  handleCancel: () => void;
  type?: "submit" | "button";
  disabled: boolean;
  loadingSubmit?: boolean;
  loadingCancel?: boolean;
  submitTitle: string;
  cancelTitle: string;
}) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Grid
        sx={{
          position: { xs: "fixed", sm: "relative" },
          zIndex: { xs: 1000, sm: 0 },
          bottom: { xs: 0 },
          left: { xs: 0 },
          p: { xs: "1rem", sm: 0 },
          boxShadow: { xs: "0 0.5rem 1rem rgb(0 0 0 / 15%)", sm: 0 },
          bgcolor: { xs: "background.paper" },
          mt: { sm: 6 },
        }}
        justifyContent="center"
        flexDirection="row"
        alignItems="center"
        container
        spacing={2}
      >
        <Grid xs={4} style={useSmallDevice() ? { paddingTop: 0 } : {}} item>
          <LoadingButton
            variant="outlined"
            onClick={props.handleCancel}
            loading={props.loadingCancel || false}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {t(props.cancelTitle)}
          </LoadingButton>
        </Grid>
        <Grid xs={8} style={useSmallDevice() ? { paddingTop: 0 } : {}} item>
          <LoadingButton
            type={props.type}
            onSubmit={props.handleSubmit}
            loading={props.loadingSubmit || false}
            variant="contained"
            onClick={props.type === "button" ? props.handleSubmit : undefined}
            disabled={props.disabled}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {t(props.submitTitle)}
          </LoadingButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

FormButtons.defaultProps = {
  type: "button",
};
