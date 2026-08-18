import axios from "axios";
import type {
  getEmailOtpReq,
  verifyOtpReq,
} from "~/types/IdentityVerification";
import toast from "react-hot-toast";
import ProtectedAxiosInstance from "./ProtectedAxiosInstance";
import type { CompanyDataReq } from "~/types/CompanyVerification";
import { type Transfer } from "~/types/createTransfer";
// import axiosRetry from "axios-retry";
import { convertUrlParams, encryptPayload } from "~/helpers/helper";
import { ApiHandler } from "./UtilService";

const AxiosInstanceEncrypt = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const MerchantAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// axiosRetry(AxiosInstance, {
//   retries: 10,
//   retryDelay: axiosRetry.exponentialDelay,
//   retryCondition: (error: any) => {
//     if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
//       if (error?.config?.url) {
//         const excludedEndpoints = [
//           "/exchange/addOrder",
//           "/transaction",
//           "/signup",
//         ];
//         const requestUrl = error.config.url;
//         if (
//           excludedEndpoints.some((endpoint) => requestUrl.includes(endpoint))
//         ) {
//           console.log("error?.config?.url: ", error?.config?.url);

//           return false;
//         }
//       }
//     }
//     if (error?.response?.status) {
//       return error.response.status >= 450;
//     }

//     return false;
//   },
// });

AxiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    config.data = encryptPayload(config.data);

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

AxiosInstance.interceptors.response.use(
  (response) => {
    // const data = response?.data?.body;
    // if (data.token) {
    //   localStorageService.setLocalAccessToken(data.token);
    // }

    return response;
  },
  (error) => {
    if (error.message === "Network Error" && !error.response) {
      // toast.error("Network error - Make sure API's are running");
    }

    if (error.response.status === 500) {
      toast.error("Something went wrong from our side!! Please try again.");
    }

    return Promise.reject(error);
  },
);

export const forgotPassword = (data: ForgotPassword) =>
  AxiosInstance.post(`/forgotPassword/forgot-password`, data);
export const resetPassword = (id: number | string, token: string) =>
  ProtectedAxiosInstance.get(`/forgotPassword/reset-password/${id}/${token}`);
export const login = (data: Login) => AxiosInstance.post("/auth", data);

export const checkUserByIP = (data: UserByIP) =>
  AxiosInstance.post("/auth/checkUserByIp", data);

export const signup = (data: Signup) => AxiosInstance.post("/signup", data);

export const verifyOtp = (data: VerifyOTP) =>
  AxiosInstance.post("/auth/verify-otp", data);

export const resendOtp = (data: ResendOTP) =>
  AxiosInstance.post("/auth/resend-otp", data);

export const identityVerifyGetEmailOtp = (data: getEmailOtpReq) =>
  ProtectedAxiosInstance.post("/verify/get-email-otp", data);

export const identityVerifyOtp = (data: verifyOtpReq) =>
  ProtectedAxiosInstance.post("/verify/user/email", data);

export const identityVerifyGetPhoneOtp = (data: getEmailOtpReq) =>
  ProtectedAxiosInstance.post("/verify/get-phone-otp", data);

export const identityVerifyPhoneOtp = (data: verifyOtpReq) =>
  ProtectedAxiosInstance.post("/verify/verify-phone", data);

export const identityVerifyDocUpload = (data: FormData) => {
  console.log("data: ", data);
  return ProtectedAxiosInstance.post("/verify/user/identity", data, {
    headers: {
      "Content-Type": "form-data",
    },
  });
};

export const createCSVTransafer = (data: FormData) =>
  ProtectedAxiosInstance.post("/transaction/csv_transaction", data, {
    headers: {
      "Content-Type": "form-data",
    },
  });

export const getCSVTransactions = () =>
  ProtectedAxiosInstance.get("transaction/csv_transaction");

export const identityVerifyAddressVerification = (data: FormData) =>
  ProtectedAxiosInstance.post("/verify/user/address", data, {
    headers: {
      "Content-Type": "form-data",
    },
  });

export const fetchCountries = () => AxiosInstance.get("/lib/get-all-countries");

export const getLegalDocuments = () =>
  AxiosInstance.get("documents/legal-documents");

export const getInvoices = (params: FilterType) =>
  ProtectedAxiosInstance.get(`invoice/addinvoice?${convertUrlParams(params)}`);

export const getInvoicesById = (id: string) =>
  AxiosInstance.get(`invoice/${id}`);

export const pricelistFn = (projectId: string) =>
  AxiosInstance.get(`ecommerce/getcomppricelist/${projectId}`);

export const createInvoices = (data: InvoiceForm) =>
  ProtectedAxiosInstance.post("invoice/addinvoice", data);

export const updateInvoiceTransactions = (data: any) =>
  AxiosInstance.put("ecomtransaction/update", data);

export const updateInvoicePaymentTransactions = (data: any) =>
  AxiosInstance.put("ecomtransaction/updatepayment", data);

export const createEncryptedTransactions = (data: InvoicePay) =>
  AxiosInstance.put("ecomtransaction/createtransactionencypt", data);

export const getAssets = () => AxiosInstance.get("/accounts/assets");

export const getAllLegalForms = () =>
  ProtectedAxiosInstance.get("/lib/get-legal-form");

export const getBusinessNature = () =>
  ProtectedAxiosInstance.get("/lib/business-nature");

export const getAllPaymentTypes = () =>
  ProtectedAxiosInstance.get("/lib/incoming-payments");

export const getAllFrequencyTypes = () =>
  ProtectedAxiosInstance.get("/lib/payment-frequency");

export const getAllMonthlyRemmitance = () =>
  ProtectedAxiosInstance.get("/lib/monthly-remittance");

export const createTransfer = (data: Transfer) =>
  ProtectedAxiosInstance.post("/transaction", data);

export const createInternalTransfer = (data: Transfer) =>
  ProtectedAxiosInstance.post("/transaction/internal", data);

export const createExchangeTransaction = (data: Transfer) => {
  return ProtectedAxiosInstance.post("/exchange/addOrder", data);
};

export const updateExchangeTransaction = (data: Transfer) =>
  ProtectedAxiosInstance.post("/exchange/update-transaction", data);

export const companyVerificationGetOtp = (data: CompanyDataReq) => {
  return ProtectedAxiosInstance.post(
    "/company-verification/add-company-profile",
    data,
  );
};

export const fetchOperationTypes = () =>
  ProtectedAxiosInstance.get("/lib/operation-types");

export const fetchTransaferFeesApi = () =>
  ProtectedAxiosInstance.get("/price-list/transferfees");

export const getFxMarkup = async (id: number): APIFunction<FXMarkup[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/price-list/fxmarkupfees/${id}`),
  );

export const SendOTCTradeMail = (data: OTCMail) =>
  ProtectedAxiosInstance.post("/exchange/otc-trade", data);

export const SendEuroMail = (data: EuroMail) =>
  ProtectedAxiosInstance.post("/exchange/euro-transaction", data);

export const saveEuroTemplate = (data: EuroMail) =>
  ProtectedAxiosInstance.post("/exchange/euro-templates", data);

export const companyVerificationVerifyOtp = (data: CompanyDataReq) =>
  ProtectedAxiosInstance.post("/company-verification/verify-email", data);

export const companyVerificationSetPassword = (data: CompanyDataReq) =>
  ProtectedAxiosInstance.post(
    "/company-verification/update-profile-password",
    data,
  );

export const companyVerificationSubmitBasicEntity = (data: CompanyDataReq) =>
  ProtectedAxiosInstance.post(
    "/company-verification/add-company-entity-info",
    data,
  );

export const companyVerificationSubmitPaymentInfo = (data: CompanyDataReq) =>
  ProtectedAxiosInstance.post(
    "/company-verification/add-company-payment-info",
    data,
    {
      headers: {
        "Content-Type": "form-data",
      },
    },
  );

export const updateProfilePicture = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/update-profile-photo", data);

export const updateInvoicePicture = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/update-invoice-photo", data, {
    headers: {
      "Content-Type": "form-data",
    },
  });

export const updatePassword = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/reset-password", data);

export const get2FAQRCode = () =>
  ProtectedAxiosInstance.get("/auth/two-factor-authenticator");

export const submit2FAOtp = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", data);

export const fetchUserById = async (data: any) =>
  await ProtectedAxiosInstance.get(`/user/${data.id}`);

export const fetchSecurity = () => AxiosInstance.get("/security");

export const getMerchantUrlToken = (data: {
  projectId: string;
  privateKey: string;
  publicKey: string;
}) => MerchantAxiosInstance.post("/merchant/merchant-url-token", data);

export const createEcomUrlTransaction = (
  data: {
    customerId: string;
    orderId: string;
    requestedAmount: string;
    requestedAssetId: string;
    successRedirectURL: string;
    failedRedirectURL: string;
    customerEmail?: string;
  },
  token: string,
) =>
  MerchantAxiosInstance.post("/ecomtransaction/url/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getEconUrlTransaction = (data: any) =>
  AxiosInstance.post("/ecomtransaction/url/transaction/get", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateEconUrlTransaction = (data: any) =>
  AxiosInstanceEncrypt.post(`/ecomtransaction/url/update`, data, {});

export const verifyMerchantKeys = (data: any) =>
  AxiosInstance.post("/checkout-merchant/verify", data);

export const fetchCheckoutTrxById = (data: any) =>
  AxiosInstance.get(`/checkout-merchant/transactions/${data?.trxId}`);

export const updateCheckoutTrxById = (data: any) =>
  AxiosInstance.put(
    `/checkout-merchant/transactions/${data?.transactionId}`,
    data,
  );

export const sendOtpToCheckoutEmail = (data: any) =>
  AxiosInstance.post(`/checkout-merchant/send-otp`, data);

export const verifyOtpToCheckoutEmail = (data: any) =>
  AxiosInstance.post(`/checkout-merchant/verify-otp`, data);

export const fetchCheckoutFees = (data: any) =>
  AxiosInstance.get(`/checkout-merchant/checkout-fees/${data?.id}`);

export const startPayoutFromMasterWallet = (data: any) =>
  AxiosInstance.post(`/checkout-merchant/payout-trx/`, data);

export const fetchPayoutTrxById = (data: any) =>
  AxiosInstance.get(`/checkout-merchant/payout-trx/${data?.trxId}`);

export const fetchAddressDetails = (projectId?: string) =>
  ProtectedAxiosInstance.get(`/accounts/checkClientDetails`, {
    params: { projectId },
  });

export const convertImageToBase64Api = (data: { imageUrl: string }) => {
  return ProtectedAxiosInstance.post("/accounts/convertImageToBase64", data);
  
  
};
export const createIvySession = (data: any) =>
  AxiosInstance.post(`/openBanking/createSession`,data);