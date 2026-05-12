import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

const getTransferFeesByPricelistId = async (
  id: number,
): APIFunction<TransferFees[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/price-list/transfer-fees/${id}`),
  );

const getOperationTypeUserpanel = async (): APIFunction<TransferFees[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/lib/operation-types-users`),
  );

export { getTransferFeesByPricelistId, getOperationTypeUserpanel };
