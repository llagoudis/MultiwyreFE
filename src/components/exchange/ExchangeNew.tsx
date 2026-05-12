import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Autocomplete, Dialog, TextField } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import { Controller, set, useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import MuiButton from "../MuiButton";
import SelectComponent from "../common/SelectComponent";
import useGlobalStore from "~/store/useGlobalStore";
import {
  changeName,
  coinForKrakenName,
  coinName,
  dateValidation,
  formatDate,
} from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import {
  createExchangeTransaction,
  fetchTransaferFeesApi,
  getFxMarkup,
  SendOTCTradeMail,
} from "~/service/ApiRequests";
import { getLimits } from "~/service/api/transaction";
import toast from "react-hot-toast";
import Close from "~/assets/general/close.svg";
import useDashboard from "~/hooks/useDashboard";

const pairs = [
  "BTC/USDC",
  "BTC/EUR",
  "USDC/EUR",
  "ETH/EUR",
  "ETH/USDC",
  "ETH/BTC",
  "USDC/USDT",
  "USDT/EUR",
  "USDC/USDT.t",
  "USDT.t/EUR",
  "BTC/USDT.t",
];

const availableCurrencies = ["BTC", "USDC", "EUR", "USDT", "ETH"];

const ExchangeNew = () => {
  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ExchangeForm>({
    mode: "onChange", //  validate as user types
    reValidateMode: "onChange", // optional: revalidate on change
    defaultValues: {
      from: coinName("BTC"),
      to: coinName("USDC"),
      orderType: "market",
      volume: 0,
      fxMarkUp: 0,
      exchangePercent: 0,
      exchangeFixedFee: 0,
      transactionPercent: 0,
      transactionFixedFee: 0,
      euroMarket: 0,
      totalFees: 0,
      transactionFee: 0,
      exchangeFee: 0,
      reversed: false,
    },
  });

  const {
    from,
    totalFees,
    to,
    receive,
    fxMarkUp,
    volume,
    market,
    orderType,
    exchangeFixedFee,
    exchangePercent,
    transactionFixedFee,
    transactionPercent,
    pair,
    baseVolume,
    reversed,
    type,
    exchangeFee,
    transactionFee,
  } = watch();

  const admin = useGlobalStore((state) => state.admin);

  const dashboard = useGlobalStore((state) => state.dashboard);
  const [otcConfirmData, setOtcConfirmData] = useState<any>();
  const [isLoading, setLoading] = useState(false);
  const [open, setOpen] = useState<string>("");
  const assets =
    dashboard?.assets?.filter((item) =>
      availableCurrencies.includes(coinForKrakenName(item.assetId)),
    ) ?? [];

  const fromAssetValue = assets.find((item) => item.assetId === from);
  const toAssetValue = assets.find((item) => item.assetId === to);
  const dashboardAssets = useDashboard()?.assets;

  const assetBalance = useMemo(
    () => dashboardAssets.find((item) => item.assetId === from),
    [dashboardAssets, from],
  );

  const calculateReceivedAmount = (volume: number) => {
    const {
      market,
      exchangeFixedFee,
      exchangePercent,
      transactionFixedFee,
      transactionPercent,
      orderType,
      limit,
    } = getValues();

    const isMarketOrder = orderType === "market";
    const price = isMarketOrder
      ? parseFloat(market ?? "0")
      : parseFloat(limit ?? "0");

    const amount = volume * (price ? price : 0);

    const exchangeFee = amount * (exchangePercent / 100) + exchangeFixedFee;

    const transactionFee =
      amount * (transactionPercent / 100) + transactionFixedFee;

    const fee = Math.max(exchangeFee, 0) + Math.max(transactionFee, 0);

    setValue("totalFees", fee);
    setValue("transactionFee", transactionFee);
    setValue("exchangeFee", exchangeFee);

    let baseVolume = volume;
    if (reversed) {
      baseVolume = parseFloat((Number(volume) * Number(price)).toFixed(8));
    }

    setValue("baseVolume", baseVolume);

    return (amount - fee).toFixed(8);
  };

  const fetchMarketData = async (pair: string, reversed: boolean) => {
    try {
      // kraken
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );

      const data = await response.json();
      const priceStr = data.result[changeName(pair)]?.a[0];

      if (priceStr) {
        const price = parseFloat(priceStr);
        const finalPrice = reversed ? (1 / price).toFixed(8) : priceStr;

        const markupMultiplier = 1 + (fxMarkUp ?? 0) / 100;

        const markedUpPrice = finalPrice * markupMultiplier;

        setValue("market", markedUpPrice.toFixed(8));

        // Calculate 'receive' based on volume and market
        const amount = getValues("volume");
        if (!isNaN(amount) && amount > 0) {
          const received = calculateReceivedAmount(amount);
          setValue("receive", received);
        }
      }
    } catch (error) {}
  };

  const fetchFxMarkup = async (value: any) => {
    const [res] = await getFxMarkup(dashboard.priceList);
    console.log("res: ", res);

    const array: FXMarkup[] =
      res?.body?.filter(
        (item: any) => item?.priceListId === dashboard?.priceList,
      ) ?? [];

    const filterPriceList: FXMarkup[] = array?.filter((item: any) => {
      return (
        (item?.fromCurrencyId === "ANY" ||
          item?.fromCurrencyId === coinName(value?.coin1)) &&
        (item?.toCurrencyId === "ANY" ||
          item?.toCurrencyId === coinName(value?.coin2)) &&
        dateValidation(item) &&
        item.status
      );
    });

    const fee = filterPriceList[0]?.percent ?? 0;
    setValue("fxMarkUp", Number(fee));
  };

  const fetchTransaferFees = async (value: any) => {
    const [res, error]: APIResult<TransferFees[]> = await ApiHandler(
      fetchTransaferFeesApi,
    );

    const exchangeFees = res?.body?.find((item: any) => {
      return (
        item?.priceListId === dashboard?.priceList &&
        item?.operationType === 5 &&
        (item?.currencyId === "ANY" || item?.currencyId === value) &&
        dateValidation(item) &&
        item.status
      );
    });

    const Transactionfees = res?.body?.find((item: any) => {
      return (
        item?.priceListId === dashboard?.priceList &&
        item?.operationType === 7 &&
        (item?.currencyId === "ANY" || item?.currencyId === value) &&
        dateValidation(item) &&
        item.status
      );
    });

    const response = {
      exchangePercent: exchangeFees?.percent ?? 0,
      exchangeFixedFee: exchangeFees?.fixedFee ?? 0,
      transactionPercent: Transactionfees?.percent ?? 0,
      transactionFixedFee: Transactionfees?.fixedFee ?? 0,
    };

    setValue("exchangePercent", response.exchangePercent);
    setValue("exchangeFixedFee", response.exchangeFixedFee);
    setValue("transactionPercent", response.transactionPercent);
    setValue("transactionFixedFee", response.transactionFixedFee);
  };

  const fetchEuroMarketData = async (value: string) => {
    const euroPair = value + "/EUR";

    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${changeName(euroPair)}`,
      );

      const data = await response.json();

      if (data.result[changeName(euroPair)]) {
        setValue("euroMarket", data.result[changeName(euroPair)]?.a[0]);
      }
    } catch (error) {
      // setPrizeFromKraken(0);
      clearInterval(0);
    }
  };

  useEffect(() => {
    const from_ = coinForKrakenName(from);
    const to_ = coinForKrakenName(to);
    let matchingPair = pairs.find((p) => p === `${from_}/${to_}`);
    let reversed = false;

    if (!matchingPair) {
      matchingPair = pairs.find((p) => p === `${to_}/${from_}`);
      reversed = true;
    }

    if (reversed) {
      setValue("reversed", true);
    }

    if (!matchingPair) return;
    else setValue("pair", matchingPair);

    const krakenType = reversed ? "buy" : "sell";
    setValue("type", krakenType);

    const base = reversed ? to : from;
    const quote = reversed ? from : to;

    //  fetchFxMarkup only with base and quote currency
    void fetchFxMarkup({ coin1: base, coin2: quote });
    //  fetchTransaferFees only with receiving currency
    void fetchTransaferFees(to);

    const safePair = matchingPair;

    const interval_1 = setInterval(() => {
      fetchMarketData(safePair, reversed);
    }, 4000);

    const interval_2 = setInterval(() => {
      fetchEuroMarketData(to === "EUR" ? from_ : to_);
    }, 4000);

    return () => {
      clearInterval(interval_1);
      clearInterval(interval_2);
    };
  }, [from, to]);

  // Recalculate receive when volume changes
  useEffect(() => {
    if (!market || isNaN(volume) || volume <= 0) {
      setValue("receive", "0.0");
      return;
    }

    const received = calculateReceivedAmount(volume);

    setValue("receive", received);
  }, [volume, market]);

  const [limits, setLimits] = useState<Limits[]>();

  useEffect(() => {
    if (dashboard.limitList) {
      getLimits(dashboard.limitList).then(([res]) => {
        if (res?.success && res?.body) {
          setLimits(res?.body);
        }
      });
    }
  }, []);

  const onSubmit = (data: ExchangeForm) => {
    handleOTCConfirm();
  };

  const handleOTCConfirm = () => {
    const { receive, to, euroMarket } = getValues();
    const limitValue =
      to === "EUR"
        ? Number(receive ?? 0)
        : Number(receive ?? 0) * Number(euroMarket ?? 0);

    const errorConditionBuy = limits?.some((item) => {
      if (
        (item.currencyId === coinName(to) || item.currencyId === "ANY") &&
        item.exchangeType === "TRADE" &&
        item.exchangeLimit === "MIN"
      ) {
        return limitValue <= Number(item.amount);
      } else if (
        (item.currencyId === coinName(to) || item.currencyId === "ANY") &&
        item.exchangeType === "TRADE" &&
        item.exchangeLimit === "MAX"
      ) {
        return limitValue >= Number(item.amount);
      } else {
        return false;
      }
    });

    if (errorConditionBuy) {
      SendOTCPopup();
      setOpen("otcPopupOne");
    } else {
      setOpen("confirmPopup");
    }
  };

  function SendOTCPopup() {
    const date = JSON.stringify(new Date());

    let transactionData: TransactionConfirmData = {
      clientName: dashboard?.firstname,
      contactPerson: dashboard?.lastname,
      ordertype: orderType,
      walletAddress: "",
      date: formatDate(JSON.parse(date)),
      fromCurrency: "",
      toCurrency: "",
      amount: 0,
    };

    transactionData.fromCurrency = from;
    transactionData.toCurrency = to;
    transactionData.amount = volume;

    const matchingAsset = dashboard.assets.find(
      (asset) => asset.assetId === transactionData.fromCurrency,
    );

    if (matchingAsset) {
      transactionData.walletAddress = matchingAsset.assetAddress;
    }

    transactionData = {
      accountNumber: matchingAsset?.assetAddress,
      ...transactionData,
    };

    setOtcConfirmData(transactionData);
  }

  async function SendOTCMail() {
    setLoading(true);
    const date = JSON.stringify(new Date());

    let transactionData: TransactionConfirmData = {
      clientName: dashboard?.firstname,
      contactPerson: dashboard?.lastname,
      ordertype: orderType,
      walletAddress: "",
      date: formatDate(JSON.parse(date)),
      fromCurrency: "",
      toCurrency: "",
      amount: 0,
    };

    transactionData.fromCurrency = from;
    transactionData.toCurrency = to;
    transactionData.amount = volume;

    const matchingAsset = dashboard.assets.find(
      (asset) => asset.assetId === transactionData.fromCurrency,
    );
    if (matchingAsset) {
      transactionData.walletAddress = matchingAsset.assetAddress;
    }

    transactionData = {
      accountNumber: matchingAsset?.assetAddress,
      ...transactionData,
    };

    const [data, error] = await ApiHandler(SendOTCTradeMail, transactionData);

    setLoading(false);
    if (data?.success) {
      toast.success("Mail sent Successfully");
      setOpen("");
    }
  }

  function OTC_Dialog() {
    return (
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
              <p className=" text-sm font-bold sm:text-base lg:text-lg">
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
                <p>Please note your order will be sent to OTC desk</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-6 ">
              <MuiButton
                name={"Ok"}
                loading={isLoading}
                className="px-8 py-3"
                onClick={() => {
                  SendOTCMail();
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  function OTC_Confirm_Dialog() {
    return (
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
                <p>Account Number </p>
                <p>{otcConfirmData?.walletAddress}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Order Type</p>
                <p>{otcConfirmData?.ordertype}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Date</p>
                <p>{otcConfirmData?.date}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>From Currency</p>
                <p>{coinForKrakenName(from)}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>To Currency</p>
                <p>{coinForKrakenName(to)}</p>
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
                name={"Continue"}
                disabled={isLoading}
                className="px-8 py-3"
                onClick={() => {
                  setOpen("otcPopup");
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  function confirmTradeDialog() {
    return (
      <Dialog
        open={open === "confirmPopup"}
        onClose={() => {
          setOpen("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <div className=" rounded p-4">
          <div>
            <div className="flex justify-between pb-4">
              <p className=" text-sm font-bold sm:text-base lg:text-lg">
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
              <p className=" mt-4 text-xs font-bold text-[#99B2C6]">
                ORDER DETAILS
              </p>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Order Type </p>
                <p>{orderType === "market" ? "Market" : "Limit"}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Currency</p>
                <p>{coinForKrakenName(to)}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <>
                  <p>Estimated amount to spend </p>
                  {volume}&nbsp;{coinForKrakenName(from)}
                </>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>Fees</p>
                <span>
                  {totalFees} &nbsp;
                  {coinForKrakenName(to)}
                </span>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <>
                  <p>Estimated amount to receive </p>
                  {receive}&nbsp;{coinForKrakenName(to)}
                </>
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
                name={"Continue"}
                disabled={isLoading}
                loading={isLoading}
                className="px-8 py-3"
                onClick={() => {
                  handleAddOrder();
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  const handleAddOrder = async () => {
    const formData = {
      spendingCurrency: from,
      receivingCurrency: to,
      pair: pair,
      ordertype: orderType,
      price: market,
      spendingAmount: volume ?? 0,
      receivingAmount: receive ?? 0,
      volume: type === "sell" ? volume ?? 0 : receive ?? 0,
      type: type,
      fxMarkUp,
      exchangeFixedFee,
      exchangePercent,
      transactionFixedFee,
      transactionPercent,
      exchangeFee,
      transactionFee,
    };

    setLoading(true);

    const [data, error]: APIResult<{ txid: string }> = await ApiHandler(
      createExchangeTransaction,
      formData,
    );
    setLoading(false);

    if (data?.success == true) {
      reset();
      if (data?.message) {
        toast.success(data?.message);
      } else {
        toast.success("Order added successfully");
      }
      setOpen("");
    }

    if (error) {
      setOpen("");
    }
  };

  return (
    <div className="mt-8">
      {OTC_Dialog()}

      {OTC_Confirm_Dialog()}

      {confirmTradeDialog()}
     <form onSubmit={handleSubmit(onSubmit)}>
  <div className="mx-auto my-2 max-w-lg">
    {/* Title and subtitle moved to left */}
    <div className="text-left">
      <p className="pb-[5px] text-xl font-semibold">Exchange</p>
      <p className="pb-[15px]">Exchange at best market price</p>
    </div>
  </div>
  <div className="mx-auto max-w-lg">
    <div className="rounded-md bg-white p-6 shadow-md">
      {/* From/To Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {["from", "to"].map((type) => {
          const value = type === "from" ? from : to;
          const setValueKey = type === "from" ? to : from;
          const assetValue =
            type === "from" ? fromAssetValue : toAssetValue;

          return (
            <div key={type} className={`${type} space-y-1`}>
              <p>{type === "from" ? "From :" : "To :"}</p>
              <Controller
                control={control}
                name={type as "from" | "to"}
                rules={{ required: `Please select ${type} asset` }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <>
                    <Autocomplete
                      size="small"
                      options={assets.filter((item) => {
                        const isSame = item.assetId !== setValueKey;
                        return isSame;
                      })}
                      onChange={(_, nextValue) => {
                        onChange(nextValue?.assetId ?? "");
                      }}
                      value={assetValue ?? null}
                      getOptionLabel={(option) => option.name ?? value}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          className="flex items-center gap-2 p-2"
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
                          {...params}
                          placeholder="Select currency"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: assetValue && (
                              <Image
                                className="ml-2 h-5 w-4"
                                src={assetValue.icon ?? ""}
                                alt={assetValue.name}
                                width={80}
                                height={80}
                              />
                            ),
                          }}
                        />
                      )}
                    />
                    <p className="text-sm text-red-500">
                      {error?.message}
                    </p>
                  </>
                )}
              />
            </div>
          );
        })}
      </div>

      <ExchangeInput
        control={control}
        label="Amount"
        placeholder="Enter amount"
        name="volume"
        type="number"
        rules={{
          required: "Amount is required",
          min: {
            value: 0.00000001,
            message: `Amount should be greater than 0.00000001`,
          },
          max: {
            value: Number(assetBalance?.balance) ?? 0.00000001,
            message: `Amount should be lower than or equal to ${assetBalance?.balance}`,
          },
        }}
      />

      <div className="mb-2 flex w-fit items-center gap-2">
        <input
          onChange={(e) => {
            e.target.checked
              ? void setValue(
                  "volume",
                  parseFloat(assetBalance?.balance ?? "0"),
                )
              : void setValue("volume", 0);
          }}
          className=" mt-1 scale-150"
          type="checkbox"
          id="max"
        />
        <label
          className="text-md mt-1 font-bold text-[#C1922E]"
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

      <div className="as">
        <label htmlFor="orderType" className="subText mb-1 block">
          Order type
        </label>
        <SelectComponent
          control={control}
          name="orderType"
          label="Order type"
          rules={{ required: "Order type is required" }}
          options={[
            { value: "market", label: "Market" },
            { value: "limit", label: "Limit" },
          ]}
        />
      </div>

      {/* Market Price and You Will Receive - Side by side with border-radius 5 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Market Price Card */}
        {orderType === "market" && (
          <div className="rounded-[5px] border border-gray-200 bg-gray-50 p-3">
            <ExchangeInput
              control={control}
              disabled
              label="Market price"
              placeholder="0.0"
              name="market"
              type="text"
            />
          </div>
        )}

        {orderType === "limit" && (
          <div className="rounded-[5px] border border-gray-200 bg-gray-50 p-3">
            <ExchangeInput
              control={control}
              label="Enter limit price"
              placeholder="0.0"
              name="limit"
              type="text"
            />
          </div>
        )}

        {/* You Will Receive Card */}
        <div className="rounded-[5px] border border-gray-200 bg-gray-50 p-3">
          <ExchangeInput
            control={control}
            disabled
            label="You will receive"
            placeholder="0.0"
            name="receive"
            type="text"
          />
        </div>
      </div>

      <div className="ml-auto mt-4 w-fit md:block">
        <MuiButton
          disabled={isLoading}
          type="submit"
          name="Execute Trade"
        />
      </div>
    </div>
  </div>
</form>
    </div>
  );
};

export default ExchangeNew;
