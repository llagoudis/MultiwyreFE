interface OTCMail {
  clientName: string;
  contactPerson: string;
  accountNumber: string;
  ordertype: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

interface EuroMail {
  templateId?: string | number;
  IBAN: string;
  customerName: string;
  customerAddress: string;
  customerZipcode: string;
  customerCity: string;
  customerCountry: string;
  swift: string;
  bankName: string;
  bankAddress: string;
  bankLocation: string;
  bankCountry: string;
  paymentSystemType: string;
  reference: string;
  isApproved: boolean;

  amount: string;
  description: string;
  userId: string;
  firstname: string;
  lastname: string;
  id: string | number;
  currency: string;
  transferFee: string;
  templateName?: string;
}
