"use client";
import {
  Fragment,
  useState,
  useMemo,
  useEffect,
  type ChangeEvent,
} from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import MuiButton from "~/components/MuiButton";
import Image, { StaticImageData } from "next/image";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import useGlobalStore from "~/store/useGlobalStore";
import toast from "react-hot-toast";
import useDashboard from "~/hooks/useDashboard";
import WarningMsg from "../common/WarningMsg";
import Router, { useRouter } from "next/router";
import ConfirmDailog from "./confirmDailog";
import { ApiHandler } from "~/service/UtilService";
import {
  createInternalTransfer,
  createTransfer,
  fetchTransaferFeesApi,
} from "~/service/ApiRequests";
import { dateValidation } from "~/helpers/helper";
import { getTransferFeesByPricelistId } from "~/service/api/pricelists";

const WithdrawalInit: CryptoWithdrawalForm = {
  assetId: "",
  amount: "",
  addressType: "ONETIME",
  oneTimeAddress: "",
  whitelistId: "",
  description: "",
  reference: "",
  isMax: false,
  IBAN: "",
  customerName: "",
  address: "",
  zipCode: "",
  city: "",
  countryOfIssue: "",
  swift: "",
  bankName: "",
  bankAddress: "",
  bankLocation: "",
  bankCountry: "",
  transferFee: "",
  paymentSystemType: "",
  customerZipcode: "",
  euroTemplate: "",
  isApproved: false,
};
const FeeInit: CalculatedFee = {
  net: 0,
  withdrawal: "",
  fee: 0,
  minimumFee: "",
  maximumFee: "",
};

const TransferFeesInit: TransferFees = {
  id: NaN,
  priceListId: 0,
  name: "",
  status: "",
  validFrom: "",
  validTo: "",
  currencyId: "",
  percent: 0,
  fixedFee: 0,
  minimumFee: null,
  maximumFee: null,
  transferGroup: "",
  beneficiaryGroup: "",
  paymentMethod: "",
};

const TransferBetweenUsers = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);

  const assets = useAsyncMasterStore<"assets">("assets");
  const filterdAssets = assets.filter(
    (item) =>
      item.fireblockAssetId !== "EUR" && item.fireblockAssetId !== "USD",
  );

  const dashboardAssets = useDashboard()?.assets;
  const [whitelistedAddress, tfaEnabled, getUserPriceList, user, priceList] =
    useGlobalStore((state) => [
      state.whitelistedAddress,
      state.user.tfaEnabled,
      state.getUserPriceList,
      state.user,
      state.priceList,
    ]);

  const [transaction, setTrasaction] = useState<{
    data: CryptoWithdrawalForm;
    fee: CalculatedFee;
  }>({
    data: WithdrawalInit,
    fee: FeeInit,
  });

  const [popupState, setPopupState] = useState<"CONFIRM" | "2FA" | "">("");
  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<CryptoWithdrawalForm>({
    defaultValues: WithdrawalInit,
  });

  useEffect(() => {
    if (user.priceList) {
      getUserPriceList(user.priceList);
    }
  }, []);

  useEffect(() => {
    if (priceList) {
      setTransferFees(priceList.TransferFees ?? []);
    }
  }, [priceList]);

  const selectedAsset = useWatch({
    control,
    name: "assetId",
  });

  const currentAddressType = useWatch({
    control,
    name: "addressType",
  });
  const isMax = useWatch({
    control,
    name: "isMax",
  });

  const whitelistOptions = useMemo(
    () => whitelistedAddress.filter((item) => item.assetId === selectedAsset),
    [selectedAsset, whitelistedAddress],
  );

  const assetBalance = useMemo(
    () => dashboardAssets?.find((item) => item.assetId === selectedAsset),
    [selectedAsset, dashboardAssets],
  );

  const assetValue = assets?.find(
    (item) => item.fireblockAssetId === selectedAsset,
  );

  const fetchTransaferFees = async (assetId: any) => {
    const [res] = await getTransferFeesByPricelistId(dashboard.priceList);

    if (res !== null && "body" in res) {
      const filteredData = res?.body?.find((item: any) => {
        return (
          item?.operationType === 2 &&
          (item?.currencyId === "ANY" || item?.currencyId === assetId)
        );
      });

      const fees = {
        percent: filteredData?.percent ?? 0,
        fixedfee: filteredData?.fixedFee ?? 0,
        status: res?.success ?? false,
        minimumFee: filteredData?.minimumFee ?? "0",
        maximumFee: filteredData?.maximumFee ?? "0",
      };

      return fees;
    }

    return {
      percent: 0,
      fixedfee: 0,
      status: false,
      minimumFee: "0",
      maximumFee: "0",
    };
  };

  const onSubmit = async (data: CryptoWithdrawalForm) => {
    const feeData = {
      withdrawal: data?.amount,
      net: 0,
      fee: 0,
      minimumFee: "",
      maximumFee: "",
    };

    try {
      const response = await fetchTransaferFees(data.assetId);

      const minimumFee = Number(response?.minimumFee);
      const maximumFee = Number(response?.maximumFee);
      const calculatedFee =
        Number(data?.amount) * (response?.percent / 100) +
        Number(response?.fixedfee);
      let finalFee;
      if (
        minimumFee !== null &&
        minimumFee !== 0 &&
        calculatedFee < minimumFee
      ) {
        finalFee = minimumFee;
      } else if (
        maximumFee !== null &&
        maximumFee !== 0 &&
        calculatedFee > maximumFee
      ) {
        finalFee = maximumFee;
      } else {
        finalFee = calculatedFee;
      }
      feeData.net = parseFloat(data?.amount) - finalFee;
      feeData.fee = finalFee;
      if (feeData.net < 0) {
        toast.error("Amount is too low");
        return false;
      }
      if (feeData.net === 0) {
        toast.error("Amount is too low");
        return false;
      }

      if (response?.status) {
        setTrasaction({ data, fee: feeData });
        setPopupState("CONFIRM");
      }
    } catch (error) {
      //
    }
  };

  const on2FASubmit = async () => {
    const formData = {
      assetId: transaction?.data?.assetId,
      amount: transaction?.data?.amount,
      oneTimeAddress:
        transaction.data.addressType === "WHITELIST"
          ? whitelistOptions.find(
              (item) => item.id === transaction.data.whitelistId,
            )?.assetAddress
          : transaction.data.addressType === "ONETIME"
          ? transaction.data.oneTimeAddress
          : "",
      description: transaction?.data?.description,
      transactionFee: transaction?.fee?.fee,
    };

    const [data, error] = await ApiHandler(createInternalTransfer, formData);

    if (data?.success == true) {
      toast.success("Transaction Successful");
      setPopupState("");
    }
  };

  return (
    <div className="py-6">
      <div className="w-full bg-white rounded-3xl p-12 shadow-sm border border-gray-100 min-h-[600px]">
        <h2 className="text-2xl font-bold text-[#1A1C1E] text-center mb-12">Internal Transfer</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1A1C1E] ml-1">Currency</label>
            <Controller
              control={control}
              name="assetId"
              rules={{ required: "Please select an asset" }}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <div className="relative">
                  <Autocomplete
                    size="small"
                    options={filterdAssets}
                    onChange={(_, nextValue) => {
                      onChange(nextValue?.fireblockAssetId ?? "");
                      setValue("whitelistId", "");
                    }}
                    value={assetValue || null}
                    getOptionLabel={(option) => option.name || (typeof value === 'string' ? value : '')}
                    renderOption={(props, option) => (
                      <li {...props} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          <Image src={option.icon ?? ""} alt={option.name} width={24} height={24} className="object-contain" />
                        </div>
                        <span className="font-bold text-sm text-[#1A1C1E]">{option.name}</span>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Currency"
                        error={!!error}
                        InputProps={{
                          ...params.InputProps,
                          className: "rounded-xl bg-white border-gray-200 hover:border-[#4775F2] focus-within:border-[#4775F2] transition-all h-[56px] px-4",
                          startAdornment: assetValue && (
                            <div className="flex items-center mr-2">
                              <Image src={assetValue.icon ?? ""} alt={assetValue.name} width={24} height={24} className="object-contain" />
                            </div>
                          ),
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: "#E2E8F0" },
                      },
                    }}
                  />
                  {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#1A1C1E] ml-1">Amount</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Please enter the amount",
                  max: { value: assetBalance?.balance ?? 0, message: "Insufficient balance" },
                  validate: (val) => parseFloat(val) > 0 || "Amount must be greater than zero",
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <div className="flex flex-col">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className={`w-full h-[56px] pl-8 pr-44 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] focus:ring-0 transition-all font-bold text-[#1A1C1E] outline-none`}
                      onChange={onChange}
                      value={value || ""}
                      disabled={isMax}
                    />
                    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                  </div>
                )}
              />
              <button
                type="button"
                onClick={() => {
                  setValue("isMax", true);
                  setValue("amount", String(assetBalance?.balance || "0"));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#F0F5FF] text-[#4775F2] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#E2E8FF] transition-colors border border-[#4775F2]/20"
              >
                Max ({assetBalance?.balance ? `${Number(assetBalance.balance).toFixed(6)} ${assetBalance.name}` : "0.00"})
              </button>
            </div>
          </div>

          {/* Wallet Address Section */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-[#1A1C1E] ml-1">Receiver Details</label>
            <Controller
              name="addressType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex bg-[#F8F9FA] p-1.5 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => onChange("ONETIME")}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${value === "ONETIME" ? "bg-white text-[#FF3D71] shadow-sm" : "text-[#8B8D91] hover:text-white"}`}
                  >
                    Internal Address
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("WHITELIST")}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${value === "WHITELIST" ? "bg-white text-[#4775F2] shadow-sm" : "text-[#8B8D91] hover:text-white"}`}
                  >
                    Whitelisted
                  </button>
                </div>
              )}
            />

            {currentAddressType === "ONETIME" ? (
              <Controller
                name="oneTimeAddress"
                control={control}
                rules={{ required: "Please enter receiver address" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <div className="flex flex-col">
                    <input
                      placeholder="Enter Internal Wallet Address"
                      className={`w-full h-[56px] px-4 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E]`}
                      onChange={onChange}
                      value={value || ""}
                    />
                    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                  </div>
                )}
              />
            ) : (
              <Controller
                name="whitelistId"
                control={control}
                rules={{ required: "Please select a whitelisted address" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <div className="relative">
                    <Autocomplete
                      size="small"
                      options={whitelistOptions}
                      onChange={(_, addr) => onChange(addr?.id)}
                      value={whitelistedAddress.find(item => item.id == value) || null}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Whitelisted address"
                          error={!!error}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              height: "56px",
                              "& fieldset": { borderColor: "#E2E8F0" },
                            },
                          }}
                        />
                      )}
                    />
                    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                  </div>
                )}
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, value } }) => (
                <textarea
                  placeholder="Add a note or description"
                  className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E] resize-none"
                  value={value || ""}
                  onChange={onChange}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-gradient text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 min-w-[200px]"
            >
              {isSubmitting ? "Processing..." : "Internal Transfer"}
            </button>
          </div>
        </form>

        <TransitionDialog open={!!popupState} onClose={() => setPopupState("")}>
          {popupState === "CONFIRM" ? (
            <ConfirmDailog
              assetAddress={
                transaction.data.addressType === "ONETIME"
                  ? transaction.data.oneTimeAddress
                  : whitelistOptions.find(
                      (item) => item.id === transaction.data.whitelistId,
                    )?.assetAddress
              }
              label={
                transaction.data.addressType === "WHITELIST"
                  ? whitelistOptions.find(
                      (item) => item.id === transaction.data.whitelistId,
                    )?.label
                  : ""
              }
              amount={transaction?.fee}
              onClose={() => {
                setPopupState("");
              }}
              onConfirm={() => {
                setPopupState("2FA");
              }}
            />
          ) : (
            popupState === "2FA" && (
              <TwoFA
                onClose={() => {
                  setPopupState("");
                }}
                onSubmit={on2FASubmit}
              />
            )
          )}
        </TransitionDialog>
      </div>
    </div>
  );
};

export default TransferBetweenUsers;
