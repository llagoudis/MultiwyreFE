import { create } from "zustand";

const initMaster: MasterStoreType = {
  assets: {
    updatedWithApi: false,
    data: [],
  },
  country: {
    updatedWithApi: false,
    data: [],
  },
  legalForm: {
    updatedWithApi: false,
    data: [],
  },
  businessNature: {
    updatedWithApi: false,
    data: [],
  },
  incomingPayments: {
    updatedWithApi: false,
    data: [],
  },
  frequencies: {
    updatedWithApi: false,
    data: [],
  },
  monthlyRemmitance: {
    updatedWithApi: false,
    data: [],
  },
};

const useMasterStore = create<MasterStoreType & MasterStoreFn>((set) => ({
  ...initMaster,
  setMasterKey(key: keyof MasterStoreType, data: any[]) {
    set({ [key]: { data, updatedWithApi: true } });
  },
}));

export default useMasterStore;
