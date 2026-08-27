import {
  Autocomplete,
  Checkbox,
  Dialog,
  Divider,
  FormControlLabel,
  TextField,
} from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MuiButton from "~/components/MuiButton";

import ExchangeInput from "../common/ExchangeInput";
import { ApiHandler } from "~/service/UtilService";
import {
  getAssets,
  getInvoicesById,
  getLegalDocuments,
  pricelistFn,
  updateInvoiceTransactions,
} from "~/service/ApiRequests";
import Link from "next/link";
import CloseBtn from "~/assets/general/close.svg";
import { useRouter } from "next/router";
import { TERMS_AND_CONDITIONS_URL } from "~/common/legal";
import { formatDate } from "~/helpers/helper";
import LoaderIcon from "../LoaderIcon";
import Big from "big.js";

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  onSubmitFee: (value?: any) => void;
};

// interface Asset {
//   krakenAssetId: string;
//   fireblockAssetId: string;
//   icon: string;
//   name: string;
//   address?: string;
// }

// type Fee = {
//   currencyId: string;
//   fixedFee: number;
//   percent: number;
// };

const InvoicePay = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: {},
    watch,
  } = useForm<InvoicePay>();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [getInvoiceData, setgetInvoiceData] = useState<any>("");
  const [getPriceList, setgetPriceList] = useState<any>("");
  const [finalAmount, setFinalAmount] = useState<string>("");
  const [percentage, setpercentage] = useState<string | number>("");
  const [fixedFee, setFixedFee] = useState<string | number>("");
  const [markPercentage, setmarkPercentage] = useState<string | number>("");
  const assetId = watch("currency");
  // console.log("finalAmount", finalAmount);
  // console.log("percentage", percentage);
  // console.log("getInvoiceData", getInvoiceData);

  const formatAmount = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0,00";
    // Format with European style
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  let isInvoiceCalled = false;
  useEffect(() => {
    const fetchInvoiceAndPricelist = async () => {
      if (typeof id === "string") {
        setLoading(true);
        try {
          const [res, error]: APIResult<any> = await ApiHandler(
            getInvoicesById,
            id,
          );
          const invoiceData = res?.body;
          setgetInvoiceData(invoiceData);

          isInvoiceCalled = true;

          if (invoiceData?.projectId) {
            const pricelistResponse = await pricelistFn(invoiceData?.projectId);
            setgetPriceList(pricelistResponse?.data?.body?.findPriceList);
          }
        } catch (error) {
          console.error("Data not found", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInvoiceAndPricelist();
  }, [id]);

  // =======================================================================================

  const pairs = [
    "USDC/USDT",
    "BTC/USDT",
    "ETH/USDT",
    "BTC/USDC",
    "ETH/USDC",
    "ETH/BTC",
  ];

  // console.log("getInvoiceData.currency", getInvoiceData.currency);

  const pairCurrency1 = getInvoiceData?.currency
    ? getInvoiceData?.currency
    : "-";
  let pair1: string;

  if (
    [
      "USDT_ERC20",
      "USDT_TRC20",
      "USDT_BSC",
      "USDT_POLYGON",
      "USDT_TRC20",
    ].includes(pairCurrency1)
  ) {
    pair1 = "USDT";
  } else if (
    ["USDC_ERC20", "USDC_TRC20", "USDC_BSC", "USDC_POLYGON"].includes(
      pairCurrency1,
    )
  ) {
    pair1 = "USDC";
  } else {
    pair1 = pairCurrency1;
  }

  const pairCurrency2 = assetId ?? "";
  let pair2: string;

  if (
    [
      "USDT_ERC20",
      "USDT_TRC20",
      "USDT_TRC20",
      "USDT_BSC",
      "USDT_POLYGON",
    ].includes(pairCurrency2)
  ) {
    pair2 = "USDT";
  } else if (
    [
      "USDC_ERC20",
      "USDC_TRC20",
      "USDC_TRC20",
      "USDC_BSC",
      "USDC_POLYGON",
    ].includes(pairCurrency2)
  ) {
    pair2 = "USDC";
  } else {
    pair2 = pairCurrency2;
  }

  let pair3 = `${pair1}/${pair2}`;

  if (!pairs.includes(pair3)) {
    const tempPair = pair1;
    pair1 = pair2;
    pair2 = tempPair;
    pair3 = `${pair1}/${pair2}`;
  }

  useEffect(() => {
    if (assetId) {
      const fetchLimitsPair = async (value: string) => {
        try {
          const response = await fetch(
            `https://api.kraken.com/0/public/Ticker?pair=${value}`,
          );

          const data = await response.json();

          if (data.result[value]) {
            return data.result[value]?.a[0];
          }
        } catch (error) {
          console.error(error);
        }
      };

      const calculateFinalAmount = async () => {
        try {
          const result = await fetchLimitsPair(pair3);
          // console.log("pair3 inside", pair3);
          const numericAmount = Number(getInvoiceData.amount);
          const aproxValue = numericAmount / result;
          // console.log(" kraken conv aproxValue", aproxValue);
          const finalResult = parseFloat(aproxValue.toFixed(6));
          const FinalAmount = finalResult.toString();
          calculateConversionValue(
            getPriceList,
            assetId,
            FinalAmount,
            setFinalAmount,
          );

          // updateFinalAmountAPI(FinalAmount);
        } catch (error) {
          console.error("Error calculating final amount:", error);
        }
      };
      if (pair1 === pair2) {
        const FinalAmount = getInvoiceData.amount;
        // setFinalAmount(getInvoiceData.amount);
        calculateConversionValue(
          getPriceList,
          assetId,
          FinalAmount,
          setFinalAmount,
        );
      } else {
        calculateFinalAmount();
      }
    }
  }, [getInvoiceData?.amount, pair1, pair2, pair3]);

  // ========================================================================================

  let transactionIdVal: any;
  if (getInvoiceData?.transactionId) {
    transactionIdVal = getInvoiceData.transactionId;
  }

  // console.log(
  //   "orderId: getInvoiceData?.invoiceId,",
  //   getInvoiceData?.transactionDetails?.toAddress,
  // );

  const onSubmit = async (values: InvoicePay) => {
    setLoading(true);
    const { currency, email } = values;
    const assetId = currency;
    const recoveryEmail = email;
    const transactionId = transactionIdVal;
    const orderId = getInvoiceData?.invoiceId;
    const NetworkFee = Number(percentage) + Number(fixedFee);
    const customerId = getInvoiceData?.transactionDetails?.customerId;
    const merchantId = getInvoiceData?.merchantDetails?.publicKey;

    const updatePay = {
      NetworkFee,
      customerId,
      merchantId,
      assetId,
    };

    // console.log("NetworkFee", NetworkFee);

    const requestBody = {
      assetId,
      recoveryEmail,
      transactionId,
      orderId,
      finalAmount,
      networkFee: NetworkFee,
      markPercentage,
    };

    try {
      await updateInvoiceTransactions(requestBody);
      props.onClose("scanner");
      props.onSubmitFee(updatePay);
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionValue = (
    getPriceList: any,
    assetId: string,
    FinalAmount: string,
    setFinalAmount: any,
  ) => {
    // =====================================================================
    const fromCurrencyIds: string[] = [];
    const toCurrencyIds: string[] = [];
    let foundAny = false;
    let MarkupFeePercentage;

    const fromAssetId = getInvoiceData.currency;

    getPriceList?.FxMarkupFees.forEach(
      (index: { fromCurrencyId: string; toCurrencyId: string }) => {
        if (index.fromCurrencyId === "ANY" && index.toCurrencyId === "ANY") {
          foundAny = true;
        } else {
          fromCurrencyIds.push(index.fromCurrencyId);
          toCurrencyIds.push(index.toCurrencyId);
        }
      },
    );

    if (foundAny) {
      // console.log("any any");
      getPriceList?.FxMarkupFees.forEach((index: { percent: any }) => {
        MarkupFeePercentage = index.percent;
        // console.log("any any percentage:", index.percent);
      });
    } else if (fromCurrencyIds.includes("ANY")) {
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; fromCurrencyId: string }) => {
          if (
            index.fromCurrencyId === "ANY" &&
            toCurrencyIds.includes(assetId)
          ) {
            MarkupFeePercentage = index.percent;
            // console.log("fromCurrencyIds any", MarkupFeePercentage);
            // console.log("fromCurrencyId", index.percent);
            // console.log("toCurrencyId", toCurrencyIds);
          }
        },
      );
    } else if (toCurrencyIds.includes("ANY")) {
      // console.log("toCurrencyIds ---------- any");
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; toCurrencyId: string }) => {
          if (
            index.toCurrencyId === "ANY" &&
            fromCurrencyIds.includes(fromAssetId)
          ) {
            MarkupFeePercentage = index.percent;
            // console.log("toCurrencyId any", MarkupFeePercentage);

            // console.log("toCurrencyId", index.percent);
            // console.log("fromCurrencyId", fromCurrencyIds);
          }
        },
      );
    } else {
      // console.log("no any found");

      let matched = false;

      getPriceList?.FxMarkupFees.forEach(
        (index: {
          fromCurrencyId: string;
          toCurrencyId: string;
          percent: any;
        }) => {
          if (
            index.fromCurrencyId === pairCurrency1 &&
            index.toCurrencyId === assetId
          ) {
            matched = true;
            MarkupFeePercentage = index.percent;
            console.log(
              `index.percent of ${
                (index.fromCurrencyId, "and ", index.toCurrencyId, "")
              } =`,
              index.percent,
            );
          }
        },
      );

      if (!matched) {
        console.log(
          "No matching currencies found for pairCurrency1 and assetId.",
        );
        MarkupFeePercentage = "0";
      }
    }

    // console.log("fromCurrencyIds", fromCurrencyIds);
    // console.log("toCurrencyIds", toCurrencyIds);

    // =====================================================================
    if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) => fee.currencyId === "ANY",
      )
    ) {
      // console.log("FinalAmount: ", FinalAmount);
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);
      // console.log("markupFeePercentage: ", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      // console.log("markupCalculation: ", markupCalculation.toString());

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      // console.log("amountAfterFXMarkup: ", amountAfterFXMarkup.toString());
      setmarkPercentage(markupCalculation.toString());

      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);
      // console.log("maxFixedFee: ", maxFixedFee.toString());

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);
      // console.log("maxPercentCalc: ", maxPercentCalc.toString());

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);
      // console.log("calcAmount: ", calcAmount.toString());

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);
      // console.log("afterCalcAmount: ", afterCalcAmount.toString());

      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) => fee.currencyId === assetId,
      )
    ) {
      // console.log("FinalAmount: ", FinalAmount);
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);
      // console.log("markupFeePercentage: ", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      // console.log("markupCalculation: ", markupCalculation.toString());

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      // console.log("amountAfterFXMarkup: ", amountAfterFXMarkup.toString());
      setmarkPercentage(markupCalculation.toString());

      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === assetId,
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);
      // console.log("maxFixedFee: ", maxFixedFee.toString());

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === assetId,
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);
      // console.log("maxPercentCalc: ", maxPercentCalc.toString());

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);
      // console.log("calcAmount: ", calcAmount.toString());

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);
      // console.log("afterCalcAmount: ", afterCalcAmount.toString());

      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else {
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);

      // console.log("markupFeePercentage", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      // console.log("markupCalculation", markupCalculation.toString());

      const afterCalculationmark = Big(FinalAmount).plus(markupCalculation);

      // console.log("afterCalculationmark", afterCalculationmark.toString());

      // console.log(`This ${assetId} doesn't have pricelist`);
      setFinalAmount(afterCalculationmark.toString());
      setmarkPercentage(markupCalculation.toString());
      setpercentage("0");
      setFixedFee("0");
    }
  };

  const [assets, setAssets] = useState<Assets[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);

  useEffect(() => {
    fetchAssets();

    fetchLegal();
  }, []);

  async function fetchAssets() {
    try {
      const [data] = await ApiHandler(getAssets);

      const res: any = data?.body ?? [];
      const filtered = res?.filter(
        (item: Assets) =>
          item?.fireblockAssetId !== "ANY" &&
          item?.fireblockAssetId !== "EUR" &&
          item?.fireblockAssetId !== "USD",
      );
      setAssets(filtered);
    } catch (error) {}
  }

  async function fetchLegal() {
    const [data] = await ApiHandler(getLegalDocuments);

    if (data?.success) {
      const docValue = data.body as LegalDocuments[];
      setLegalDocuments(docValue);
    }
  }

  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);
  const [open, setOpen] = useState<string>("");

  const assetValue = assets?.find((item) => item.fireblockAssetId === assetId);
  const renderSections = (content: string) => {
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      <div key={index}>
        {section.startsWith("<h") ? (
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {!!getInvoiceData && id !== getInvoiceData?.invoiceId && (
        <div className=" w-[400px] rounded-lg border-b-4 border-[#c1922e] bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl text-black">Invoice is invalid </h2>
            <p className="text-gray-800">
              Please contact our team for further assistance.
            </p>
          </div>
        </div>
      )}

      <>
        {getInvoiceData?.transactionDetails?.orderStatus === "COMPLETED" &&
        getInvoiceData?.transactionDetails?.status === "COMPLETED" ? (
          <div className=" w-[400px] rounded-lg border-b-4 border-[#c1922e] bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl text-black">Invoice is invalid </h2>
              <p className="text-gray-800">
                Please contact our team for further assistance.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Dialog
              fullScreen
              open={open === "legalDocPopup"}
              onClose={() => {
                setOpen("");
                setSelectedLegalDocument(null);
              }}
            >
              <div className="">
                <div className=" m-auto w-[90%]">
                  <div className="mt-8 flex justify-between pb-4">
                    <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                      {selectedLegalDocument?.PolicyDocumentType?.displayName}
                    </p>
                    <button
                      onClick={() => {
                        setOpen("");
                      }}
                    >
                      <div>
                        <Image src={CloseBtn as StaticImageData} alt="Close" />
                      </div>
                    </button>
                  </div>
                  <div className="">
                    <div className=" flex flex-col justify-between py-4 text-xs sm:text-sm lg:text-base">
                      {selectedLegalDocument ? (
                        <div>
                          <p className="my-4 text-xl font-semibold">
                            {selectedLegalDocument.title}
                          </p>
                          {renderSections(selectedLegalDocument.documentText)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Dialog>

            {loading ? (
              <div className="flex h-full min-h-[50vh] items-center justify-center">
                <LoaderIcon className=" h-12 w-12" />
              </div>
            ) : (
              <>
                {id && getInvoiceData ? (
                  <div className="bg-white">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex w-[90vw] flex-col items-start gap-1 px-10 py-5 text-sm font-semibold md:w-[60vw] lg:w-[40vw]"
                    >
                      {/* <p className="text-md font-semibold">
                        {getInvoiceData.email}
                      </p> */}
                      <div className="flex w-full items-start justify-between gap-4">
                        <div className="py-2">
                          <p className="text-xl font-medium">
                            {getInvoiceData.name}
                          </p>
                          <p className="text-sm font-normal">
                            {formatDate(getInvoiceData.createdAt)}
                          </p>
                          <div className="py-1">
                            <p>Description</p>
                            {getInvoiceData?.transactionDetails?.billingItems &&
                            getInvoiceData?.transactionDetails?.billingItems
                              .length > 0 ? (
                              <div className="mt-1 space-y-1 text-sm font-normal">
                                {getInvoiceData?.transactionDetails?.billingItems.map(
                                  (item: any, index: number) => (
                                    <p key={index}>
                                      {item.description && (
                                        <>
                                          {item.description} (
                                          <span className="text-[10px] font-bold">
                                            {/* {getInvoiceData.currency === "EUR"
                                              ? "€"
                                              : "$"}{" "} */}
                                            {formatAmount(item.amount)}{" "}
                                            <span className="">
                                              {getInvoiceData.currency}
                                            </span>
                                          </span>
                                          )
                                        </>
                                      )}
                                      {!item.description && (
                                        <>
                                          {formatAmount(item.amount)}{" "}
                                          <span className="text-[10px] font-semibold">
                                            {getInvoiceData.currency}
                                          </span>
                                        </>
                                      )}
                                    </p>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm font-normal">-</p>
                            )}
                          </div>
                        </div>
                        {getInvoiceData?.invoiceImgLink ? (
                          <div className=" h-auto w-28 overflow-hidden ">
                            <Image
                              alt="Invoice"
                              className=" h-full w-full object-contain"
                              src={getInvoiceData?.invoiceImgLink}
                              width={50}
                              height={50}
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="py-2">
                        <p>Amount</p>
                        <p className="text-xl font-bold text-[#C2912E]">
                          {formatAmount(getInvoiceData.amount)}
                          {"  "}
                          {getInvoiceData.currency}
                        </p>
                      </div>

                      <Divider className="w-full" />

                      <p className="py-1">
                        Select a currency that you will use for payment
                      </p>

                      <div className="w-full py-2">
                        <label htmlFor="firstName" className="mb-1 block">
                          Currency <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="currency"
                          rules={{
                            required: "Please select a currency",
                          }}
                          render={({
                            field: { value, onChange },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <Autocomplete
                                size="small"
                                options={assets}
                                getOptionLabel={(option) => {
                                  return option.name ? option.name : value;
                                }}
                                onChange={(_, nextValue) => {
                                  onChange(nextValue?.fireblockAssetId ?? "");
                                }}
                                value={assetValue ? assetValue : null}
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
                                    className="flex items-center gap-2 bg-[#ffffff]"
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
                                          </Fragment>
                                        );
                                      })(),
                                    }}
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
                      </div>
                      <p className="font-normal">
                        Make sure the network/standard corresponds to the one in
                        your crypto wallet
                      </p>

                      <Divider className="w-full py-3" />

                      <div className="w-full">
                        <ExchangeInput
                          control={control}
                          placeholder="Enter Email"
                          label="Email"
                          name="email"
                          rules={{ required: "Email is required" }}
                          type="text"
                        />
                      </div>

                      <p>
                        If the payment amount doesn’t match the amount stated
                        above, we’ll send an email on how to recover the funds.
                      </p>
                      <Controller
                        name="termsAccepted"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "You must accept the terms and conditions",
                        }}
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <Fragment>
                            <FormControlLabel
                              control={
                                <Checkbox checked={value} onChange={onChange} />
                              }
                              label={
                                <div className="flex flex-wrap items-center justify-center whitespace-nowrap">
                                  I agree to the{" "}
                                  <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={TERMS_AND_CONDITIONS_URL}
                                    className="mx-1 text-sm font-semibold text-[#C1922E]"
                                  >
                                    Terms Of Use
                                  </Link>{" "}
                                  {legalDocuments
                                    .filter(
                                      (item) =>
                                        item?.PolicyDocumentType?.id === 2,
                                    )
                                    .map((item, i) => (
                                      <div key={i}>
                                        {item?.documentText !== "" ? (
                                          <p
                                            onClick={() => {
                                              setSelectedLegalDocument(item);
                                              setOpen("legalDocPopup");
                                            }}
                                            className=" cursor-pointer text-sm font-semibold text-[#C1922E]"
                                          >
                                            <span className="mx-1 text-black">
                                              {" "}
                                              and{" "}
                                            </span>{" "}
                                            Privacy policy
                                          </p>
                                        ) : (
                                          <Link
                                            target="_blank"
                                            href={item.documentLink}
                                            className="text-sm font-semibold text-[#C1922E]"
                                          >
                                            <span className="mx-1 text-black">
                                              {" "}
                                              and
                                            </span>{" "}
                                            Privacy policy
                                          </Link>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              }
                            />
                            {error && (
                              <p className="text-sm text-red-500">
                                {error.message}
                              </p>
                            )}
                          </Fragment>
                        )}
                      />

                      <div className="m-auto flex justify-center">
                        <MuiButton
                          name="Pay"
                          width="10rem"
                          type="submit"
                          loading={loading}
                        ></MuiButton>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    {isInvoiceCalled ? (
                      <div className=" w-[400px] rounded-lg border-b-4 border-[#c1922e] bg-white p-8 shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                          <h2 className="text-2xl text-black">
                            Invoice not found{" "}
                          </h2>
                          <p className="text-gray-800">
                            Please contact our team for further assistance.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </>
    </div>
  );
};

export default InvoicePay;
