import CloseIcon from "@mui/icons-material/Close";
import { Box, Container, Drawer, IconButton } from "@mui/material";
import React from "react";
import { useSmallDevice } from "../../hooks/useSmallDevice";
import SkeletonFieldContainer from "../Skeletons/SkeletonFieldContainer";

export function CustomDrawer(props: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  loading?: boolean;
}) {
  return (
    <Drawer
      anchor={useSmallDevice() ? "bottom" : "right"}
      open={props.open}
      onClose={props.onClose}
      sx={{ p: 3 }}
    >
      <Container sx={{ p: 3 }} maxWidth="xs">
        <Box display="flex" justifyContent="end" alignItems="center">
          <IconButton
            aria-label="close"
            onClick={() => props.onClose()}
            sx={{
              color: "action.active",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {props.loading ? (
          <SkeletonFieldContainer
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              pl: 3,
              pr: 1,
            }}
          />
        ) : (
          props.children
        )}
      </Container>
    </Drawer>
  );
}
