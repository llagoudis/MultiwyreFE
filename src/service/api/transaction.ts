import { convertUrlParams } from "~/helpers/helper";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const createTransaction = (data: CryptoWithdrawalForm) =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction", data));

const getTransactionFee = (
  data: CryptoWithdrawalForm | CryptoTransferForm,
): APIFunction<CalculatedFee> =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction/fee", data));

const createInternalTransaction = (data: CryptoTransferForm) =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction/internal", data));

const getTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reportsPDF?${convertUrlParams(params)}`,
  );
};

const getEcomTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/ecom-transaction-reports?${convertUrlParams(params)}`,
  );
};

const getLimits = async (id: any): APIFunction<Limits[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/exchange-limits/limit/${id}`),
  );

const getEuroTemplates = async (): APIFunction<EuroMail[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/exchange/euro-templates"),
  );

/** Multiwyre EUR settlement details from Admin Beneficiary (read-only). */
export type CompanyBeneficiary = {
  iban?: string;
  customerName?: string;
  customerAddress?: string;
  customerZip?: string;
  destinationAddress?: string;
  customerSwift?: string;
  bankName?: string;
  bankAddress?: string;
  bankLocation?: string;
  bankCountry?: string;
  bankReference?: string;
};

const getCompanyBeneficiary = async (): APIFunction<CompanyBeneficiary> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/exchange/company-beneficiary"),
  );

export type OtcDepositAddress = {
  id?: number | null;
  assetId: string;
  address: string;
  label?: string;
};

const getOtcDepositAddresses = async (): APIFunction<OtcDepositAddress[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/exchange/otc-deposit-addresses"),
  );

const getExchangeTxns = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reports?${convertUrlParams({
      ...params,
      operationType: 5,
    })}`,
  );
};

export {
  createInternalTransaction,
  createTransaction,
  getCompanyBeneficiary,
  getEcomTransactions,
  getEuroTemplates,
  getExchangeTxns,
  getLimits,
  getOtcDepositAddresses,
  getTransactionFee,
  getTransactions,
};
