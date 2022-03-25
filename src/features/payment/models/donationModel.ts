export interface Donation {
  base64Logo: string;
  cf: string;
  companyName: string;
  name: string;
  officeName: string;
  paymentDescription: string;
  reason: string;
  slices: Array<DonationSlice>;
  transferCategory: string;
  web_site: string;
}

export interface DonationSlice {
  idDonation: string;
  amount: number;
  nav: string;
}
