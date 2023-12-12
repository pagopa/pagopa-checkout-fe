import { useEffect, useState } from "react";
import type {
  FieldId,
  FieldStatus,
} from "features/payment/components/IframeCardForm/types";
import { getConfigOrThrow } from "utils/config/config";
import createBuildConfig from "../utils/buildConfig";

export type SdkBuild = {
  onChange?: (field: FieldId, fieldStatus: FieldStatus) => void;
  onReadyForPayment?: () => void;
  onPaymentComplete?: () => void;
  onPaymentRedirect?: (urlRedirect: string) => void;
  onBuildError: () => void;
};

const noop = () => {
  // noop
};

export const useNpgSdk = ({
  onChange = () => null,
  onReadyForPayment = () => null,
  onPaymentComplete = () => null,
  onPaymentRedirect = () => null,
  onBuildError,
}: SdkBuild) => {
  const [sdkReady, setSdkReady] = useState(false);

  const createBuild = () => {
    try {
      // THIS is mandatory cause the Build class is defined in the external library called NPG SDK
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newBuild = new Build(
        createBuildConfig({
          onChange,
          onReadyForPayment,
          onPaymentRedirect,
          onPaymentComplete,
          onBuildError,
        })
      );
    } catch (_e) {
      onBuildError();
    }
  };

  useEffect(() => {
    const npgScriptEl = document.createElement("script");
    const npgDomainScript = getConfigOrThrow().CHECKOUT_NPG_SDK_URL;
    npgScriptEl.setAttribute("src", npgDomainScript);
    npgScriptEl.setAttribute("type", "text/javascript");
    npgScriptEl.setAttribute("charset", "UTF-8");
    document.head.appendChild(npgScriptEl);
    npgScriptEl.addEventListener("load", () => setSdkReady(true));
  }, []);

  return { sdkReady, buildSdk: sdkReady ? createBuild : noop };
};
