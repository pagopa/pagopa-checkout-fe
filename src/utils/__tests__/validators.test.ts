import * as O from "fp-ts/Option";
import { validateSessionWalletCardFormFields } from "../../utils/regex/validators";

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
