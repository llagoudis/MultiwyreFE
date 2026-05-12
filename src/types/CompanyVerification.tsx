interface CompanyDataReq {
  country?: string;
  companyName?: string;
  companyLegalForm?: string;
  companyEmail?: string;
  otp?: string;
  otpTransactionId?: string;
  password?: string;
  incorporationDate?: string;
  natureOfBusiness?: string;
  registrationNumber?: string;
  jurisdiction?: string;
  operatingJurisdiction?: string;
  city?: string;
  addressLine1?: string;
  postalCode?: string;
  sameOperatingAddress?: string;
  operatingAddressCity?: string;
  operatingAddressAddressLine1?: string;
  operatingAddressPostalCode?: string;
  incomingPayments?: string;
  outgoingPayments?: string;
  frequency?: string;
  expectedMonthlyRemittanceVolume?: string;
  paymentFromCountry1?: string;
  paymentFromCountry2?: string;
  paymentFromCountry3?: string;
  paymentToCountry1?: string;
  paymentToCountry2?: string;
  paymentToCountry3?: string;
}

export type { CompanyDataReq };
