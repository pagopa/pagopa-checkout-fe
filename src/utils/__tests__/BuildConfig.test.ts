import { NpgEvtData, NpgFlowState, NpgFlowStateEvtData} from "../../features/payment/models/npgModel";
import buildFunction from "../buildConfig";

describe("buildFunction", () => {
  let mockConfig: {
      onChange: jest.Mock;
      onReadyForPayment: jest.Mock;
      onPaymentComplete: jest.Mock;
      onPaymentRedirect: jest.Mock;
      onBuildError: jest.Mock;
      onAllFieldsLoaded: jest.Mock;
  };
  let instance: ReturnType<typeof buildFunction>;

  beforeEach(() => {
    mockConfig = {
      onChange: jest.fn(),
      onReadyForPayment: jest.fn(),
      onPaymentComplete: jest.fn(),
      onPaymentRedirect: jest.fn(),
      onBuildError: jest.fn(),
      onAllFieldsLoaded: jest.fn(),
    };
    instance = buildFunction(mockConfig);
  });

  test("onBuildSuccess should call onChange with valid data", () => {
    const eventData = { id: "CARD_NUMBER" } as NpgEvtData;
    instance.onBuildSuccess(eventData);
    expect(mockConfig.onChange).toHaveBeenCalledWith("CARD_NUMBER", {
      isValid: true,
      errorCode: null,
      errorMessage: null,
    });
  });


  test("onBuildError should call onChange with error data", () => {
    const eventData = { id: "CARD_NUMBER", errorCode: "HF0004", errorMessage: "Invalid card" } as NpgEvtData;
    instance.onBuildError(eventData);
    expect(mockConfig.onChange).toHaveBeenCalledWith("CARD_NUMBER", {
      isValid: false,
      errorCode: "HF0004",
      errorMessage: "Invalid card",
    });
  });

  test("onConfirmError should call onBuildError", () => {
    instance.onConfirmError({} as NpgEvtData);
    expect(mockConfig.onBuildError).toHaveBeenCalled();
  });

  test("onBuildFlowStateChange should handle flow states correctly", () => {
    instance.onBuildFlowStateChange({ data: { url: "https://redirect.url" } }, NpgFlowState.REDIRECTED_TO_EXTERNAL_DOMAIN);
    expect(mockConfig.onPaymentRedirect).toHaveBeenCalledWith("https://redirect.url");

    instance.onBuildFlowStateChange({} as NpgFlowStateEvtData, NpgFlowState.READY_FOR_PAYMENT);
    expect(mockConfig.onReadyForPayment).toHaveBeenCalled();

    instance.onBuildFlowStateChange({} as NpgFlowStateEvtData, NpgFlowState.PAYMENT_COMPLETE);
    expect(mockConfig.onPaymentComplete).toHaveBeenCalled();
  });

  test("onAllFieldsLoaded should call onAllFieldsLoaded callback", () => {
    instance.onAllFieldsLoaded();
    expect(mockConfig.onAllFieldsLoaded).toHaveBeenCalled();
  });

  test("cssLink should be correctly formatted", () => {
    const { cssLink } = instance;
    expect(cssLink).toMatch(/^https?:\/\/.+\/npg\/style\.css$/);
  });

  test("default CSS class names should be defined", () => {
    expect(instance.defaultComponentCssClassName).toBe("npg-component");
    expect(instance.defaultContainerCssClassName).toBe("npg-container");
  });
});