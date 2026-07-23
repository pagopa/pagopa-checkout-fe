import * as O from "fp-ts/Option";
import {
  qrCodeValidation,
  validateSessionWalletCardFormFields,
} from "../../utils/regex/validators";

export const npgSessionFieldsResponse = {
  orderId: "1222302",
  cardFormFields: [
    {
      type: "TEXT",
      class: "CARD_FIELD",
      id: "CARD_NUMBER",
      src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=CARD_NUMBER&lang=ITA&correlationid=2ebf3248-2967-4c26-aeb6-4ed8e044ae84&sessionid=iMPAbSadjGtfiSLLiQ77qg%3D%3D&placeholder=Y",
    },
    {
      type: "TEXT",
      class: "CARD_FIELD",
      id: "EXPIRATION_DATE",
      src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=EXPIRATION_DATE&lang=ITA&correlationid=2ebf3248-2967-4c26-aeb6-4ed8e044ae84&sessionid=iMPAbSadjGtfiSLLiQ77qg%3D%3D&placeholder=Y",
    },
    {
      type: "TEXT",
      class: "CARD_FIELD",
      id: "SECURITY_CODE",
      src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=SECURITY_CODE&lang=ITA&correlationid=2ebf3248-2967-4c26-aeb6-4ed8e044ae84&sessionid=iMPAbSadjGtfiSLLiQ77qg%3D%3D&placeholder=Y",
    },
    {
      type: "TEXT",
      class: "CARD_FIELD",
      id: "CARDHOLDER_NAME",
      src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=CARDHOLDER_NAME&lang=ITA&correlationid=2ebf3248-2967-4c26-aeb6-4ed8e044ae84&sessionid=iMPAbSadjGtfiSLLiQ77qg%3D%3D&placeholder=Y",
    },
  ],
};
describe("validateSessionWalletCardFormFields function", () => {
  it("Should validate correctly a wrong input", () => {
    expect(validateSessionWalletCardFormFields([])).toEqual(O.none);

    expect(validateSessionWalletCardFormFields([{}, {}, {}, {}])).toEqual(
      O.none
    );

    expect(
      validateSessionWalletCardFormFields([
        npgSessionFieldsResponse.cardFormFields[1],
        npgSessionFieldsResponse.cardFormFields[2],
        npgSessionFieldsResponse.cardFormFields[3],
      ])
    ).toEqual(O.none);

    expect(
      validateSessionWalletCardFormFields([
        npgSessionFieldsResponse.cardFormFields[1],
        npgSessionFieldsResponse.cardFormFields[2],
        npgSessionFieldsResponse.cardFormFields[3],
        npgSessionFieldsResponse.cardFormFields[3],
      ])
    ).toEqual(O.none);
  });

  it("Should validate correctly a good input", () => {
    expect(
      validateSessionWalletCardFormFields(
        npgSessionFieldsResponse.cardFormFields
      )
    ).toEqual(O.some(npgSessionFieldsResponse.cardFormFields));
  });
});

describe("qrCodeValidation function", () => {
  it("Should accept valid QR codes with multi-digit amounts", () => {
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|12000")
    ).toBe(true);
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|99")
    ).toBe(true);
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|99999999999")
    ).toBe(true);
  });

  it("Should accept valid QR codes with single-digit amounts (1-9)", () => {
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|1")
    ).toBe(true);
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|5")
    ).toBe(true);
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|9")
    ).toBe(true);
  });

  it("Should reject QR codes with zero amount", () => {
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|0")
    ).toBe(false);
  });

  it("Should reject QR codes with leading zeros in amount", () => {
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|01")
    ).toBe(false);
    expect(
      qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|007")
    ).toBe(false);
  });

  it("Should reject invalid QR code formats", () => {
    expect(qrCodeValidation("INVALID|DATA|SHOULD|FAIL")).toBe(false);
    expect(qrCodeValidation("")).toBe(false);
    expect(qrCodeValidation("PAGOPA|002|302039502020500000|77777777777|")).toBe(
      false
    );
    expect(qrCodeValidation("PAGOPA|002|12345|77777777777|12000")).toBe(false);
  });
});
