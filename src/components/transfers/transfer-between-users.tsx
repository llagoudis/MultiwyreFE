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

const CryptoWithdrawal = () => {
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

  // useEffect(() => {
  //   // Check if there is data in verificationStatus.isUserVerified
  //   if (verificationStatus.isUserVerified) {
  //     if (verificationStatus.isUserVerified !== "APPROVED") {
  //       router.push("/app/dashboard");
  //       toast.error(
  //         "Profile approval pending. Please contact Exchange CRM team",
  //         { id: "non-verified" },
  //       );
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (priceList) {
      setTransferFees(priceList.TransferFees ?? []);
    }
  }, [priceList]);

  // useEffect(() => {
  //   fetchTransaferFees();
  // }, []);

  const selectedAsset = useWatch({
    control,
    name: "assetId",
  });

  const selectedWhiteList = useWatch({
    control,
    name: "whitelistId",
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
    [selectedAsset],
  );

  const assetBalance = useMemo(
    () => dashboardAssets.find((item) => item.assetId === selectedAsset),
    [selectedAsset],
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

      // Define default values, even if `filteredData` is undefined
      const fees = {
        percent: filteredData?.percent ?? 0, // Default to 0
        fixedfee: filteredData?.fixedFee ?? 0, // Default to 0
        status: res?.success ?? false, // Default to false
        minimumFee: filteredData?.minimumFee ?? "0", // Default to "0" as a string
        maximumFee: filteredData?.maximumFee ?? "0", // Default to "0" as a string
      };

      return fees;
    }

    // Return default values if the response or data is not available
    return {
      percent: 0,
      fixedfee: 0,
      status: false, // Assuming the operation failed or no data
      minimumFee: "0", // Default to "0" as a string
      maximumFee: "0", // Default to "0" as a string
    };
  };

  const onSubmit = async (data: CryptoWithdrawalForm) => {
    const feeData = {
      withdrawal: data?.amount,
      net: 0, // You need to provide a value for net; I'm assuming it's a string for now
      fee: 0, // You need to provide a value for fee; I'm assuming it's a number for now
      minimumFee: "",
      maximumFee: "",
    };

    try {
      const response = await fetchTransaferFees(data);

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

    const [data, error] = await ApiHandler(createTransfer, formData);

    if (data?.success == true) {
      toast.success("Transaction Successful");
      setPopupState("");
    }
  };

  return (
    <div>
      <div className="">
        {!tfaEnabled && (
          <WarningMsg
            element={<span>Please enable two factor authentication</span>}
            handleClickText={"Enable Now"}
            handleClick={() => {
              void Router.push("/app/profile");
            }}
          />
        )}
        <p className="my-4 text-center text-base font-semibold">
          CREATE A NEW TRANSFER
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mx-auto max-w-xl space-y-4">
            <div className="flex flex-col gap-2 rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)]">
              <div className=" ">
                <p className=" py-1">From</p>
                <Controller
                  control={control}
                  name="assetId"
                  rules={{
                    required: "Please select an asset",
                  }}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <Fragment>
                      <Autocomplete
                        size="small"
                        options={filterdAssets}
                        onChange={(_, nextValue) => {
                          onChange(nextValue?.fireblockAssetId ?? ""),
                            setValue("whitelistId", "");
                        }}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => (
                          <li
                            {...props}
                            className="flex cursor-pointer items-center gap-2 p-2"
                          >
                            <Image
                              src={option.icon ?? ""}
                              alt={option.name}
                              width={30}
                              height={30}
                            />
                            {option.name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            className=" flex items-center gap-2 bg-[#ffffff] "
                            {...params}
                            placeholder="Select currency"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (() => {
                                const assetValue = assets?.find(
                                  (item) => item.fireblockAssetId === value,
                                );
                                return (
                                  <Fragment>
                                    {assetValue && (
                                      <Image
                                        className="ml-2 h-5 w-4"
                                        src={assetValue?.icon ?? ""}
                                        alt={assetValue?.name}
                                        width={80}
                                        height={80}
                                      />
                                    )}
                                    {params.InputProps.startAdornment}
                                  </Fragment>
                                );
                              })(),
                            }}
                            variant="outlined"
                          />
                        )}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>

              <div className=" ">
                <div className="flex justify-between">
                  <p className="pt-1">To</p>

                  <Controller
                    name="addressType"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <div className="flex">
                        <ul
                          onClick={() => onChange("ONETIME")}
                          className={`cursor-pointer list-inside rounded p-2 ${
                            value === "WHITELIST"
                              ? "text-[#BABABA]"
                              : "list-disc rounded bg-[#99B2C636] font-semibold text-[#217EFD]"
                          } `}
                        >
                          <li className=" text-sm xl:text-base ">
                            One time address
                          </li>
                        </ul>
                        <ul
                          onClick={() => onChange("WHITELIST")}
                          className={`cursor-pointer list-inside rounded   p-2 ${
                            value === "ONETIME"
                              ? "text-[#BABABA]"
                              : "list-disc rounded bg-[#99B2C636] font-semibold text-[#217EFD]"
                          } `}
                        >
                          <li className="text-sm xl:text-base ">
                            White listed address
                          </li>
                        </ul>
                      </div>
                    )}
                  />
                </div>

                {currentAddressType === "ONETIME" ? (
                  <Controller
                    name="oneTimeAddress"
                    control={control}
                    rules={{
                      required: "Please enter the destination address",
                    }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        <TextField
                          size="small"
                          fullWidth
                          onChange={onChange}
                          value={value}
                          placeholder="Enter Address"
                          variant="outlined"
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />
                ) : (
                  currentAddressType === "WHITELIST" && (
                    <Controller
                      name="whitelistId"
                      control={control}
                      rules={{
                        required: "Please select whitelisted address",
                      }}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <Fragment>
                          <Autocomplete
                            size="small"
                            options={whitelistOptions}
                            onChange={(_, addressId) => {
                              onChange(addressId?.id);
                              // setValue("whitelistId", addressId?.assetAddress);
                            }}
                            value={whitelistedAddress.find(
                              (item) => item?.id == value,
                            )}
                            getOptionLabel={(option) => option.label}
                            renderOption={(props, option) => (
                              <li {...props}>{option.label}</li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select Whitelisted address"
                                variant="outlined"
                              />
                            )}
                          />
                          <p className="text-sm text-red-500">
                            {error?.message}
                          </p>
                        </Fragment>
                      )}
                    />
                  )
                )}
              </div>

              <div className="">
                <div>
                  <p className="mb-1">Net amount</p>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: "Please enter the amount",
                      max: {
                        value: assetBalance?.balance ?? 0,
                        message: "Amount cannot be more than balance",
                      },
                      validate: (amount) =>
                        parseFloat(amount) > 0
                          ? undefined
                          : "Amount cannot be zero or less than zero",
                    }}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          onChange={onChange}
                          value={value ?? ""}
                          placeholder="Amount"
                          variant="outlined"
                          disabled={isMax}
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />
                </div>
                <div className="ml-1 mt-4 flex w-fit items-center gap-2">
                  <input
                    {...register("isMax", {
                      onChange: (event: ChangeEvent<HTMLInputElement>) => {
                        setValue(
                          "amount",
                          event.target?.checked
                            ? String(assetBalance?.balance) ?? "0"
                            : "0",
                        );
                      },
                    })}
                    className=" mt-1 scale-150"
                    type="checkbox"
                    id="max"
                  />
                  <label
                    className="text-md font-bold text-[#6E6E6E]"
                    htmlFor="max"
                  >
                    Max{" "}
                    {assetBalance?.balance
                      ? `${Number(assetBalance?.balance).toFixed(6) ?? 0} ${
                          assetBalance?.name ?? ""
                        }`
                      : 0}
                  </label>
                </div>
              </div>

              <div>
                <p className="">Description</p>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Fragment>
                      <textarea
                        className="mt-2 w-full resize-none rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4]  placeholder:font-normal"
                        placeholder={"Note text"}
                        rows={1}
                        value={value ?? ""}
                        onChange={onChange}
                      />
                    </Fragment>
                  )}
                />
              </div>
              <div className="ml-auto w-fit ">
                <MuiButton
                  name={"Create transfer"}
                  type="submit"
                  width="100%"
                  loading={isSubmitting}
                />
              </div>
            </div>
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

export default CryptoWithdrawal;
