export enum MixpanelEventsId {
  CHK_PAYMENT_NOTICE_DATA_ENTRY = "CHK_PAYMENT_NOTICE_DATA_ENTRY",
  CHK_PAYMENT_NOTICE_QRCODE_SCAN = "CHK_PAYMENT_NOTICE_QRCODE_SCAN",
  CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL = "CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL",
  CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY = "CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY",
  CHK_QRCODE_SCAN_SCREEN = "CHK_QRCODE_SCAN_SCREEN",
  CHK_PAYMENT_NOTICE_MANUAL_ENTRY = "CHK_PAYMENT_NOTICE_MANUAL_ENTRY",
  CHK_PAYMENT_SUMMARY_INFO_SCREEN = "CHK_PAYMENT_SUMMARY_INFO_SCREEN",
  CHK_PAYMENT_START_FLOW = "CHK_PAYMENT_START_FLOW",
  CHK_PAYMENT_EMAIL_ADDRESS = "CHK_PAYMENT_EMAIL_ADDRESS",
  CHK_PAYMENT_METHOD_SELECTION = "CHK_PAYMENT_METHOD_SELECTION",
  CHK_PAYMENT_METHOD_DATA_INSERT = "CHK_PAYMENT_METHOD_DATA_INSERT",
}

export enum MixpanelEventCategory {
  UX = "UX",
}

export enum MixpanelEventType {
  SCREEN_VIEW = "screen view",
  ACTION = "action",
}

export enum MixpanelDataEntryType {
  QR_CODE = "qr_code",
  MANUAL = "manual",
}

export function mixpanelDataEntryTypeFromString(
  value: string
): MixpanelDataEntryType | undefined {
  return Object.values(MixpanelDataEntryType).includes(
    value as MixpanelDataEntryType
  )
    ? (value as MixpanelDataEntryType)
    : undefined;
}

export enum MixpanelFlow {
  CART = "cart",
  DATA_ENTRY = "data_entry",
}

export enum MixpanelPaymentPhase {
  VERIFICA = "verifica",
  ATTIVA = "attiva",
  PAGAMENTO = "pagamento",
}
