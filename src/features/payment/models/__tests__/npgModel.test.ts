import { FieldId } from "../../components/IframeCardForm/types";
import { NpgEvtData, NpgFlowStateEvtData, NpgFlowState } from "../npgModel";

describe("NPG Types and Interfaces", () => {
  it("NpgEvtData can be properly implemented", () => {
    const eventData: NpgEvtData = {
      id: "CARD_NUMBER" as FieldId,
      errorCode: "HF0001" as any, // NpgEvtDataErroCode exported locally
      errorMessage: "Invalid card number",
    };

    expect(eventData.id).toBe("CARD_NUMBER");
    expect(eventData.errorCode).toBe("HF0001");
    expect(eventData.errorMessage).toBe("Invalid card number");
  });

  // Test NpgFlowStateEvtData interface implementation
  it("NpgFlowStateEvtData can be properly implemented", () => {
    const flowStateData: NpgFlowStateEvtData = {
      data: {
        url: "https://example.com/payment",
      },
    };

    expect(flowStateData.data.url).toBe("https://example.com/payment");
  });

  // Test enum values
  it("NpgFlowState enum has correct values", () => {
    expect(NpgFlowState.REDIRECTED_TO_EXTERNAL_DOMAIN).toBe(
      "REDIRECTED_TO_EXTERNAL_DOMAIN"
    );
    expect(NpgFlowState.PAYMENT_COMPLETE).toBe("PAYMENT_COMPLETE");
    expect(NpgFlowState.READY_FOR_PAYMENT).toBe("READY_FOR_PAYMENT");
    expect(NpgFlowState.PAYMENT_METHOD_SELECTION).toBe(
      "PAYMENT_METHOD_SELECTION"
    );
    expect(NpgFlowState.CARD_DATA_COLLECTION).toBe("CARD_DATA_COLLECTION");
    expect(NpgFlowState.GDI_VERIFICATION).toBe("GDI_VERIFICATION");
  });
});
