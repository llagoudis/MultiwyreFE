interface BillingItem {
  amount: string;
  description: string;
}

interface Invoices {
  requested?: string;
  invoiced?: string;
  paid?: string;
  status: string;
  profile?: string;
  description?: string;
  id: number;
  createdAt: string;
  amount: string;
  currency: string;
  invoiceURL: string;
  transactionDetails: TransactionDetails;
  requestedCryptoAmount: number;
  fiatAmount: number;
  fiatCurrency: number;
  paidCurrency: number;
  paidCryptoAmount: number;
  toAddress: string;
  name: string;
  transactionId: string;
  email: string;
  billingItems: BillingItem[];
  billingAddress?: string;
  projectId?: string;
}

interface addressDetailsProp {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
}

interface bankDetailsProp {
  IBAN: string;
  bankAddress: string;
  bankCountry: string;
  bankLocation: string;
  bankName: string;
  swift: string;
}

interface OnvoiceDetailsProp {
  firstname: string;
  lastname: string;
  invoiceImgLink: string;
}

interface InvoiceTemplateProps {
  invoice: Invoices | null;
  addressDetails?: addressDetailsProp;
  bankDetails?: bankDetailsProp;
  invoiceImageUrl?: OnvoiceDetailsProp;
  base64: string | null;
  qrImage: string;
}
