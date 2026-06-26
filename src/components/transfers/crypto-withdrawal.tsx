"use client";
import {
  Fragment,
  useState,
  useMemo,
  type ChangeEvent,
  useEffect,
} from "react";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import MuiButton from "~/components/MuiButton";
import Image, { type StaticImageData } from "next/image";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import useGlobalStore from "~/store/useGlobalStore";
import {
  createTransaction,
  getLimits,
  getEuroTemplates,
  getTransactionFee,
} from "~/service/api/transaction";
import toast from "react-hot-toast";
import useDashboard from "~/hooks/useDashboard";
import WarningMsg from "../common/WarningMsg";
import Router, { useRouter } from "next/router";
import ConfirmDailog from "./confirmDailog";
import { ApiHandler } from "~/service/UtilService";
import {
  SendEuroMail,
  SendOTCTradeMail,
  createTransfer,
  fetchTransaferFeesApi,
  saveEuroTemplate,
} from "~/service/ApiRequests";
import ExchangeDropdown from "../common/ExchangeDropdown";
import { CountryListType, DropDownOptionsType } from "~/types/Common";
import Close from "~/assets/general/close.svg";
import SelectComponent from "../common/SelectComponent";
import {
  changeName,
  coinForKrakenName,
  dateValidation,
  formatDate,
} from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import Button from "../common/Button";
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

interface Template {
  index: number;
  templateName: string;
}

interface TransactionConfirmData {
  clientName: string;
  contactPerson: string;
  date: string;
  fromCurrency: string;
  amount?: string;
  accountNumber?: string;
}

const CryptoWithdrawal = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);
  const router = useRouter();
  const countryList = useAsyncMasterStore<"country">("country");

  // Accessing router properties
  const { pathname, query, asPath } = router;

  const assets = useAsyncMasterStore<"assets">("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
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
  const [open, setOpen] = useState<string>("");
  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
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

  const assetId = watch("assetId");
  const amount = watch("amount");
  const transferFee = watch("transferFee");

  const selectedAsset = useWatch({
    control,
    name: "assetId",
  });

  const [limits, setLimits] = useState<Limits[]>();

  const [euroTemplates, setEuroTemplates] = useState<EuroMail[]>();
  const [adminEmail, setAdminEmail] = useState("");
  const [otcConfirmData, setOtcConfirmData] = useState<any>();

  useEffect(() => {
    // Check if there is data in verificationStatus.isUserVerified

    if (query?.from) {
      setValue(
        "assetId",
        query?.from?.toString() ? query?.from?.toString() : "",
      );
    } else if (query?.amount) {
      setValue(
        "assetId",
        query?.assetId?.toString() ? query?.assetId?.toString() : "",
      );

      setValue(
        "amount",
        query?.amount?.toString() ? query?.amount?.toString() : "",
      );

      setValue(
        "oneTimeAddress",
        query?.sourceAddress?.toString()
          ? query?.sourceAddress?.toString()
          : "",
      );
    }

    getLimits(dashboard.limitList).then(([res]) => {
      if (res?.success && res?.body) {
        setLimits(res?.body);
      }
    });

    fetchTemplates();

    const adminEmail = localStorageService.getAdminEmail();
    if (adminEmail) setAdminEmail(adminEmail);
  }, []);

  function fetchTemplates() {
    getEuroTemplates().then(([res]) => {
      if (res?.success && res?.body) {
        const newArray = res?.body?.map((item, index) => ({
          index: index,
          ...item,
        }));

        setEuroTemplates(newArray);
      }
    });
  }

  const admin = useGlobalStore((state) => state.admin);

  useEffect(() => {
    if (priceList) {
      setTransferFees(priceList.TransferFees ?? []);
    }
  }, [priceList]);

  const template = watch("euroTemplate");

  const isTemplateApproved = watch("isApproved");

  const isTemplateSelected = watch("euroTemplate");

  useEffect(() => {
    const selectedTemplate = euroTemplates?.find(
      (item) => item.templateName === template,
    );

    setValue("IBAN", selectedTemplate?.IBAN ?? "");
    setValue("customerName", selectedTemplate?.customerName ?? "");
    setValue("address", selectedTemplate?.customerAddress ?? "");
    setValue("customerZipcode", selectedTemplate?.customerZipcode ?? "");
    setValue("city", selectedTemplate?.customerCity ?? "");
    setValue("countryOfIssue", selectedTemplate?.customerCountry ?? "");
    setValue("swift", selectedTemplate?.swift ?? "");
    setValue("bankName", selectedTemplate?.bankName ?? "");
    setValue("bankAddress", selectedTemplate?.bankAddress ?? "");
    setValue("bankLocation", selectedTemplate?.bankLocation ?? "");
    setValue("bankCountry", selectedTemplate?.bankCountry ?? "");
    setValue("description", selectedTemplate?.description ?? "");
    setValue("reference", selectedTemplate?.reference ?? "");
    setValue("isApproved", selectedTemplate?.isApproved ?? false);
  }, [template]);

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
    [selectedAsset, dashboard],
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

  const [euroTrasaction, setEuroTrasaction] = useState<EuroMail>();

  const fetchLimitsPair = async (value: string) => {
    const pair2 = coinForKrakenName(value) + "/EUR";
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${changeName(pair2)}`,
      );

      const data = await response.json();

      if (data.result[changeName(pair2)]) {
        return data.result[changeName(pair2)]?.a[0];
      }
    } catch (error) { }
  };

  const onSubmit = async (data: CryptoWithdrawalForm) => {
    if (selectedAsset === "EUR" && !isTemplateSelected) {
      void handleSaveTemplate();
    } else {
      const feeData = {
        withdrawal: data?.amount,
        net: 0,
        fee: 0,
        minimumFee: "",
        maximumFee: "",
      };

      let euroData: EuroMail = {
        IBAN: data?.IBAN ?? "",
        customerName: data?.customerName ?? "",
        customerAddress: data?.address ?? "",
        customerZipcode: data?.customerZipcode ?? "",
        customerCity: data?.city ?? "",
        customerCountry: data?.countryOfIssue,
        swift: data?.swift ?? "",
        bankName: data?.bankName,
        bankAddress: data?.bankAddress,
        bankLocation: data?.bankLocation,
        bankCountry: data?.bankCountry,
        paymentSystemType: data?.paymentSystemType,
        reference: data?.reference,
        isApproved: data?.isApproved,
        //
        amount: data?.amount,
        description: data?.description,
        userId: dashboard?.azureId,
        firstname: dashboard?.firstname,
        lastname: dashboard?.lastname,
        id: dashboard?.id ? dashboard?.id : 0,
        currency: selectedAsset,
        transferFee: data?.transferFee ?? "--",
      };

      const selectedTemplate = euroTemplates?.find(
        (item) => item.templateName === template,
      );

      if (selectedTemplate) {
        euroData = { ...euroData, templateId: selectedTemplate.id };
      }

      setEuroTrasaction(euroData);

      const euroValue = await fetchLimitsPair(selectedAsset);

      const limitValue =
        selectedAsset === "EUR"
          ? Number(data.amount ?? 0)
          : Number(data.amount ?? 0) * Number(euroValue ?? 0);

      const errorConditionBuy = limits?.some((item) => {
        if (
          (item.currencyId === selectedAsset || item.currencyId === "ANY") &&
          item.exchangeType === "WITHDRAWAL" &&
          item.exchangeLimit === "MIN"
        ) {
          return limitValue <= Number(item.amount);
        } else if (
          (item.currencyId === selectedAsset || item.currencyId === "ANY") &&
          item.exchangeType === "WITHDRAWAL" &&
          item.exchangeLimit === "MAX"
        ) {
          return limitValue >= Number(item.amount);
        } else {
          return false;
        }
      });

      if (errorConditionBuy) {
        setOpen("otcPopup");
        // SendOTCPopup();
        // setOpen("otcPopupOne");
      } else {
        try {
          if (selectedAsset === "EUR") {
            setPopupState("2FA");
          } else {
            const response = await fetchTransaferFees(data?.assetId);
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
          }
        } catch (error) {
          // Handle the error if needed
        }
      }
    }
  };

  useEffect(() => {
    const fetchTransferFees = async () => {
      const response = await fetchTransaferFees(selectedAsset);

      const minimumFee = Number(response?.minimumFee);
      const maximumFee = Number(response?.maximumFee);

      const calculatedFee =
        Number(amount) * (response?.percent / 100) + Number(response?.fixedfee);

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

      setValue("transferFee", finalFee.toString());
    };

    fetchTransferFees();
  }, [amount]);

  const paymentSystemList = [{ value: "SEPA", label: "SEPA" }];

  const on2FASubmit = async () => {
    if (selectedAsset === "EUR") {
      const [res, error] = await ApiHandler(SendEuroMail, euroTrasaction);
      if (res?.success) {
        setOpen("EURO");
        setPopupState("");
      }
    } else {
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
        toast.success("Transaction Submitted");
        setPopupState("");
        reset();
      }

      if (error) {
        setPopupState("");
      }
    }
  };

  function SendOTCPopup() {
    const date = JSON.parse(JSON.stringify(new Date()));

    const transactionData: TransactionConfirmData = {
      clientName: dashboard?.firstname,
      contactPerson: dashboard?.lastname,
      date: formatDate(date),
      fromCurrency: selectedAsset,
      amount: amount,
      accountNumber: watch("oneTimeAddress") ?? "",
    };

    // const matchingAsset = dashboard.assets.find(
    //   (asset) => asset.assetId === selectedAsset,
    // );

    // if (matchingAsset) {
    //   transactionData.accountNumber = matchingAsset.assetAddress;
    // }

    setOtcConfirmData(transactionData);
  }

  const assetValue = filteredAssets?.find(
    (item) => item.fireblockAssetId === assetId,
  );

  async function SendOTCMail() {
    const date = JSON.parse(JSON.stringify(new Date()));

    const transactionData: TransactionConfirmData = {
      clientName: dashboard?.firstname,
      contactPerson: dashboard?.lastname,
      date: formatDate(date),
      fromCurrency: selectedAsset,
      amount: amount,
      accountNumber:
        watch("addressType") === "WHITELIST"
          ? whitelistOptions.find((item) => item.id === watch("whitelistId"))
            ?.assetAddress
          : watch("addressType") === "ONETIME"
            ? watch("oneTimeAddress")
            : "",
    };

    const [data, error] = await ApiHandler(SendOTCTradeMail, transactionData);
    if (data?.success) {
      toast.success("Mail sent Successfully");
      setOpen("");
    }
  }

  const LabelName = ({ name, label }: any) => {
    return (
      <label htmlFor={name} className="subText my-1 block">
        {label}
      </label>
    );
  };

  async function handleSaveTemplate() {
    const euroTemplate = {
      templateName: watch("customerName"),
      IBAN: watch("IBAN"),
      customerName: watch("customerName"),
      customerAddress: watch("address"),
      customerZipcode: watch("customerZipcode"),
      customerCity: watch("city"),
      customerCountry: watch("countryOfIssue"),
      swift: watch("swift"),
      bankName: watch("bankName"),
      bankAddress: watch("bankAddress"),
      bankLocation: watch("bankLocation"),
      bankCountry: watch("bankCountry"),
      description: watch("description"),
      reference: watch("reference"),
    };

    // const allFieldsFilled = Object.values(euroTemplate).every(
    //   (value) => value !== undefined && value !== "",
    // );

    const existTemplateName = euroTemplates?.filter(
      (item) => item.templateName === watch("customerName"),
    );

    if (existTemplateName && existTemplateName?.length > 0) {
      toast.error("Template already exists");
    } else {
      const [res, error] = await ApiHandler(saveEuroTemplate, euroTemplate);

      if (res?.success) {
        toast.success(
          "Template Saved Successfully, You can start transfer once the template is approved by Admin.",
        );
        fetchTemplates();
        reset();
        setValue("assetId", "EUR");
      }
    }
  }

  return (
    <div className="">
      <Dialog
        open={open === "EURO"}
        onClose={() => {
          setOpen("");
        }}
      >
        <div className="p-5">
          <div className="flex justify-between border-b-2 border-[#DFDDDD] pb-4">
            <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
              Your Euro withdrawal is being processed.
            </p>
            <button
              onClick={() => {
                setOpen("");
              }}
            >
              <div>
                <Image src={Close as StaticImageData} alt="Close" />
              </div>
            </button>
          </div>

          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You withdrawal request has been submitted. The processing time
              varies depending on your registered withdwal bank and local
              network status.
            </DialogContentText>
          </DialogContent>

          <Box className="flex justify-end">
            <MuiButton
              name="Confirm"
              onClick={() => {
                setOpen("");
                reset();
                setValue("assetId", "EUR");
              }}
            ></MuiButton>
          </Box>
        </div>
      </Dialog>

      {/* otc confirm popup  */}
      <Dialog
        open={open === "otcPopupOne"}
        onClose={() => {
          setOpen("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <div className=" rounded p-4">
          <div>
            <div className="flex justify-between">
              <p className="w-full pb-2 text-center text-sm font-bold sm:text-base lg:text-lg">
                OTC Order Form
              </p>
              <button
                onClick={() => {
                  setOpen("");
                }}
              >
                <div>
                  <Image src={Close as StaticImageData} alt="Close" />
                </div>
              </button>
            </div>
            <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
              <p>
                You are now accessing our OTC Trading desk for exclusive and
                personalized services tailored to facilitate large transactions.
              </p>
            </div>
            <div className="">
              <p className=" mt-4 text-xs font-bold text-[#99B2C6]">
                ORDER DETAILS
              </p>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Client Name </p>
                <p>{otcConfirmData?.clientName}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Contact Person</p>
                <p>{otcConfirmData?.contactPerson}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Account Number</p>
                <p>{otcConfirmData?.accountNumber}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Date</p>
                <p>{otcConfirmData?.date}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>From Currency</p>
                <p>{otcConfirmData?.fromCurrency}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Amount</p>
                <p>{otcConfirmData?.amount}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-6 ">
              <button
                className=" cursor-pointer text-sm"
                onClick={() => {
                  setOpen("");
                }}
              >
                Cancel
              </button>
              <MuiButton
                name="Continue"
                className="px-8 py-3"
                onClick={() => {
                  setOpen("otcPopup");
                }}
              ></MuiButton>
            </div>
          </div>
        </div>
      </Dialog>

      {/* otc last popup  */}
      <Dialog
        open={open === "otcPopup"}
        onClose={() => {
          setOpen("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <div className=" rounded p-4">
          <div>
            <div className="flex justify-between pb-4">
              <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                Confirm your Order
              </p>
              <button
                onClick={() => {
                  setOpen("");
                }}
              >
                <div>
                  <Image src={Close as StaticImageData} alt="Close" />
                </div>
              </button>
            </div>
            <div className="">
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p className="">
                  Please note your order will be sent to OTC desk
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-6 ">
              <button
                className=" cursor-pointer text-sm"
                onClick={() => {
                  setOpen("");
                }}
              >
                Cancel
              </button>
              <MuiButton
                name={"Confirm"}
                className="px-8 py-3"
                onClick={() => {
                  SendOTCMail();
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>

      <div className="py-4">
        <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-gray-100 ">
          <h2 className="text-2xl font-bold text-[#1A1C1E] text-center mb-4">Create a new transfer</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-4xl mx-auto">

            <div className="flex items-center lg:flex-row flex-col justify-between gap-3">

              {/* Currency Selector */}
              <div className="space-y-2 w-full">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Currency</label>
                <Controller
                  control={control}
                  name="assetId"
                  rules={{ required: "Please select an asset" }}
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <div className="relative">
                      <Autocomplete
                        size="small"
                        options={filteredAssets}
                        onChange={(_, nextValue) => {
                          onChange(nextValue?.fireblockAssetId ?? "");
                          setValue("whitelistId", "");
                        }}
                        value={assetValue || null}
                        getOptionLabel={(option) => option.name || (typeof value === 'string' ? value : '')}
                        renderOption={(props, option) => (
                          <li {...props} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
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
                              className: "rounded-md bg-white border-gray-200 hover:border-[#4775F2] focus-within:border-[#4775F2] transition-all h-[44px] px-4",
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
                            "&:hover fieldset": { borderColor: "#4775F2" },
                            "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "2px" },
                          },
                        }}
                      />
                      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-2 w-full">
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
                          className={`w-full h-[44px] pl-8 pr-44 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] focus:ring-0 transition-all font-bold text-[#1A1C1E] outline-none`}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#F0F5FF] text-[#4775F2] px-2 py-1 rounded-lg text-xs font-bold hover:bg-[#E2E8FF] transition-colors border border-[#4775F2]/20"
                  >
                    Max ({assetBalance?.balance ? `${Number(assetBalance.balance).toFixed(6)} ${assetBalance.name}` : "0.00"})
                  </button>
                </div>
              </div>

            </div>

            {/* Wallet Address Section */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1A1C1E] ml-1">Wallet Address</label>
              <Controller
                name="addressType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex bg-[#FCFDFF]  rounded-sm">
                    <button
                      type="button"
                      onClick={() => onChange("ONETIME")}
                      className={`flex-1 py-3 text-sm font-bold border border-[#C9C9C9] rounded-sm border-r-0 transition-all ${value === "ONETIME" ? "bg-[#FFF6FC] border-r-[1px] text-[#FF3D71] border-[#DB33A142] shadow-sm" : "text-[#8B8D91] hover:text-[#1A1C1E]"}`}
                    >
                      One time address
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("WHITELIST")}
                      className={`flex-1 py-3 text-sm font-bold border border-[#C9C9C9] rounded-sm border-l-0 transition-all ${value === "WHITELIST" ? "bg-[#FFF6FC] border-l-[1px] text-[#FF3D71] border-[#DB33A142] shadow-sm" : "text-[#8B8D91] hover:text-[#1A1C1E]"}`}
                    >
                      White listed address
                    </button>
                  </div>
                )}
              />

              {currentAddressType === "ONETIME" ? (
                <Controller
                  name="oneTimeAddress"
                  control={control}
                  rules={{ required: "Please enter destination address" }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <div className="flex flex-col">
                      <input
                        placeholder="Enter Wallet Address"
                        className={`w-full h-[44px] px-4 rounded-xl border ${error ? "border-red-500" : "border-gray-200"} hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E]`}
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
                                height: "44px",
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
                    className="w-full min-h-[110px] p-4 rounded-xl border border-gray-200 hover:border-[#4775F2] focus:border-[#4775F2] outline-none transition-all font-medium text-[#1A1C1E] resize-none"
                    value={value || ""}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <div className=" flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-gradient text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 min-w-[200px]"
              >
                {isSubmitting ? "Processing..." : "Create Transfer"}
              </button>
            </div>
          </form>
        </div>
      </div>

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
  );
};

export default CryptoWithdrawal;
