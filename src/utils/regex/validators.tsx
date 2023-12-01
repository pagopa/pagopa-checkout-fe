import * as O from "fp-ts/Option";
import { IdFields } from "../../features/payment/components/IframeCardForm/types";
import { CreateSessionResponse } from "../../../generated/definitions/payment-ecommerce/CreateSessionResponse";

export function emailValidation(email: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
    email
  );
}

export function cardNameValidation(name: string) {
  return /^[a-zA-Z]+[\s']+([a-zA-Z]+[\s']*){1,}$/.test(name);
}

export function digitValidation(text: string) {
  return /^\d+$/.test(text);
}

export function qrCodeValidation(code: string) {
  return /^[a-zA-Z]{6}(\|[0-9]{3})(\|[0-9]{18})(\|[0-9]{11})(\|[0-9]{2,11})$/.test(
    code
  );
}

/**
 * This function can be used to valuate the conformity of the cardFormFields
 * used to build the iframe payment form. It cheks every element of the list
 * to make sure we have at least 4 element and that each has at least a property id of type FieldId
 * and one src one of type string.
 * returns an Option<SessionWalletCreateResponse["cardFormFields"]>
 */
export function validateSessionWalletCardFormFields(
  cardFormFields: CreateSessionResponse["paymentMethodData"]["form"]
): O.Option<CreateSessionResponse["paymentMethodData"]["form"]> {
  const inputIDs = new Set();
  inputIDs.add(IdFields.CARDHOLDER_NAME);
  inputIDs.add(IdFields.SECURITY_CODE);
  inputIDs.add(IdFields.CARD_NUMBER);
  inputIDs.add(IdFields.EXPIRATION_DATE);
  if (
    cardFormFields.length >= 4 &&
    cardFormFields.every((field) => {
      if (
        typeof field?.id === "string" &&
        inputIDs.has(field.id) &&
        typeof field?.src === "string"
      ) {
        inputIDs.delete(field.id);
        return true;
      }
      return false;
    })
  ) {
    return inputIDs.size === 0 ? O.some(cardFormFields) : O.none;
  }
  return O.none;
}
