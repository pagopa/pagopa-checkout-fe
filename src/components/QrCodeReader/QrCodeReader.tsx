import { useMediaQuery, useTheme } from "@mui/material";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import QrReader from "react-qr-reader";

export function QrCodeReader(props: {
  onError: (error: string) => void;
  onScan: (data: string | null) => void;
  enableLoadFromPicture: boolean;
  style?: React.CSSProperties;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const qrRef = useRef(null);
  const [legacy, setLegacy] = useState(false);
  const [fromPicture, setFromPicture] = useState(false);

  const UploadButton = () => (
    <button
      type="button"
      onClick={() => {
        if (legacy && qrRef?.current) {
          (qrRef?.current as any).openImageDialog();
        }
      }}
    >
      Upload
    </button>
  );

  const PictureCheckbox = () => (
    <div>
      <input
        type="checkbox"
        defaultChecked={fromPicture}
        onChange={(event) => {
          setLegacy(event.target.checked);
          setFromPicture(event.target.checked);
        }}
      />
      <span>Get from picture</span>
    </div>
  );

  return (
    <>
      <div style={{ position: "absolute", zIndex: "-1" }}>
        {isMobileDevice ? (
          <div>{t("paymentQrPage.usageHintMobile")}</div>
        ) : (
          <div>{t("paymentQrPage.usageHintPc")}</div>
        )}
      </div>
      <QrReader
        delay={300}
        ref={qrRef}
        onError={props.onError}
        onScan={props.onScan}
        style={props.style}
        legacyMode={legacy}
      />
      {props.enableLoadFromPicture ? (
        <>
          <PictureCheckbox />
          {legacy ? <UploadButton /> : undefined}
        </>
      ) : undefined}
    </>
  );
}
