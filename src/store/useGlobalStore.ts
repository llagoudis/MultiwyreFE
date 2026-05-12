import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getAdminProfile,
  getDashboard,
  getPriceList,
  getWhitelistedAddress,
  runSetup,
} from "~/service/api/accounts";

const initGlobal: GlobalStoreType = {
  dashboard: {
    id: "",
    firstname: "",
    lastname: "",
    azureId: "",
    walletId: "",
    updatedWithApi: false,
    assets: [],
    currency: "",
    totalValue: 0,
    isCompanyVerified: "",
    isUserVerified: "",
    priceList: 0,
    limitList: NaN,
  },
  user: {
    azureId: "",
    fullname: "",
    countryCode: "",
    phone: "",
    email: "",
    isEmailVerified: false,
    isIdentityVerified: false,
    isAddressVerified: false,
    isCompanyVerified: "PENDING",
    isUserVerified: "PENDING",
    status: 0,
    roles: "",
    reasonForRejection: "",
    token: "",
    tfaEnabled: false,
    profileImgLink: "",
    priceList: 0,
    invoiceImgLink: "",
    companyProfileDetails: {
      isEmailVerified: false,
      verificationStatus: "PENDING",
      reasonForRejection: "",
      companyLegalForm: "",
      companyEmail: "",
      companyName: "",
      isPasswordSet: false,
    },
  },
  whitelistedAddress: [],
  setupComplete: "PENDING",
  whiteListSynced: false,
  admin: {
    profileImgLink: "",
    companyLegalName: "",
    companyAddress: "",
    email: "",
    tabName: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
    id: 0,
    updatedWithApi: false,
  },
  priceList: {
    id: "",
    name: "",
    clientType: "",
    companyType: "",
    standard: false,
    externalFeeEnabled: false,
    updatedWithApi: false,
  },
};

const useGlobalStore = create(
  persist<GlobalStoreType & GlobalHelperFn>(
    (set, get) => ({
      ...initGlobal,

      async syncDashboard() {
        const [res, error] = await getDashboard();
        if (res?.success) {
          set({ dashboard: { ...res.body, updatedWithApi: true } });
        }
      },

      async syncAdminProfile() {
        const [res, error] = await getAdminProfile();
        if (res?.success) {
          const response = res?.body[0];
          if (response) set({ admin: { ...response, updatedWithApi: true } });
        }
      },

      async completeSetup() {
        const setupComplete = get().setupComplete;
        if (setupComplete === "COMPLETE") {
          return true;
        }

        const [res, err] = await runSetup();

        if (res?.success) {
          set({ setupComplete: "COMPLETE" });

          // const [res, error] = await getDashboard();
          // if (res?.success) {
          //   set({ dashboard: { ...res?.body, updatedWithApi: true } });
          // }
          return true;
        }
        if (err) {
          set({ setupComplete: "FAILED" });
          return false;
        }
        return false;
      },

      async syncWhitelistedAddress() {
        const state = get().whiteListSynced;

        if (!state) {
          await getWhitelistedAddress().then(([res]) => {
            if (res?.success) {
              set({ whitelistedAddress: res.body, whiteListSynced: true });
            }
          });
        }
      },
      resetStore: () => {
        set(initGlobal);
      },
      async getUserPriceList(id: number) {
        const [res] = await getPriceList(id);
        if (res?.success) {
          set({ priceList: { ...res?.body, updatedWithApi: true } });
        }
      },
    }),
    {
      name: "exchange-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          ...state,
          ...initGlobal,
          user: state.user,
          setupComplete: state.setupComplete,
          whitelistedAddress: state.whitelistedAddress,
          dashboard: state.dashboard,
          admin: state.admin,
        };
      },
      skipHydration: true,
    },
  ),
);

export default useGlobalStore;
