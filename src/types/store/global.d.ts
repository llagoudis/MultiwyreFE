interface user {
  azureId: string;
  fullname: string;
  countryCode: string;
  phone: string;
  email: string;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  isAddressVerified: boolean;
  isCompanyVerified: verificationStates;
  isUserVerified: verificationStates;
  status: string | number;
  roles: string;
  reasonForRejection: string;
  token: string;
  tfaEnabled: boolean;
  profileImgLink: string;
  invoiceImgLink: string;
  priceList: number;
  companyProfileDetails: {
    isEmailVerified: boolean;
    verificationStatus: verificationStates;
    reasonForRejection: string;
    companyLegalForm: string;
    companyEmail: string;
    companyName: string;
    isPasswordSet: boolean;
  };
}

interface PriceList {
  name: string;
  clientType: "user" | "company" | "";
  companyType: string;
  standard: boolean;
  externalFeeEnabled: boolean;
  FxMarkupFees?: FXMarkup[];
  TransferFees?: TransferFees[];
  RecurringFees?: RecurringFees[];
  updatedWithApi: boolean;
}

interface GlobalStoreType {
  dashboard: DashboardType;
  admin: AdminProfile;
  user: user;
  setupComplete: "COMPLETE" | "PENDING" | "FAILED";
  whitelistedAddress: WhitelistAddress[];
  whiteListSynced: boolean;
  priceList: PriceList;
}

interface GlobalHelperFn {
  syncDashboard: () => void;
  syncAdminProfile: () => void;
  completeSetup: () => Promise<boolean>;
  resetStore: () => void;
  syncWhitelistedAddress: () => Promise<void>;
  getUserPriceList: (id) => void;
}

interface Window {
  ethereum?: any;
}
