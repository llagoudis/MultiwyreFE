import { useEffect } from "react";
import { getAllAssets } from "~/service/api/accounts";
import {
  getFrequencyTypes,
  getMonthlyRemmitance,
  getBusinessNature,
  getCountries,
  getIncomingPayments,
  getLegalForm,
} from "~/service/api/lib";
import useMasterStore from "~/store/useMasterStore";

const apiFunctions = {
  assets: getAllAssets,
  country: getCountries,
  legalForm: getLegalForm,
  businessNature: getBusinessNature,
  incomingPayments: getIncomingPayments,
  frequencies: getFrequencyTypes,
  monthlyRemmitance: getMonthlyRemmitance,
};

const useAsyncMasterStore = <T extends keyof MasterStoreType>(
  key: keyof MasterStoreType,
): MasterStoreType[T]["data"] => {
  const [state, updateState] = useMasterStore((state) => [
    state[key],
    state.setMasterKey,
  ]);

  useEffect(() => {
    if (!state.updatedWithApi) {
      (async () => {
        const [res] = await apiFunctions[key]();

        if (res?.body) {
          switch (key) {
            case "country":
              updateState(
                key,
                res.body.sort((a, b) => {
                  const nameA = a.name.toUpperCase();
                  const nameB = b.name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                }),
              );
              break;
            default:
              updateState(key, res.body);
              break;
          }
        }
      })();
    }
  }, []);

  const data = state?.data?.filter((item) => item?.fireblockAssetId !== "ANY");

  return data || [];
};

export default useAsyncMasterStore;
