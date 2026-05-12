interface APIResponse<T> {

  body: T;
  success?: boolean;
  message?: string;
}
type APIFunction<T> = Promise<[APIResponse<T> | null, null | string]>;
type APIResult<T> = [APIResponse<T> | null, null | string];

interface Signup {
  firstname: string;
  lastname: string;
  phone: string;
  password: string;
  countryCode: string;
  dob: string;
}

interface Login {
  phone: string;
  password: string;
  ipAddress: string | null;
}

interface UserByIP {
  ip: string;
}

interface ForgotPassword {
  email: string;
}

interface VerifyOTP {
  code: string;
  otpTransactionId: string | undefined;
}

interface ResendOTP {
  otpTransactionId: string | undefined;
}

interface DashboardAssetType {
  walletId: string;
  assetAddress: string;
  assetId: string;
  icon: string;
  name: string;
  qrImage: string;
  assetPrice: string;
  id: string | number;
  balance: string;
  assetValue: number;
}

interface DashboardType {
  id: string | number;
  firstname: string;
  lastname: string;
  azureId: string;
  walletId: string | number;
  totalValue: number;
  assets: DashboardAssetType[];
  currency: string;
  updatedWithApi: boolean;
  isUserVerified: string;
  isCompanyVerified: string;
  priceList: number;
  limitList: number;
}
