import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const getAllAssets = async (): APIFunction<Assets[]> =>
  ApiHandler(async () => await ProtectedAxiosInstance.get("/accounts/assets"));

const runSetup = async (): APIFunction<never> =>
  ApiHandler(async () => await ProtectedAxiosInstance.get("/accounts/setup"));

const getDashboard = async (): APIFunction<DashboardType> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("/accounts/dashboard"),
  );

const checkUserStatus = async (): APIFunction<Status> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("/accounts/checkStatus"),
  );

const checkMerchants = async (): Promise<any> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("ecommerce/checkmerchant"),
  );

const getAllCustomerMerchants = async (): Promise<any> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("ecommerce/getmerchants"),
  );

export const getAdminProfile = async (): APIFunction<AdminProfile[]> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("/admin/admin-profile"),
  );

const getPriceList = async (id: number): APIFunction<PriceList> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get(`/accounts/price-list/${id}`),
  );

const getWhitelistedAddress = (): APIFunction<WhitelistAddress[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/accounts/whitelist"));

const createWhitelistAddress = (
  data: TemplateFormType,
): APIFunction<WhitelistAddress> =>
  ApiHandler(() => ProtectedAxiosInstance.post("/accounts/whitelist", data));

const deleteWhitelistAddress = (id: number | string): APIFunction<number> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/accounts/whitelist/${id}`, {}),
  );

const updateWhitelistAddress = (
  id: number | string,
  data: Partial<TemplateFormType>,
): APIFunction<WhitelistAddress> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.patch(`/accounts/whitelist/${id}`, data),
  );

const getPaymentActivity = async (): Promise<any> =>
  ApiHandler(
    async () =>
      await ProtectedAxiosInstance.get("transaction/accountBalanceStats"),
  );

const getDepositActivity = async (): Promise<any> =>
  ApiHandler(
    async () =>
      await ProtectedAxiosInstance.get("ecommerce/payment-activity-deposit"),
  );


const getWithdrawActivity = async (): Promise<any> =>
  ApiHandler(
    async () =>
      await ProtectedAxiosInstance.get("ecommerce/payment-activity-withdraw"),
  );

export {
  getAllAssets,
  runSetup,
  getDashboard,
  getWhitelistedAddress,
  getPriceList,
  createWhitelistAddress,
  deleteWhitelistAddress,
  updateWhitelistAddress,
  checkUserStatus,
  checkMerchants,
  getAllCustomerMerchants,
  getPaymentActivity,
  getWithdrawActivity,
};
