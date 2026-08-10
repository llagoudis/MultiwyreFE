interface AccessRoles extends CommonKeys {
  name: string;
  displayName: string;
}

interface AdminAssets extends CommonKeys {
  adminUserId: string;
  vaultId: string;
  assetId: string;
  assetAddress: string;
  isDefault: boolean;
}

interface AdminUser extends CommonKeys {
  azureId: string;
  firstname: string;
  lastname: string;
  email: string;
  active: boolean;
  password: string;
  status: number;
  roles: number;
}

interface Assets extends CommonKeys {
  fireblockAssetId: string;

  name: string;
  icon: string;
  krakenAssetId: string;
}

interface BusinessNature extends CommonKeys {
  fireblockAssetId: string;
  name: string;
}

interface CompanyEntity extends CommonKeys {
  companyProfileId: string;
  country: string;
  natureOfBusiness: string | number;
  registrationNumber: string;
  otherNatureOfBusiness: string;
  taxIdentificationNumber: string;
  incorporationDate: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  sameOperatingAddress: string;
  jurisdiction: string;
  operatingJurisdiction: string;
  operatingState: string;
  operatingAddressCity: string;
  operatingAddressAddressLine1: string;
  operatingAddressAddressLine2: string;
  operatingAddressPostalCode: string;
  cerificateOfFormation: string;
  companyAgreement: string;
  certificateOfDirectors: string;
  certificateOfShareholders: string;
  auditedFinancialStatement: string;
  proofOfAddress: string;
  companyStructure: string;
  sourceOfFunds: string;
  supplimentDocument: string;
  BusinessNature: BusinessNature;
}

interface CompanyPayments extends CommonKeys {
  companyProfileId: string;
  incomingPayments: string;
  outgoingPayments: string;
  frequency: string;
  monthlyRemittanceVolume: string;
  paymentFromCountry1: string;
  paymentFromCountry2: string;
  paymentFromCountry3: string;
  paymentToCountry1: string;
  paymentToCountry2: string;
  paymentToCountry3: string;
}

interface User extends CommonKeys {
  azureId: string;
  firstname: string;
  lastname: string;
  countryCode: string;
  phone: string;
  email: string;
  dob: string;
  clientId: string;
  personType: string;
  nationality: string;
  gender: string;
  createdBy: string;
  language: string;
  defaultCurrency: string;
  customPriceList: string;
  active: boolean;
  status: number;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  isAddressVerified: boolean;
  isCompanyVerified: verificationStates;
  isUserVerified: verificationStates;
  roles: string;
  reasonForRejection: string;
  profileImgLink: string;
  tfaEnabled: boolean;
}

interface DocumentTypes extends CommonKeys {
  displayName: string;
  name: string;
}

interface Documents extends CommonKeys {
  type: string;
  relationId: number;
  documentType: string;
  documentLink: string;
  documentNumber: string;
  issuedBy: number;
  issuedDate: string;
  validTill: string;
  status: verificationStates;
  Country: Country | null;
}

interface ContactDetails extends CommonKeys {
  type: "PHONE" | "EMAIL";
  userId: string;
  value: string;
  isPrimary: boolean;
  status: "REQUEST_SENT" | "ACTIVE" | "INACTIVE";
}

interface UserCompanyAssociations extends CommonKeys {
  roles: string;
  createdAt: string;
  companyProfileId: number | string;
  userId: string;
  CompanyProfile?: Partial<Company>;
  User: Partial<User>;
}

interface Country extends CommonKeys {
  name: string;
  currency: string;
  countryCode: number;
  fireblockAssetId?: string;
}

interface Company {
  id: number;
  userId: string;
  clientId: string;
  beneficialOwnerPosition: string;
  companyName: string;
  companyLegalForm: string;
  companyEmail: string;
  adminRemarks: string;
  isEmailVerified: boolean;
  phone: string;
  profileImageUrl: string;
  companyUrl: string;
  owner: string;
  verificationStatus: verificationStates;
  reasonForRejection: string;
  createdAt: string;
  updatedAt: string;
  User: User;
  CompanyEntityInfo: CompanyEntityInfo;
  UserCompanyAssociations: UserCompanyAssociations[];
}

interface LegalAgreements extends CommonKeys {
  type: RelationType;
  relationId: number;
  documentType: number;
  documentLink: string;
  description: string;
  addedDate: string;
  status: verificationStates;
  ipAddress: string;
  DocumentType: DocumentTypes;
}

interface UserVerification extends CommonKeys {
  city: string | null;
  state: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  Country: Country;
}

interface OperationType extends CommonKeys {
  name: string;
  displayName: string;
}

interface TransferFees extends CommonKeys {
  priceListId: number;
  name: string;
  status: string;
  validFrom: string;
  validTo: string;
  currencyId: string;
  percent: number;
  fixedFee: number;
  minimumFee: number | null;
  maximumFee: number | null;
  transferGroup: string;
  beneficiaryGroup: string;
  paymentMethod: string;
  OperationType?: OperationType;
  operationType?: number;
  displayName?: string;
}

interface RecurringFees extends CommonKeys {
  priceListId: number;
  name: string;
  status: string;
  validFrom: string;
  validTo: string;
  currencyId: string;
  percentage: number;
  fixedFee: number;
  OperationType?: OperationType;
  operationType?: number;
  period: string;
  priceListId?: number;
}

interface PriceList extends CommonKeys {
  name: string;
  clientType: "user" | "company" | "";
  companyType: string;
  standard: boolean;
  externalFeeEnabled: boolean;
  FxMarkupFees?: FXMarkup[];
  TransferFees?: TransferFees[];
  RecurringFees?: RecurringFees[];
}

interface FXMarkup extends CommonKeys {
  priceListId: number | string;
  name: string;
  operationType: string;
  status: boolean;
  validFrom: string;
  validTo: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  percent: number | string;
}

interface AdminProfile {
  profileImgLink: string;
  companyLegalName: string;
  companyAddress: string;
  email: string;
  tabName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  id: number;
  updatedWithApi: boolean;
}

interface EuroTransaction {
  IBAN: string;
}

interface TransactionDetails extends CommonKeys {
  assetName: string;
  userId: string;
  transactionId: string;
  assetId: string;
  operationType: number;
  sourceId: string;
  destinationId: string;
  sourceType: string;
  destinationType: string;
  orderType: string;
  sourceAddress: string;
  destinationAddress: string;
  status: string;
  subStatus: string;
  txHash: string;
  numOfConfirmations: string;
  note: string;
  operation: string;
  Asset: Assets;
  User?: Partial<User>;
  alert: boolean;
  OperationType: GenericMasterType;
  TransactionFee: TransactionFees;
  EuroTransaction: EuroTransaction;
  SourceAsset: Partial<UserAssets> & Partial<{ Asset: Assets }>;
  DestinationAsset: Partial<UserAssets> & Partial<{ Asset: Assets }>;
  fiatAmount: number;
  fiatCurrency: string;
  destinationAssetId: string;
}
interface BillingItem {
  amount: string;
  description: string;
}
interface Invoices extends CommonKeys {
  requested?: string;
  invoiced?: string;
  email: string;
  name: string;
  paid?: string;
  status: string;
  profile?: string;
  description?: string;
  id: number;
  createdAt: string;
  requested: string;
  invoiced: string;
  paid: string;
  status: string;
  amount: string;
  currency: string;
  invoiceURL: string;
  transactionDetails: TransactionDetails;

  EcomTransaction: {
    assetId: string;
    amount: string;
    exactAmount: string;
    status: string;
    createdAt: string;
    customerEmail: string;
    billingItems: BillingItem[];
    billingAddress: string;
  };
}

interface TransactionReport {
  ID: string | number;
  [key: string]: any;
}
interface BillingItem {
  amount: string;
  description: string;
}
interface TransactionDetails extends CommonKeys {
  amount: string;
  assetId: string;
  createdAt: string;
  customerId: string;
  deletedAt: string;
  exactAmount: string;
  fee: string;
  fromAddress: string;
  id: string;
  merchantId: string;
  orderId: string;
  orderStatus: string;
  requestedAmount: string;
  requestedAssetId: string;
  status: string;
  toAddress: string;
  transactionHash: string;
  transactionId: string;
  transactiontype: string;
  updatedAt: string;
  billingItems: BillingItem[];
}

interface InvoiceForm {
  name: string;
  description: string;
  billingAddress: string;
  currency: string;
  amount: string;
  email: string;
  projectId: string;
}

interface InvoicePay {
  currency: string;
  email: string;
  assetId: string;
  recoveryEmail: string;
  transactionId: string;
  termsAccepted?: boolean;
}
interface paginationTypes {
  totalPages: number;
  totalItems: number;
}

interface Pagination {
  currentPage: number;
  from: number;
  itemsPerPage: number;
  to: number;
  totalItems: number;
  totalPages: number;
}
// interface totalPages {
//   totalPages: number;
// }
interface Limits {
  id: number;
  providerId: number;
  currencyId: string;
  amount: string;
  exchangeLimit: string;
  exchangeType: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

interface TransactionFees extends CommonKeys {
  transactionId: string;
  amount: string;
  netAmount: string;
  networkFee: string;
  amountUSD: string;
  feeCurrency: string;
  balance: string | number;
  rate: string | number;
  clientRate: string | number;
  feePercentage: number;
  feeValue: number;
  sourceFee: number;
  destinationFee: number;
  cost: number;
  estimatedFee: string | number;
  debitedAmount: string | number;
  creditedAmount: string | number;
  type: string;
  transactionFee: string;
  exchangeFee: string;
  exchangeFeeCurrency: string;
  transactionFeeCurrency: string;
}

interface UserAssets extends CommonKeys {
  userId: string;
  assetId: string;
  walletId: string;
  assetAddress: string;
}

interface WhitelistAddress extends CommonKeys {
  userId: string;
  assetAddress: string;
  assetId: string;
  label: string;
  description: string;
  externalWalletId: string;
  status: boolean;
  approvalStatus?: "pending" | "approved" | "rejected" | string;
  Assets: Assets;
  User: Partial<User>;
}
interface Status extends CommonKeys {
  userId: string;
  // assetId: string;
  // walletId: string;
  // assetAddress: string;
}

interface CheckoutFromdata {
  fiatAmount: number;
  receiverAmount: number;
  fiatCurrency: string;
  receiverCurrency: string;
}

interface CheckoutTransaction {
  merchantId: number;
  transactionId: string;
  country: string;
  currency: string;
  fiatCurrency: string;
  fiatAmount: number;
  fiatPaidAmount: number;
  receiverCurrency: string;
  receiverAmount: number;
  receiverAddress: string;
  paymentMethod: string;
  email: string;
  otpVerified: boolean;
  firstName: string;
  lastName: string;
  dob: string;
  customerCountry: string;
  customerAddress: string;
  customerCity: string;
  customerZipcode: string;
  networkFee: number;
  fxmarkUp: number;
  processingFee: number;
  cardNumber: string;
  cardCVV: string;
  cardExpiryDate: string;
  status: string;
  subStatus: string;
  screen: string;
  fiatAmountAfterFees: number;
  price: number;
  clientSecret: string;
  Checkoutmerchant: {
    walletAddress: string;
    payoutType: string;
    projectName: string;
    callbackURL: string;
  };
}

interface PayoutTransaction {
  transactionId: string;
  status: string;
  subStatus: string;
}

interface ExchangeForm {
  from: string;
  pair: string;
  to: string;
  volume: number;
  orderType: string;
  market?: string;
  euroMarket?: number;
  limit?: string;
  receive?: string;
  fxMarkUp?: number;
  exchangePercent: number;
  exchangeFixedFee: number;
  transactionPercent: number;
  transactionFixedFee: number;
  totalFees: number;
  type: string;
  reversed: boolean;
  baseVolume: number;
  transactionFee: number;
  exchangeFee: number;
}

interface TransactionConfirmData {
  clientName: string;
  contactPerson: string;
  ordertype: string;
  walletAddress: string;
  accountNumber?: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}
interface IvyTransaction {
  ivyPaymentLink: string;
  redirectUrl: string;
}

interface AvailablePaymentsType {
  id: number;
  name: string;
}

interface VerificationResponseType {
  transactionId: string;
  availablePayments: AvailablePaymentsType[];
  publicKey: string;
}
