import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  IconButton,
  Autocomplete,
  TextField,
  InputAdornment,
  Box
} from "@mui/material";
import { MdClose, MdSwapHoriz } from "react-icons/md";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import useGlobalStore from "~/store/useGlobalStore";
import {
  coinForKrakenName,
  coinName,
  dateValidation,
  changeName
} from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import {
  createExchangeTransaction,
  fetchTransaferFeesApi,
  getFxMarkup
} from "~/service/ApiRequests";
import { getLimits } from "~/service/api/transaction";
import toast from "react-hot-toast";
import useDashboard from "~/hooks/useDashboard";
import wallet from '../../assets/images/wallet-image.png'

interface ExchangeDrawerProps {
  open: boolean;
  onClose: () => void;
  assets: any[];
}

const availableCurrencies = ["BTC", "USDC", "EUR", "USDT", "ETH"];
const pairs = [
  "BTC/USDC", "BTC/EUR", "USDC/EUR", "ETH/EUR",
  "ETH/USDC", "ETH/BTC", "USDC/USDT", "USDT/EUR",
  "USDC/USDT.t", "USDT.t/EUR", "BTC/USDT.t"
];

const ExchangeDrawer: React.FC<ExchangeDrawerProps> = ({ open, onClose, assets: allAssets }) => {
  const dashboard = useGlobalStore((state) => state.dashboard);
  const dashboardAssets = useDashboard()?.assets;
  const [isLoading, setLoading] = useState(false);
  const [limits, setLimits] = useState<Limits[]>();

  const assets = useMemo(() =>
    allAssets.filter((item) =>
      availableCurrencies.includes(coinForKrakenName(item.assetId))
    ), [allAssets]
  );

  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ExchangeForm>({
    defaultValues: {
      from: assets[0]?.assetId || coinName("BTC"),
      to: assets[1]?.assetId || coinName("USDC"),
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

  const { from, to, volume, market, receive, type, pair, fxMarkUp, reversed } = watch();

  const fromAsset = useMemo(() => assets.find(a => a.assetId === from), [assets, from]);
  const toAsset = useMemo(() => assets.find(a => a.assetId === to), [assets, to]);
  const assetBalance = useMemo(() => dashboardAssets?.find(a => a.assetId === from), [dashboardAssets, from]);

  // Logic from ExchangeNew.tsx
  const calculateReceivedAmount = (vol: number) => {
    const values = getValues();
    const price = parseFloat(values.market ?? "0");
    const amount = vol * (price || 0);
    const exFee = amount * (values.exchangePercent / 100) + values.exchangeFixedFee;
    const trFee = amount * (values.transactionPercent / 100) + values.transactionFixedFee;
    const fee = Math.max(exFee, 0) + Math.max(trFee, 0);

    setValue("totalFees", fee);
    setValue("transactionFee", trFee);
    setValue("exchangeFee", exFee);

    return (amount - fee).toFixed(8);
  };

  const fetchMarketData = async (p: string, rev: boolean) => {
    try {
      const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${p}`);
      const data = await response.json();
      const priceStr = data.result[changeName(p)]?.a[0];
      if (priceStr) {
        const price = parseFloat(priceStr);
        const finalPrice = rev ? (1 / price).toFixed(8) : priceStr;
        const multiplier = 1 + (getValues("fxMarkUp") ?? 0) / 100;
        const markedUpPrice = Number(finalPrice) * multiplier;
        setValue("market", markedUpPrice.toFixed(8));

        const currentVol = getValues("volume");
        if (currentVol > 0) {
          setValue("receive", calculateReceivedAmount(currentVol));
        }
      }
    } catch (e) { }
  };

  useEffect(() => {
    if (!from || !to) return;
    const from_ = coinForKrakenName(from);
    const to_ = coinForKrakenName(to);
    let matchingPair = pairs.find(p => p === `${from_}/${to_}`);
    let rev = false;

    if (!matchingPair) {
      matchingPair = pairs.find(p => p === `${to_}/${from_}`);
      rev = true;
    }

    setValue("reversed", rev);
    if (!matchingPair) return;
    setValue("pair", matchingPair);
    setValue("type", rev ? "buy" : "sell");

    const fetchFees = async () => {
      const [res] = await getFxMarkup(dashboard.priceList) as any[];
      const markupBody = (res?.body as any[]) || [];
      const markup = markupBody.find((item: any) =>
        (item?.fromCurrencyId === "ANY" || item?.fromCurrencyId === coinName(rev ? to_ : from_)) &&
        (item?.toCurrencyId === "ANY" || item?.toCurrencyId === coinName(rev ? from_ : to_)) &&
        dateValidation(item) && item.status
      )?.percent ?? 0;
      setValue("fxMarkUp", Number(markup));

      const [feeRes] = await ApiHandler(fetchTransaferFeesApi) as any[];
      const feesArray = (feeRes?.body as any[]) || [];
      const exFees = feesArray.find((item: any) =>
        item?.priceListId === dashboard?.priceList && item?.operationType === 5 &&
        (item?.currencyId === "ANY" || item?.currencyId === to) && dateValidation(item) && item.status
      );
      const trFees = feesArray.find((item: any) =>
        item?.priceListId === dashboard?.priceList && item?.operationType === 7 &&
        (item?.currencyId === "ANY" || item?.currencyId === to) && dateValidation(item) && item.status
      );

      setValue("exchangePercent", exFees?.percent ?? 0);
      setValue("exchangeFixedFee", exFees?.fixedFee ?? 0);
      setValue("transactionPercent", trFees?.percent ?? 0);
      setValue("transactionFixedFee", trFees?.fixedFee ?? 0);
    };

    fetchFees();
    const timer = setInterval(() => fetchMarketData(matchingPair!, rev), 5000);
    return () => clearInterval(timer);
  }, [from, to]);

  useEffect(() => {
    if (!market || volume <= 0) {
      setValue("receive", "0.0");
      return;
    }
    setValue("receive", calculateReceivedAmount(volume));
  }, [volume, market]);

  const handleExecute = async () => {
    setLoading(true);
    const formData = {
      spendingCurrency: from, receivingCurrency: to,
      pair, ordertype: "market", price: market,
      spendingAmount: volume, receivingAmount: receive,
      volume: type === "sell" ? volume : receive,
      type, fxMarkUp,
      exchangeFixedFee: getValues("exchangeFixedFee"),
      exchangePercent: getValues("exchangePercent"),
      transactionFixedFee: getValues("transactionFixedFee"),
      transactionPercent: getValues("transactionPercent"),
      exchangeFee: getValues("exchangeFee"),
      transactionFee: getValues("transactionFee"),
    };

    const [data] = await ApiHandler(createExchangeTransaction, formData);
    setLoading(false);
    if (data?.success) {
      toast.success("Order executed successfully");
      onClose();
      reset();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "500px", md: "650px" },
          padding: { xs: "20px", sm: "20px" },
          backgroundColor: "#fff",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.05)"
        }
      }}
      ModalProps={{
        sx: { "& .MuiBackdrop-root": { backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.15)" } }
      }}
    >
      <div className="flex flex-col h-full font-sans">
        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-3xl font-bold text-[#1A1C1E]">Exchange</h2>
          <IconButton onClick={onClose} size="small" sx={{ border: "1px solid #E5E7EB", color: "#606060" }}>
            <MdClose size={18} />
          </IconButton>
        </div>
        <p className="text-[#606060]  mb-4 opacity-80">Transfer any currency inside Inqud without fees.</p>

        <div className="flex-1 overflow-y-auto space-y-8 pr-1 custom-scroll">
          {/* From / To Selection */}
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-[#606060]">From</label>
              <Autocomplete
                options={assets}
                getOptionLabel={(o) => o.name || ""}
                value={fromAsset || null}
                onChange={(_, v) => v && setValue("from", v.assetId)}
                disableClearable
                renderInput={(params) => (
                  <TextField {...params} sx={autocompleteStyles}
                    InputProps={{
                      ...params.InputProps, startAdornment: fromAsset && (
                        <InputAdornment position="start"><Image src={fromAsset.icon || ""} alt="" width={20} height={20} /></InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </div>

            <div className="mt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white">
                <MdSwapHoriz size={20} color="#606060" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-[#606060]">To</label>
              <Autocomplete
                options={assets}
                getOptionLabel={(o) => o.name || ""}
                value={toAsset || null}
                onChange={(_, v) => v && setValue("to", v.assetId)}
                disableClearable
                renderInput={(params) => (
                  <TextField {...params} sx={autocompleteStyles}
                    InputProps={{
                      ...params.InputProps, startAdornment: toAsset && (
                        <InputAdornment position="start"><Image src={toAsset.icon || ""} alt="" width={20} height={20} /></InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </div>
          </div>

          {/* Amount Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-[#606060]">Amount</label>
              <span className="text-[10px] text-[#8B8D91] font-medium">Limit 0.015 - 9.444098 Bitcoin</span>
            </div>
            <div className="relative flex items-center bg-[#F4F6F9] rounded-lg px-4 h-[56px] border border-transparent focus-within:border-[#4775F2] transition-all">
              <input
                type="number"
                placeholder="Enter Amount"
                className="bg-transparent flex-1 outline-none text-base font-medium text-[#1A1C1E] placeholder:text-gray-400"
                value={volume || ""}
                onChange={(e) => setValue("volume", parseFloat(e.target.value) || 0)}
              />
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#8B8D91] text-sm uppercase">{coinForKrakenName(from)}</span>
                <button
                  onClick={() => setValue("volume", parseFloat(assetBalance?.balance || "0"))}
                  className="bg-[#AB44A8] text-white text-[10px] font-bold px-3 py-1.5 rounded-md hover:bg-[#91378e] transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Market Price & Receive Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border border-[#E5E7EB] rounded-md bg-[#FCFDFF] space-y-2">
              <p className="text-sm text-[#606060] font-medium opacity-80">Market Price</p>
              <p className="text-xl font-bold text-[#1A1C1E] tracking-tight">{market || "78258.60000000"}</p>
              <p className="text-xs text-[#8B8D91] font-medium">{coinForKrakenName(to)} per {coinForKrakenName(from)}</p>
            </div>
            <div className="p-5 border border-[#FFD0DA] rounded-md bg-[#FFF8F9] space-y-2">
              <p className="text-sm text-[#606060] font-medium opacity-80">You will receive</p>
              <p className="text-xl font-bold text-[#FF3D71] tracking-tight">{receive || "0.1"}</p>
              <p className="text-xs text-[#8B8D91] font-medium">{coinForKrakenName(to)} per {coinForKrakenName(from)}</p>
            </div>
          </div>

          {/* Empty State */}
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="relative">
              <Image src={wallet} alt="" width={200} height={200} className="object-contain" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#1A1C1E] text-lg">There are no exchange addresses added yet.</p>
              <p className=" text-[#606060] max-w-[90%] mx-auto opacity-70 leading-relaxed">
                You haven't added any exchange addresses yet. Add an address to start exchanging.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#4F7AF9] to-[#D63E97] text-white py-4 rounded-md font-bold text-base shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Execute Trade"}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

const autocompleteStyles = {
  "& .MuiOutlinedInput-root": {
    height: "48px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#4775F2" },
    "&.Mui-focused fieldset": { borderColor: "#4775F2", borderWidth: "1px" },
    "& .MuiAutocomplete-input": { padding: "0 4px !important" }
  },
  "& .MuiInputAdornment-root": { marginRight: "4px" }
};

export default ExchangeDrawer;
