interface OTCMail {
  clientName: string;
  contactPerson: string;
  accountNumber: string;
  ordertype: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  /** When set, BE creates a PENDING OTC_TRANSACTION desk order */
  spendingCurrency?: string;
  receivingCurrency?: string;
  spendingAmount?: number;
  receivingAmount?: number;
  price?: number;
  exchangeFee?: number;
  transactionFee?: number;
  fxMarkUp?: number;
  type?: string;
  destinationAddress?: string;
  /** QA #69: ONETIME free-text vs WHITELIST approved address */
  addressType?: "ONETIME" | "WHITELIST";
  whitelistId?: number | string;
  destinationOwnershipConfirmed?: boolean;
  /** Crypto → EUR: persist beneficiary bank details on EURO_TRANSACTIONS */
  IBAN?: string;
  customerName?: string;
  customerAddress?: string;
  customerZipcode?: string;
  customerCity?: string;
  customerCountry?: string;
  swift?: string;
  bankName?: string;
  bankAddress?: string;
  bankLocation?: string;
  bankCountry?: string;
  reference?: string;
  paymentSystemType?: string;
  transferFee?: string | number;
  description?: string;
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
