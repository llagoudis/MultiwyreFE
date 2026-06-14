import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Autocomplete, Dialog, TextField, InputAdornment } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import { Controller, useForm } from "react-hook-form";
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
import { ExchangeIcon } from "~/assets/svgs";
import ArrowDown from "~/assets/general/arrow_down.svg";

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
    mode: "onChange",
    reValidateMode: "onChange",
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
    const transactionFee = amount * (transactionPercent / 100) + transactionFixedFee;
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
      const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
      const data = await response.json();
      const priceStr = data.result[changeName(pair)]?.a[0];

      if (priceStr) {
        const price = parseFloat(priceStr);
        const finalPrice = reversed ? (1 / price).toFixed(8) : priceStr;
        const markupMultiplier = 1 + (fxMarkUp ?? 0) / 100;
        const markedUpPrice = Number(finalPrice) * markupMultiplier;
        setValue("market", markedUpPrice.toFixed(8));

        const amount = getValues("volume");
        if (!isNaN(amount) && amount > 0) {
          const received = calculateReceivedAmount(amount);
          setValue("receive", received);
        }
      }
    } catch (error) { }
  };

  const fetchFxMarkup = async (value: any) => {
    const [res] = await getFxMarkup(dashboard.priceList);
    const array: FXMarkup[] = res?.body?.filter((item: any) => item?.priceListId === dashboard?.priceList) ?? [];
    const filterPriceList: FXMarkup[] = array?.filter((item: any) => {
      return (
        (item?.fromCurrencyId === "ANY" || item?.fromCurrencyId === coinName(value?.coin1)) &&
        (item?.toCurrencyId === "ANY" || item?.toCurrencyId === coinName(value?.coin2)) &&
        dateValidation(item) &&
        item.status
      );
    });
    const fee = filterPriceList[0]?.percent ?? 0;
    setValue("fxMarkUp", Number(fee));
  };

  const fetchTransaferFees = async (value: any) => {
    const [res, error]: APIResult<TransferFees[]> = await ApiHandler(fetchTransaferFeesApi);
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

    setValue("exchangePercent", exchangeFees?.percent ?? 0);
    setValue("exchangeFixedFee", exchangeFees?.fixedFee ?? 0);
    setValue("transactionPercent", Transactionfees?.percent ?? 0);
    setValue("transactionFixedFee", Transactionfees?.fixedFee ?? 0);
  };

  const fetchEuroMarketData = async (value: string) => {
    const euroPair = value + "/EUR";
    try {
      const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${changeName(euroPair)}`);
      const data = await response.json();
      if (data.result[changeName(euroPair)]) {
        setValue("euroMarket", data.result[changeName(euroPair)]?.a[0]);
      }
    } catch (error) { }
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

    setValue("reversed", reversed);
    if (!matchingPair) return;
    setValue("pair", matchingPair);

    const krakenType = reversed ? "buy" : "sell";
    setValue("type", krakenType);

    void fetchFxMarkup({ coin1: reversed ? to : from, coin2: reversed ? from : to });
    void fetchTransaferFees(to);

    const interval_1 = setInterval(() => fetchMarketData(matchingPair!, reversed), 4000);
    const interval_2 = setInterval(() => fetchEuroMarketData(to === "EUR" ? from_ : to_), 4000);

    return () => {
      clearInterval(interval_1);
      clearInterval(interval_2);
    };
  }, [from, to]);

  useEffect(() => {
    if (!market || isNaN(volume) || volume <= 0) {
      setValue("receive", "0.0");
      return;
    }
    setValue("receive", calculateReceivedAmount(volume));
  }, [volume, market]);

  const [limits, setLimits] = useState<Limits[]>();
  useEffect(() => {
    if (dashboard.limitList) {
      getLimits(dashboard.limitList).then(([res]) => {
        if (res?.success && res?.body) setLimits(res?.body);
      });
    }
  }, []);

  const handleAddOrder = async () => {
    const formData = {
      spendingCurrency: from,
      receivingCurrency: to,
      pair,
      ordertype: orderType,
      price: market,
      spendingAmount: volume ?? 0,
      receivingAmount: receive ?? 0,
      volume: type === "sell" ? volume ?? 0 : receive ?? 0,
      type,
      fxMarkUp,
      exchangeFixedFee,
      exchangePercent,
      transactionFixedFee,
      transactionPercent,
      exchangeFee,
      transactionFee,
    };

    setLoading(true);
    const [data] = await ApiHandler(createExchangeTransaction, formData);
    setLoading(false);

    if (data?.success) {
      reset();
      toast.success(data?.message || "Order added successfully");
      setOpen("");
    }
  };

  const handleSwap = () => {
    const tempFrom = from;
    setValue("from", to);
    setValue("to", tempFrom);
  };

  return (
    <div className="flex justify-center py-2">
      {/* Functionality: Confirmation Dialog */}
      <Dialog open={open === "confirmPopup"} onClose={() => setOpen("")} maxWidth="sm" fullWidth>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Confirm your Order</h2>
            <button onClick={() => setOpen("")}><Image src={Close} alt="close" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Order Type</span>
              <span className="font-bold capitalize">{orderType}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Estimated to spend</span>
              <span className="font-bold">{volume} {coinForKrakenName(from)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Estimated to receive</span>
              <span className="font-bold">{receive} {coinForKrakenName(to)}</span>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={() => setOpen("")} className="text-gray-500 font-semibold px-6">Cancel</button>
            <button
              type="button"
              onClick={handleAddOrder}
              className="bg-[#4775F2] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </Dialog>

      <form onSubmit={handleSubmit(() => setOpen("confirmPopup"))} className="w-full  max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-[#0B09094A] overflow-hidden">
          {/* Header Section */}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-[#1A1C1E]">Exchange</h1>
            <p className="text-[#606060] mt-2  font-normal opacity-70">Exchange at best market price</p>
          </div>

          <div className="h-[1px] bg-[#0B09094A] w-full"></div>

          <div className="p-4  space-y-5">
            {/* Asset Selection */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-lg font-semibold text-[#1A1C1E] ml-1">From</label>
                <Controller
                  control={control}
                  name="from"
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      options={assets}
                      getOptionLabel={(option) => option.name || ""}
                      value={assets.find(a => a.assetId === value) || null}
                      onChange={(_, v) => onChange(v?.assetId)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "50px",
                              borderRadius: "8px",
                              backgroundColor: "white",
                              fontSize: "18px",
                              fontWeight: 500,
                              paddingLeft: "12px",
                              "& fieldset": { borderColor: "#E5E7EB" },
                              "&:hover fieldset": { borderColor: "#4775F2" },
                              "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
                            }
                          }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: fromAssetValue && (
                              <InputAdornment position="start">
                                <Image src={fromAssetValue.icon || ""} alt="" width={28} height={28} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} className="flex items-center gap-3 p-4">
                          <Image src={option.icon || ""} alt="" width={28} height={28} />
                          <span className="font-medium text-lg">{option.name}</span>
                        </li>
                      )}
                    />
                  )}
                />
              </div>

              <div className="flex justify-center md:mt-9">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-sm rotate-90 md:rotate-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 1L21 5M21 5L17 9M21 5H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 23L3 19M3 19L7 15M3 19H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-lg font-semibold text-[#1A1C1E] ml-1">To</label>
                <Controller
                  control={control}
                  name="to"
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      options={assets}
                      getOptionLabel={(option) => option.name || ""}
                      value={assets.find(a => a.assetId === value) || null}
                      onChange={(_, v) => onChange(v?.assetId)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "50px",
                              borderRadius: "8px",
                              backgroundColor: "white",
                              fontSize: "18px",
                              fontWeight: 500,
                              paddingLeft: "12px",
                              "& fieldset": { borderColor: "#E5E7EB" },
                              "&:hover fieldset": { borderColor: "#4775F2" },
                              "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
                            }
                          }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: toAssetValue && (
                              <InputAdornment position="start">
                                <Image src={toAssetValue.icon || ""} alt="" width={28} height={28} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} className="flex items-center gap-3 p-4">
                          <Image src={option.icon || ""} alt="" width={28} height={28} />
                          <span className="font-medium text-lg">{option.name}</span>
                        </li>
                      )}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex xl:flex-row flex-col xl:items-center gap-4">
              {/* Amount Section */}
              <div className="space-y-3 ">
                <label className="text-lg font-semibold text-[#1A1C1E] ml-1">Amount<span className="text-red-500">*</span></label>
                <div className="relative  min-h-[50px]  flex items-center bg-white border border-gray-200 rounded-lg px-3 sm:px-5 focus-within:border-[#4775F2] transition-all gap-2">
                  <Controller
                    control={control}
                    name="volume"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="Enter Amount"
                        className="flex-1 bg-transparent text-lg sm:text-xl font-medium text-[#1A1C1E] outline-none placeholder:text-gray-300 placeholder:font-normal min-w-0"
                      />
                    )}
                  />
                  <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
                    <span className="text-base sm:text-xl font-medium text-[#1A1C1E] opacity-60 uppercase">{coinForKrakenName(from)}</span>
                    <button
                      type="button"
                      onClick={() => setValue("volume", parseFloat(assetBalance?.balance ?? "0"))}
                      className="h-8  px-2 sm:px-4 border border-[#4775f2b1] text-white rounded-md text-[10px] sm:text-sm font-semibold bg-white hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                      Max <span className="hidden md:inline">({Number(assetBalance?.balance || 0).toFixed(6)} {fromAssetValue?.name || ""})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Type Section */}
              <div className="space-y-3 flex-1">
                <label className="text-lg font-semibold text-[#1A1C1E] ml-1">Order Type</label>
                <Controller
                  control={control}
                  name="orderType"
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      options={["market", "limit"]}
                      getOptionLabel={(v) => v === "market" ? "Market" : "Limit"}
                      value={value}
                      onChange={(_, v) => onChange(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "50px",
                              borderRadius: "8px",
                              backgroundColor: "white",
                              fontSize: "18px",
                              fontWeight: 500,
                              "& fieldset": { borderColor: "#E5E7EB" },
                            }
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>
            </div>

            {/* Price Information Boxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
                <p className="text-base  font-medium text-[#606060] opacity-80">Market Price</p>
                <h2 className="text-xl break-all font-bold text-[#1A1C1E] tracking-tight">{market || "78258.6000"}</h2>
                <p className="text-sm  text-[#606060] opacity-60 font-medium">{coinForKrakenName(to)} per {coinForKrakenName(from)}</p>
              </div>

              <div className="bg-[#FFF8F9] border border-[#FFD0DA] rounded-md p-4 space-y-3">
                <p className="text-base  font-medium text-[#606060] opacity-80">You will receive</p>
                <h2 className="text-xl  break-all font-bold text-[#FF3D71] tracking-tight">{receive || "0.1"}</h2>
                <p className="text-sm  text-[#606060] opacity-60 font-medium">{coinForKrakenName(to)} per {coinForKrakenName(from)}</p>
              </div>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-primary-gradient text-white px-12 py-4 rounded-lg font-bold text-xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Execute Trade"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExchangeNew;
