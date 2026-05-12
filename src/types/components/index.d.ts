interface CalculatedFee {
  net: number;
  withdrawal: string;
  fee: number;
  minimumFee: number | null | string;
  maximumFee: number | null | string;
}

interface TemplateFormType {
  assetId: string;
  label: string;
  assetAddress: string;
  description: string;
}

interface CSVTransactions extends CommonKeys {
  fileId: string;
  fileName: string;
  status: string;
  dateTime: string;
  total: number;
  submitted: number;
  completed: number;
  failed: number;
  pending: number;
  rows: [
    {
      id: number;
      assetId: string;
      toAddress: string;
      status: string;
      Asset: Assets;
    },
  ];
}

interface CryptoWithdrawalForm {
  assetId: string;
  amount: string;
  addressType: "ONETIME" | "WHITELIST";
  oneTimeAddress?: string;
  whitelistId?: string;
  description: string;
  reference: string;
  isMax: boolean;
  IBAN: string;
  customerName?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  countryOfIssue: string;
  swift?: string;
  bankName: string;
  bankAddress: string;
  bankLocation: string;
  bankCountry: string;
  transferFee: string;
  paymentSystemType: string;
  customerZipcode: string;
  euroTemplate: string;
  isApproved: boolean;
}

interface CSVForm {
  assetId: string;
  csv: string;
}

interface CryptoTransferForm {
  assetId: string;
  amount: string;
  description: string;
  isMax: boolean;
  receiverAddress: string;
}
