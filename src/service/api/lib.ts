import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import AxiosInstance from "~/components/service/ApiService";

const getCountries = async (): APIFunction<Country[]> =>
  await ApiHandler(() => AxiosInstance.get("/lib/get-all-countries"));

const getLegalForm = async (): APIFunction<GenericMasterType[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/get-legal-form"));

const getBusinessNature = async (): APIFunction<BusinessNature[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/business-nature"));

const getIncomingPayments = async (): APIFunction<Country[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/incoming-payments"));

const getFrequencyTypes = (): APIFunction<Country[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/lib/payment-frequency"));

const getMonthlyRemmitance = (): APIFunction<Country[]> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/lib/monthly-remittance"));

const getAllOperationTypes = async (): APIFunction<OperationType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/operation-types"));

export {
  getCountries,
  getLegalForm,
  getBusinessNature,
  getIncomingPayments,
  getFrequencyTypes,
  getMonthlyRemmitance,
  getAllOperationTypes,
};
