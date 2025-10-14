export interface WalletType {
  walletId: string;
  userId: string;
  paymentMethodId: string;
  paymentMethodAsset: string;
  status: string;
  creationDate: string;
  updateDate: string;
  applications: [
    {
      name: string;
      status: string;
    }
  ];
  clients: {
    IO: { status: string };
  };
  details: {
    type: string;
    brand?: string;
    lastFourDigits?: string;
    expiryDate?: string;
    maskedEmail?: string;
    pspId?: string;
    pspBusinessName?: string;
  };
}
