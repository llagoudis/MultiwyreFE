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
    } catch (error) {}
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
    <div>
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
          {/* <p className=" border-b-2 pb-2">Enter the basic details</p> */}
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <div
              className={`${
                selectedAsset === "EUR" ? ` w-full md:w-[34%]` : ` w-full`
              } max-w-xl `}
            >
              <div className="flex flex-col gap-2 rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)] ">
                <div>
                  {/* <LabelName name={assetId} label={"From"} /> */}
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
                          options={filteredAssets}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.fireblockAssetId ?? ""),
                              setValue("whitelistId", "");
                          }}
                          value={assetValue ? assetValue : null}
                          getOptionLabel={(option) => {
                            return option.name ? option.name : value;
                          }}
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

                                      {/* {params.InputProps.startAdornment} */}
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

                {(selectedAsset !== "EUR" ||
                  (isTemplateSelected && isTemplateApproved)) && (
                  <div>
                    <div className=" mt-2">
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
                              onWheel={() =>
                                (
                                  document?.activeElement as HTMLInputElement
                                )?.blur()
                              }
                              size="small"
                              fullWidth
                              onChange={onChange}
                              value={value ? value : ""}
                              placeholder="Amount"
                              variant="outlined"
                              disabled={isMax}
                            />
                            <p className="text-sm text-red-500">
                              {error?.message}
                            </p>
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
                        Max (
                        {assetBalance?.balance
                          ? `${Number(assetBalance?.balance).toFixed(6) ?? 0} ${
                              assetBalance?.name ?? ""
                            }`
                          : 0}
                        )
                      </label>
                    </div>
                  </div>
                )}

                {selectedAsset !== "EUR" && (
                  <div className="">
                    <div className="flex justify-between">
                      <LabelName name="addressType" label={"Wallet Address"} />

                      <Controller
                        name="addressType"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex flex-col md:flex-row">
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
                            <p className="text-sm text-red-500">
                              {error?.message}
                            </p>
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
                )}

                <div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Fragment>
                        <textarea
                          className="mt-2 w-full resize-none rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4]  placeholder:font-normal"
                          placeholder={"Description"}
                          rows={1}
                          value={value ?? ""}
                          onChange={onChange}
                        />
                      </Fragment>
                    )}
                  />
                </div>

                {selectedAsset === "EUR" &&
                  isTemplateSelected &&
                  isTemplateApproved && (
                    <SelectComponent
                      control={control}
                      options={paymentSystemList}
                      valueKey="value"
                      labelKey="label"
                      label="Payment system type"
                      name="paymentSystemType"
                      rules={{ required: "Payment system type is required" }}
                    />
                  )}

                {selectedAsset === "EUR" && (
                  <>
                    <SelectComponent
                      control={control}
                      options={euroTemplates ?? []}
                      rules={{
                        validate: () =>
                          !isTemplateApproved && !!isTemplateSelected
                            ? `Template is not approved. Please contact at ${
                                adminEmail ?? ""
                              }`
                            : undefined,
                      }}
                      valueKey="templateName"
                      labelKey="templateName"
                      label="Euro Templates"
                      name="euroTemplate"
                      // rules={{ required: "Select country" }}
                    />
                  </>
                )}

                <div
                  className={`${
                    selectedAsset === "EUR" ? `hidden` : ` ml-auto block w-fit`
                  } `}
                >
                  <MuiButton
                    name={"Create transfer"}
                    type="submit"
                    loading={isSubmitting}
                  />
                </div>
              </div>
              {selectedAsset === "EUR" &&
                isTemplateSelected &&
                isTemplateApproved && (
                  <>
                    <div className=" mt-4 rounded-md bg-[#e9e9e9] px-8 py-4 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.40)]">
                      <div className="flex justify-between">
                        <p className="pb-3 font-medium">Transfer</p>{" "}
                        <p>
                          {Number(amount) > 0 ? amount : 0} {selectedAsset}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="pb-3 font-medium">Fees</p>
                        <p>
                          {transferFee} {selectedAsset}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium">Amount</p>
                        <p>
                          {Number(amount) - Number(transferFee)} {selectedAsset}
                        </p>
                      </div>
                    </div>
                  </>
                )}
            </div>
            {selectedAsset === "EUR" && (
              <div className=" w-full rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)] md:w-[64%]">
                <div className="w-full">
                  <p className=" mb-4 font-bold">BENEFICIARY DETAILS</p>

                  <div className="w-full">
                    <div className="grid w-full grid-cols-1 items-baseline gap-4 md:grid-cols-3">
                      <div className=" text-base font-medium md:col-span-3">
                        <LabelName
                          name="customer_info"
                          label="CUSTOMER INFO"
                        ></LabelName>
                      </div>

                      {/* IBAN  */}
                      <div className="">
                        {/* <LabelName name="IBAN" label="IBAN"></LabelName> */}
                        <div className="flex flex-col">
                          <Controller
                            name="IBAN"
                            control={control}
                            rules={{
                              required: "Please enter company name",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  placeholder="IBAN*"
                                  variant="outlined"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* CUSTOMER NAME  */}
                      <div className="">
                        <div className="flex flex-col ">
                          {/* <LabelName
                            name="customerName"
                            label="Customer name*"
                          ></LabelName> */}

                          <Controller
                            name="customerName"
                            control={control}
                            rules={{
                              required: "Please enter customer name",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  placeholder="Customer name"
                                  variant="outlined"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* CUSTOMER ADDRESS  */}
                      <div className="">
                        <div className="flex flex-col">
                          {/* <LabelName
                            name="address"
                            label="Customer address*"
                          ></LabelName> */}

                          <Controller
                            name="address"
                            control={control}
                            rules={{
                              required: "Please enter customer address",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  variant="outlined"
                                  placeholder="Customer address"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* CUSTOMER ZIP CODE  */}
                      <div className="">
                        <div className="flex flex-col gap-2">
                          {/* <LabelName
                            name="customerZipcode"
                            label="Customer zip code*"
                          ></LabelName> */}

                          <Controller
                            name="customerZipcode"
                            control={control}
                            rules={{
                              required: "Please enter customer zip code",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  variant="outlined"
                                  placeholder="Customer zip code"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* CUSTOMER CITY  */}
                      <div className="">
                        <div className="flex flex-col gap-2">
                          {/* <LabelName
                            name="city"
                            label="Customer city*"
                          ></LabelName> */}

                          <Controller
                            name="city"
                            control={control}
                            rules={{
                              required: "Please enter customer name",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  variant="outlined"
                                  placeholder="Customer city*"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* COUNTRY  */}
                      <SelectComponent
                        control={control}
                        options={countryList}
                        required={true}
                        valueKey="name"
                        labelKey="name"
                        label="Country*"
                        name="countryOfIssue"
                        rules={{ required: "Select country" }}
                      />
                    </div>
                    <div className="w-full ">
                      <div className="grid w-full grid-cols-1 items-baseline gap-4 md:grid-cols-3">
                        <div className="mt-2 text-base font-medium md:col-span-3">
                          <LabelName
                            name="bank_info"
                            label="BANK INFO"
                          ></LabelName>
                        </div>

                        {/* Swift  */}
                        <div className="">
                          {/* <LabelName
                            name="Swift/Bic"
                            label="Swift/Bic*"
                          ></LabelName> */}
                          <div className="flex flex-col">
                            <Controller
                              name="swift"
                              control={control}
                              rules={{
                                required: "Please enter company name",
                              }}
                              render={({
                                field: { onChange, value },
                                fieldState: { error },
                              }) => (
                                <Fragment>
                                  <TextField
                                    type="text"
                                    size="small"
                                    fullWidth
                                    onChange={onChange}
                                    value={value ? value : ""}
                                    placeholder="Swift/Bic*"
                                    variant="outlined"
                                  />
                                  <p className="text-sm text-red-500">
                                    {error?.message}
                                  </p>
                                </Fragment>
                              )}
                            />
                          </div>
                        </div>

                        {/* BANK NAME  */}
                        <div className="">
                          <div className="flex flex-col">
                            {/* <LabelName
                              name="bankName"
                              label="Bank name*"
                            ></LabelName> */}

                            <Controller
                              name="bankName"
                              control={control}
                              rules={{
                                required: "Please enter bank name",
                              }}
                              render={({
                                field: { onChange, value },
                                fieldState: { error },
                              }) => (
                                <Fragment>
                                  <TextField
                                    type="text"
                                    size="small"
                                    fullWidth
                                    onChange={onChange}
                                    value={value ? value : ""}
                                    placeholder="Bank name*"
                                    variant="outlined"
                                  />
                                  <p className="text-sm text-red-500">
                                    {error?.message}
                                  </p>
                                </Fragment>
                              )}
                            />
                          </div>
                        </div>

                        {/* BANK ADDRESS  */}
                        <div className="">
                          <div className="flex flex-col">
                            {/* <LabelName
                              name="bankAddress"
                              label="Bank address"
                            ></LabelName> */}

                            <Controller
                              name="bankAddress"
                              control={control}
                              // rules={{
                              //   required: "Please enter bank address",
                              // }}
                              render={({
                                field: { onChange, value },
                                fieldState: { error },
                              }) => (
                                <Fragment>
                                  <TextField
                                    type="text"
                                    size="small"
                                    fullWidth
                                    onChange={onChange}
                                    value={value ? value : ""}
                                    variant="outlined"
                                    placeholder="Bank address"
                                  />
                                  <p className="text-sm text-red-500">
                                    {error?.message}
                                  </p>
                                </Fragment>
                              )}
                            />
                          </div>
                        </div>

                        {/* BANK LOCATION  */}
                        <div className="">
                          <div className="flex flex-col">
                            {/* <LabelName
                              name="bankLocation"
                              label="Bank Location"
                            ></LabelName> */}

                            <Controller
                              name="bankLocation"
                              control={control}
                              // rules={{
                              //   required: "Please enter bank location",
                              // }}
                              render={({
                                field: { onChange, value },
                                fieldState: { error },
                              }) => (
                                <Fragment>
                                  <TextField
                                    type="text"
                                    size="small"
                                    fullWidth
                                    onChange={onChange}
                                    value={value ? value : ""}
                                    variant="outlined"
                                    placeholder="Bank Location"
                                  />
                                  <p className="text-sm text-red-500">
                                    {error?.message}
                                  </p>
                                </Fragment>
                              )}
                            />
                          </div>
                        </div>

                        {/* COUNTRY  */}
                        <SelectComponent
                          control={control}
                          options={countryList}
                          required={true}
                          valueKey="name"
                          labelKey="name"
                          label="Country*"
                          name="bankCountry"
                          rules={{ required: "Select country" }}
                        />
                        <div className="">
                          {/* <LabelName
                            name="reference"
                            label="Reference"
                          ></LabelName> */}
                          <div className="flex flex-col">
                            <Controller
                              name="reference"
                              control={control}
                              rules={{
                                required: "Please enter reference name",
                              }}
                              render={({
                                field: { onChange, value },
                                fieldState: { error },
                              }) => (
                                <Fragment>
                                  <TextField
                                    type="text"
                                    size="small"
                                    fullWidth
                                    onChange={onChange}
                                    value={value ? value : ""}
                                    placeholder="Reference"
                                    variant="outlined"
                                  />
                                  <p className="text-sm text-red-500">
                                    {error?.message}
                                  </p>
                                </Fragment>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  {/* <div className="my-4 flex w-fit items-center gap-2">
                    <input
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSaveTemplate();
                        }
                        // e.target.checked
                        //   ? void setVolume(assetBalance?.balance)
                        //   : void setVolume("");
                      }}
                      className="ml-1 mt-1 scale-150"
                      type="checkbox"
                      id="max1"
                    />
                    <label
                      className="text-md font-bold text-[#C1922E]"
                      htmlFor="max1"
                    >
                      Save Template
                    </label>
                  </div> */}
                  <div className="">
                    <MuiButton
                      name={`${
                        !isTemplateApproved && !!isTemplateSelected
                          ? "Template not Approved"
                          : isTemplateApproved && !!isTemplateSelected
                          ? "Create Transfer"
                          : "Create Template"
                      }`}
                      type="submit"
                      loading={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
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
