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
    `transaction/reports?${convertUrlParams(params)}`,
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

const getExchangeTxns = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/exchange/reports?${convertUrlParams(params)}`,
  );
};

export {
  createInternalTransaction,
  createTransaction,
  getEcomTransactions,
  getEuroTemplates,
  getExchangeTxns,
  getLimits,
  getTransactionFee,
  getTransactions,
};
