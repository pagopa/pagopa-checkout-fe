import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import * as React from "react";
import { useTheme } from "@mui/material";

interface IDefaultIcon {
  disabled: boolean;
}

interface IImageComponent {
  asset?: string;
  disabled?: boolean;
  name: string;
}

const DefaultIcon = ({ disabled }: IDefaultIcon) => {
  const theme = useTheme();
  return (
    <MobileFriendlyIcon
      color="primary"
      fontSize="small"
      sx={disabled ? { color: theme.palette.text.disabled } : {}}
    />
  );
};

export const ImageComponent = ({
  asset,
  disabled = false,
  name,
}: IImageComponent) => {
  const theme = useTheme();
  const [image, setImage] = React.useState<"main" | "alt">("main");
  const onError = React.useCallback(() => setImage("alt"), []);
  const imgSize = { width: "23px", height: "23px" };
  const guessAsset = asset || undefined;

  const iconDefault = <DefaultIcon disabled={disabled} />;
  if (typeof guessAsset === "string" && image === "main") {
    const altString = `Logo ${name}`;
    return (
      <img
        src={guessAsset}
        onError={onError}
        alt={altString}
        aria-hidden="true"
        style={
          disabled
            ? { color: theme.palette.text.disabled, ...imgSize }
            : { color: theme.palette.text.primary, ...imgSize }
        }
      />
    );
  }

  return iconDefault;
};
