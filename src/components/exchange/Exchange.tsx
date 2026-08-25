import {
  Dialog,
  InputAdornment,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import btc_logo from "~/assets/currency/Bitcoin.svg";
import Tron from "~/assets/currency/tether-tron.svg";
import Ethernum from "~/assets/currency/Ethernum.svg";
import Euro from "~/assets/currency/euro.svg";
import USDC from "~/assets/currency/USDC.svg";
import Thether from "~/assets/currency/thether-usd-ethernum.svg";
import React, {
  useState,
  Fragment,
  useEffect,
  useMemo,
  ChangeEvent,
} from "react";
import Image, { type StaticImageData } from "next/image";
import Close from "~/assets/general/close.svg";
import Button from "../common/Button";
import toast from "react-hot-toast";
import { IoSearchOutline } from "react-icons/io5";
import useGlobalStore from "~/store/useGlobalStore";
import { useRouter } from "next/router";
import {
  SendOTCTradeMail,
  createExchangeTransaction,
  fetchTransaferFeesApi,
  getFxMarkup,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { getLimits } from "~/service/api/transaction";
import {
  changeName,
  coinName,
  dateValidation,
  formatDate,
} from "~/helpers/helper";
import useDashboard from "~/hooks/useDashboard";
import { getTransferFeesByPricelistId } from "~/service/api/pricelists";

interface conversionType {
  exchangePercent: number;
  exchangeFixedFee: number;

  transactionPercent: number;
  transactionFixedFee: number;
}

interface TransactionConfirmData {
  clientName: string;
  contactPerson: string;
  ordertype: string;
  walletAddress: string;
  accountNumber?: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

interface TransactionData {
  transactionId?: string;
  fromAssetId?: string;
  toAssetId?: string;
  clientRate?: number;
  fxMarkUp?: number;
  estimatedFee: number;
  type: string;
  creditedAmount: number;
  debitedAmount: number;
}

const Exchange = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);
  const admin = useGlobalStore((state) => state.admin);

  const router = useRouter();
  const [from, setFrom] = useState<string>("");
  const [open, setOpen] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [total, setTotal] = useState<any>("");
  const [volume, setVolume] = useState<any>("");
  const [price, setPrice] = useState<any>("");
  const [type, setType] = useState<string>("buy");
  const [orderType, setOrderType] = useState<string>("market");
  const [fxMarkUp, setFxMarkUp] = useState<number>(0);
  const [prizeFromKraken, setPrizeFromKraken] = useState<number>(0);
  const [euroValue, setEuroValue] = useState<number>(0);
  const [pair, setPair] = useState("BTC/USDC");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [unselctedValue, setUnselectedValue] = useState("");

  const [pairDilog, setpairDilog] = useState(false);

  const [conversionFee, setConversionFee] = useState<conversionType>({
    exchangePercent: 0,
    exchangeFixedFee: 0,
    transactionPercent: 0,
    transactionFixedFee: 0,
  });

  const dashboardAssets = useDashboard()?.assets;

  const pairs = [
    "USDC/USDT.t",
    "USDT.t/EUR",
    "BTC/USDT.t",
    "ETH/USDT.t",
    "BTC/USDC",
    "BTC/USDT",
    "BTC/EUR",
    "USDC/EUR",
    "USDC/USDT",
    "ETH/EUR",
    "ETH/USDC",
    "ETH/USDT",
    "ETH/BTC",
    "USDT/EUR",
  ];

  // Icons for pairs
  const pairIcon = (value: string) => {
    const pair = value.split("/");

    const coin1 = pair[0] ? pair[0] : "";
    const coin2 = pair[1] ? pair[1] : "";

    const iconsArray = [
      { coin: "BTC", icon: btc_logo as StaticImageData },
      { coin: "USDC", icon: USDC as StaticImageData },
      { coin: "USDT", icon: Thether as StaticImageData },
      { coin: "EUR", icon: Euro as StaticImageData },
      { coin: "ETH", icon: Ethernum as StaticImageData },
      { coin: "USDT.t", icon: Tron as StaticImageData },
    ];

    const icon1 = iconsArray.find((item) => item.coin === coin1)?.icon;
    const icon2 = iconsArray.find((item) => item.coin === coin2)?.icon;

    // Return the icons
    return (
      <div className="flex py-1">
        <Image src={icon1 ? icon1 : btc_logo} alt="" className="z-10 w-6" />
        <Image src={icon2 ? icon2 : USDC} alt="" className=" -ml-1 w-6 " />
      </div>
    );
  };

  const [limits, setLimits] = useState<Limits[]>();

  useEffect(() => {
    getLimits(dashboard.limitList).then(([res]) => {
      if (res?.success && res?.body) {
        setLimits(res?.body);
      }
    });
  }, []);

  useEffect(() => {
    const currency = pair.split("/");
    const coin1 = currency[0] ? currency[0] : "";
    const coin2 = currency[1] ? currency[1] : "";

    if (type === "buy") {
      fetchTransaferFees({ value: coin2 });
    } else {
      fetchTransaferFees({ value: coin1 });
    }

    fetchFxMarkup({ coin1, coin2 });

    setFrom(coin1);
    setTo(coin2);

    if (type === "buy") {
      setSelectedCurrency(coin2);
    } else {
      setSelectedCurrency(coin1);
    }
  }, [pair, type, dashboard?.priceList]);

  const fetchFxMarkup = async (value: any) => {
    try {
      const [res] = await getFxMarkup(dashboard.priceList);

      let filterPriceList: FXMarkup[] | undefined = [];
      if (type === "buy") {
        filterPriceList = res?.body?.filter((item: any) => {
          return (
            (item?.fromCurrencyId === "ANY" ||
              item?.fromCurrencyId === coinName(value?.coin2)) &&
            (item?.toCurrencyId === "ANY" ||
              item?.toCurrencyId === coinName(value?.coin1))
          );
        });
      } else if (type === "sell") {
        filterPriceList = res?.body?.filter((item: any) => {
          return (
            (item?.fromCurrencyId === "ANY" ||
              item?.fromCurrencyId === coinName(value?.coin1)) &&
            (item?.toCurrencyId === "ANY" ||
              item?.toCurrencyId === coinName(value?.coin2))
          );
        });
      }

      if (filterPriceList) {
        const fee = filterPriceList[0]?.percent
          ? filterPriceList[0]?.percent
          : 0;

        setFxMarkUp(Number(fee));
      }
    } catch (error) {
      //
    }
  };

  const balanceCoin1 = dashboard?.assets?.filter(
    (item) => item.assetId === coinName(from),
  )[0]
    ? Number(
        dashboard?.assets?.filter((item) => item.assetId === coinName(from))[0]
          ?.balance,
      )
    : 0;

  const balanceCoin2 = dashboard?.assets?.filter(
    (item) => item.assetId === coinName(to),
  )[0]
    ? Number(
        dashboard?.assets?.filter((item) => item.assetId === coinName(to))[0]
          ?.balance,
      )
    : 0;

  // transfer fees api
  const fetchTransaferFees = async ({ value }: any) => {
    const [res] = await getTransferFeesByPricelistId(dashboard.priceList);

    const exchangeFees = res?.body?.find((item: any) => {
      return (
        item?.operationType === 5 &&
        (item?.currencyId === "ANY" || item?.currencyId === coinName(value))
      );
    });

    const Transactionfees = res?.body?.find((item: any) => {
      return (
        item?.operationType === 7 &&
        (item?.currencyId === "ANY" || item?.currencyId === coinName(value))
      );
    });

    const response = {
      exchangePercent: exchangeFees?.percent ?? 0,
      exchangeFixedFee: exchangeFees?.fixedFee ?? 0,
      transactionPercent: Transactionfees?.percent ?? 0,
      transactionFixedFee: Transactionfees?.fixedFee ?? 0,
    };

    setConversionFee(response);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${changeName(pair)}`,
      );

      const data = await response.json();

      if (data.result[changeName(pair)]) {
        if (type === "buy") {
          setPrizeFromKraken(data.result[changeName(pair)]?.a[0]);
        } else {
          setPrizeFromKraken(data.result[changeName(pair)]?.b[0]);
        }
      }
    } catch (error) {
      setPrizeFromKraken(0);
      clearInterval(0);
    }
  };

  const assetBalance = useMemo(
    () =>
      dashboardAssets.find(
        (item) => item.assetId === coinName(selectedCurrency),
      ),

    [dashboardAssets, selectedCurrency],
  );

  // comment

  const assetBalanceUnselected = useMemo(
    () =>
      dashboardAssets.find((item) => item.assetId === coinName(unselctedValue)),

    [dashboardAssets, unselctedValue],
  );

  // comment

  const fetchData2 = async (value: string) => {
    const pair2 = value + "/EUR";
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${changeName(pair2)}`,
      );

      const data = await response.json();

      if (data.result[changeName(pair2)]) {
        setEuroValue(data.result[changeName(pair2)]?.a[0]);

        // setPrizeFromKraken(data.result[pair]?.a[0]);
      }
    } catch (error) {
      // setPrizeFromKraken(0);
      clearInterval(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (pair) {
        fetchData();
      }
    }, 1000);

    const interval2 = setInterval(() => {
      if (type === "buy") {
        fetchData2(from);
      } else {
        fetchData2(to === "EUR" ? from : to);
      }
    }, 1000);

    // Cleanup interval when component unmounts
    return () => {
      clearInterval(interval);
      clearInterval(interval2);
    };
  }, [pair, type, from, to]);

  const handleOrderTypeChange = (e: SelectChangeEvent) => {
    setOrderType(e.target.value);
    setVolume("");
    setTotal("");
    setPrice("");
  };

  const handleTypeChange = (e: string) => {
    setType(e);

    if (e === "sell") {
    }
    setVolume("");
    setTotal("");
    setPrice("");
  };

  const handleVolumeChange = (e: SelectChangeEvent) => {
    setSelectedCurrency(e.target.value);
    if (selectedCurrency === from) {
      setUnselectedValue(from);
    } else {
      setUnselectedValue(to);
    }

    setVolume("");
    setTotal("");
    setPrice("");
  };

  // const getBalance = () => {
  //   if (selectedCurrency && to) {

  //   }
  // }

  useEffect(() => {
    if (orderType === "limit") {
      if (selectedCurrency === from) {
        if (type === "buy") {
          setTotal(volume * (price * (1 + fxMarkUp / 100)));
        } else if (type === "sell") {
          setTotal(volume * (price * (1 - fxMarkUp / 100)));
        }
      } else {
        if (type === "buy") {
          setTotal(volume / (price * (1 + fxMarkUp / 100)));
        } else if (type === "sell") {
          setTotal(volume / (price * (1 - fxMarkUp / 100)));
        }
      }
    } else if (selectedCurrency === from) {
      if (type === "buy") {
        setTotal(volume * (prizeFromKraken * (1 + fxMarkUp / 100)));
      } else if (type === "sell") {
        setTotal(volume * (prizeFromKraken * (1 - fxMarkUp / 100)));
      }
    } else {
      if (type === "buy") {
        const exchangeFee =
          volume * (conversionFee.exchangePercent / 100) +
          conversionFee.exchangeFixedFee;

        const transactionFee =
          volume * (conversionFee.transactionPercent / 100) +
          conversionFee.transactionFixedFee;

        const totalFee = Math.max(exchangeFee, 0) + Math.max(transactionFee, 0);

        const actualAmount = Math.max(volume, 0) - Math.max(totalFee, 0);

        setTotal(actualAmount / (prizeFromKraken * (1 + fxMarkUp / 100)));
      } else if (type === "sell") {
        setTotal(volume / (prizeFromKraken * (1 - fxMarkUp / 100)));
      }
    }
  }, [prizeFromKraken, volume, price, fxMarkUp, conversionFee]);

  const currencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (!isNaN(value)) {
      setVolume(value);
    } else {
      setVolume("");
    }
  };

  const handlePriceValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setPrice(value);
    } else {
      setPrice("");
    }
  };

  function addFxMarkup(value: number) {
    if (!value) return 0;

    if (type === "buy") return value * (1 + fxMarkUp / 100);
    if (type === "sell") return value * (1 - fxMarkUp / 100);
  }

  let estimatedAmountToReceive = 0;
  let estimatedAmountToSpend = 0;
  let estimatedAmountToReceiveWithFees = 0;
  let estimatedAmountToSpendWithFees = 0;
  let exchangeFee = 0;
  let transactionFee = 0;

  let feesCurrency = "";
  let receivingCurrency = "";
  let spendingCurrency = "";

  let estimatedFees =
    total *
    ((conversionFee.exchangePercent + conversionFee.transactionPercent) / 100);

  estimatedFees =
    estimatedFees +
    (conversionFee.exchangeFixedFee + conversionFee.transactionFixedFee);

  if (selectedCurrency === from) {
    if (type === "buy") {
      feesCurrency = to;
      receivingCurrency = from;
      spendingCurrency = to;

      estimatedAmountToReceive = estimatedFees / prizeFromKraken;
      estimatedAmountToReceive = volume - estimatedAmountToReceive;
      estimatedAmountToReceive = Math.max(estimatedAmountToReceive, 0);
      estimatedAmountToReceiveWithFees = estimatedAmountToReceive;

      estimatedAmountToSpend = total;
      estimatedAmountToSpend = Math.max(estimatedAmountToSpend, 0);
      estimatedAmountToSpendWithFees = estimatedAmountToSpend;
    } else {
      feesCurrency = from;
      receivingCurrency = to;
      spendingCurrency = from;

      transactionFee =
        total * (conversionFee.transactionPercent / 100) +
        conversionFee.transactionFixedFee;
      exchangeFee =
        total * (conversionFee.exchangePercent / 100) +
        conversionFee.exchangeFixedFee;

      estimatedAmountToReceive = Math.max(total - transactionFee, 0);
      estimatedAmountToReceiveWithFees = estimatedAmountToReceive;

      exchangeFee =
        volume * (conversionFee.exchangePercent / 100) +
        conversionFee.exchangeFixedFee;
      estimatedFees = exchangeFee;
      estimatedAmountToSpend = volume - exchangeFee;
      estimatedAmountToSpend = Math.max(estimatedAmountToSpend, 0);
      estimatedAmountToSpendWithFees = estimatedAmountToSpend;
    }
  } else {
    if (type === "buy") {
      feesCurrency = to;
      receivingCurrency = from;
      spendingCurrency = to;

      exchangeFee =
        volume * (conversionFee.exchangePercent / 100) +
        conversionFee.exchangeFixedFee;

      transactionFee =
        volume * (conversionFee.transactionPercent / 100) +
        conversionFee.transactionFixedFee;

      const totalFee = exchangeFee + transactionFee;

      estimatedFees = totalFee;

      estimatedAmountToReceive = Math.max(total, 0);

      estimatedAmountToReceiveWithFees = Math.max(total);

      estimatedAmountToSpend = Math.max(volume, 0);
      estimatedAmountToSpendWithFees = estimatedAmountToSpend;
    } else {
      feesCurrency = from;
      receivingCurrency = to;
      spendingCurrency = from;

      exchangeFee =
        volume * (conversionFee.exchangePercent / 100) +
        conversionFee.exchangeFixedFee;

      transactionFee =
        volume * (conversionFee.transactionPercent / 100) +
        conversionFee.transactionFixedFee;

      // const totalFee = exchangeFee + transactionFee;
      // estimatedFees = totalFee;

      estimatedAmountToReceive = Math.max(volume, 0);
      estimatedAmountToReceiveWithFees = Math.max(volume - estimatedFees, 0);

      estimatedAmountToSpend = Math.max(total, 0);
      estimatedAmountToSpendWithFees = estimatedAmountToSpend;
    }
  }

  const [isLoading, setLoading] = useState(false);

  const addOrderFinally = async ({ formData }: any) => {
    setLoading(true);
    const [data, error]: APIResult<{ txid: string }> = await ApiHandler(
      createExchangeTransaction,
      formData,
    );
    setLoading(false);

    if (data?.success == true) {
      toast.success("Transaction Successful");
      setOpen("");
    }

    // console.log("error____", error);
    // if (error?.includes("Invalid arguments")) {
    //   toast.error("Volume too low");
    //   setOpen("");
    // } else if (error?.includes("Insufficient funds")) {
    //   toast.error("Please contact administrator");
    //   setOpen("");
    // } else {
    //   setOpen("");
    // }

    // if (error?.includes("Please contact administrator")) {
    //   toast.error("Volume too low");
    //   setOpen("");
    // }

    // const transactionData: TransactionData = {
    //   type: type,
    //   fxMarkUp: fxMarkUp,
    //   clientRate:
    //     orderType === "limit"
    //       ? addFxMarkup(Number(price))
    //       : addFxMarkup(Number(prizeFromKraken)),
    //   creditedAmount: estimatedAmountToReceive,
    //   debitedAmount: estimatedAmountToSpend,
    //   estimatedFee: estimatedFees,
    // };
    // if (type === "buy") {
    //   transactionData.transactionId = data?.body?.txid[0];
    //   transactionData.fromAssetId =  (to);
    //   transactionData.toAssetId = coinName(from);
    // } else {
    //   transactionData.transactionId = data?.body?.txid[0];
    //   transactionData.fromAssetId = coinName(from);
    //   transactionData.toAssetId = coinName(to);
    // }

    // if (data?.body?.txid[0]) {
    //   const [data, error] = await ApiHandler(
    //     updateExchangeTransaction,
    //     transactionData,
    //   );
    // }
  };

  const handleAddOrder = () => {
    function krakenSendingVolume() {
      return selectedCurrency === from
        ? type === "buy"
          ? volume
          : estimatedAmountToSpend
        : type === "buy"
        ? estimatedAmountToReceive
        : estimatedAmountToSpend;
    }

    const formData = {
      spendingCurrency,
      receivingCurrency,
      volume: krakenSendingVolume(),
      swapped: selectedCurrency !== from,
      pair: changeName(pair),
      type: type,
      ordertype: orderType,
      price: price,
      total: 0,
      spendingAmount: volume ?? 0,
      receivingAmount: estimatedAmountToReceive ?? 0,
      fxMarkUp: fxMarkUp,
      conversionFee,
      exchangeFee,
      transactionFee,
    };

    // if (
    //   (type === "buy" && balanceCoin2 <= estimatedAmountToSpend) ||
    //   (type === "sell" && balanceCoin1 <= estimatedAmountToSpend)
    // ) {
    //   setOpen("checkBalance");
    // } else {
    addOrderFinally({ formData });
    // }
  };

  const handleConfirm = () => {
    const limitValue =
      to === "EUR" && type === "sell"
        ? estimatedAmountToReceive
        : estimatedAmountToReceive * euroValue;

    const errorConditionBuy = limits?.some((item) => {
      if (
        (item.currencyId === coinName(receivingCurrency) ||
          item.currencyId === "ANY") &&
        item.exchangeType === "OTC_TRADE" &&
        item.exchangeLimit === "MIN"
      ) {
        return limitValue <= Number(item.amount);
      } else if (
        (item.currencyId === coinName(receivingCurrency) ||
          item.currencyId === "ANY") &&
        item.exchangeType === "OTC_TRADE" &&
        item.exchangeLimit === "MAX"
      ) {
        return limitValue >= Number(item.amount);
      } else {
        return false;
      }
    });

    if (!volume) {
      toast.error(!volume ? "Volume should not be blank" : "OTC_TRADE");
    } else if (errorConditionBuy) {
      SendOTCPopup();
      setOpen("otcPopupOne");
    } else {
      setOpen("confirmPopup");
    }
  };

  const Confirm = () => {
    return (
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
              <p>{to}</p>
            </div>
            <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
              <>
                <p>Estimated amount to spend </p>
                {estimatedAmountToSpend}&nbsp;{spendingCurrency}
              </>
            </div>
            <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
              <p>Fees</p>
              <p>
                {volume && (
                  <span>
                    {estimatedFees} &nbsp;
                    {feesCurrency}
                  </span>
                )}
              </p>
            </div>
            <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
              <>
                <p>Estimated amount to receive </p>
                {estimatedAmountToReceiveWithFees}&nbsp;{receivingCurrency}
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
            <Button
              title={"Continue"}
              loading={isLoading}
              className="px-8 py-3"
              onClick={() => {
                // setNext(true);
                handleAddOrder();
              }}
            />
          </div>
        </div>
      </div>
    );
  };
  const [otcConfirmData, setOtcConfirmData] = useState<any>();

  function SendOTCPopup() {
    const date = JSON.stringify(new Date());

    // const accNum = dashboard?.
    //
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

    if (type === "buy") {
      transactionData.fromCurrency = coinName(to);

      transactionData.toCurrency = coinName(from);
      transactionData.amount = total;
    } else {
      transactionData.fromCurrency = coinName(from);
      transactionData.toCurrency = coinName(to);
      transactionData.amount = volume;
    }

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

    if (type === "buy") {
      transactionData.fromCurrency = coinName(to);
      transactionData.toCurrency = coinName(from);
      transactionData.amount = total;
    } else {
      transactionData.fromCurrency = coinName(from);
      transactionData.toCurrency = coinName(to);
      transactionData.amount = volume;
    }
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
    if (data?.success) {
      toast.success("Mail sent Successfully");
      setOpen("");
    }
    setLoading(false);
  }

  // const handleWheel = (event) => {
  //
  //   event.preventDefault();
  // };

  return (
    <>
      {/* pairs dialog  */}
      <Dialog
        open={pairDilog}
        onClose={() => {
          setpairDilog(false);
        }}
      >
        <div className="rounded p-4">
          {pairs.map((item, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-4 py-1"
              onClick={() => {
                setPair(item);
                setpairDilog(false);
              }}
            >
              <>{pairIcon(item)}</>

              <div>{item}</div>
            </div>
          ))}
        </div>
      </Dialog>

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
                personalized services tailored to facilitate large transactions.
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
                <p>{otcConfirmData?.fromCurrency}</p>
              </div>
              <div className=" flex justify-between border-b border-[#DFDDDD] py-4 text-xs sm:text-sm lg:text-base">
                <p>To Currency</p>
                <p>{otcConfirmData?.toCurrency}</p>
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
              <Button
                title={"Continue"}
                className="px-8 py-3"
                onClick={() => {
                  setOpen("otcPopup");
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>

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
              <Button
                title={"Ok"}
                loading={isLoading}
                className="px-8 py-3"
                onClick={() => {
                  // setOpen("confirmPopup");
                  SendOTCMail();
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* confirm dailog   */}
      <Dialog
        open={open === "confirmPopup"}
        onClose={() => {
          setOpen("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <Confirm />
      </Dialog>

      {/* checkbalance dailog   */}
      <Dialog
        open={open === "checkBalance"}
        onClose={() => {
          setOpen("");
        }}
        maxWidth={"sm"}
        fullWidth
      >
        <Alert severity="error">
          <AlertTitle>Insufficient Balance</AlertTitle>

          {`You need to have at least ${estimatedAmountToSpend} ${spendingCurrency}`}
        </Alert>
      </Dialog>

      {/* Container */}
      <div className="dashboardContainer m-auto w-[90%] lg:w-[95%]">
        {/* section 1 */}
        <div className="welcomeBoard mt-8 flex items-center justify-start">
          <div>
            <p className=" text-base font-bold">Crypto Exchange</p>
          </div>
        </div>

        {/* section 2  */}
        <div className="gap-10 py-5 lg:w-[60%] ">
          <div className="flex flex-col gap-10">
            <div className="flex items-center">
              <div className="w-[40%]">Order</div>
              <div className="flex w-full flex-1 items-center">
                <div className="w-full">
                  <Button
                    title="Buy"
                    onClick={() => {
                      handleTypeChange("buy");
                    }}
                    className={`rounded-none rounded-l-md border border-r-0 px-4 py-2 hover:bg-none    ${
                      type === "buy"
                        ? "bg-black text-white hover:bg-black"
                        : " bg-white text-slate-950  hover:bg-white"
                    }`}
                  ></Button>
                  <Button
                    title="Sell"
                    onClick={() => {
                      handleTypeChange("sell");
                    }}
                    className={`rounded-none rounded-r-md border border-l-0 px-4  py-2 hover:bg-none  ${
                      type === "sell"
                        ? "bg-black text-white hover:bg-black"
                        : "bg-white text-slate-950 hover:bg-white"
                    }`}
                  ></Button>
                </div>
                <div className="w-full">
                  <div
                    className="border-1 flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-1 py-1"
                    onClick={() => {
                      setpairDilog(true);
                    }}
                  >
                    <div>{pairIcon(pair)}</div>
                    <p className="flex-1 text-sm "> {pair}</p>

                    <div>
                      <IoSearchOutline />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center">
              <div className="w-[40%]">Volume</div>
              <div className="flex flex-1 items-start">
                <div className="w-full">
                  <TextField
                    value={volume}
                    onChange={currencyChange}
                    type="number"
                    onWheel={() =>
                      (document?.activeElement as HTMLInputElement)?.blur()
                    }
                    className="w-full"
                    size="small"
                  />
                  <p className="text-slate-400">
                    {selectedCurrency === from
                      ? type === "buy"
                        ? `Amount of ${from} to buy`
                        : `Amount of ${from} to sell`
                      : type === "buy"
                      ? `Amount of ${to} to spend`
                      : `Amount of ${to} to receive`}
                  </p>

                  <p className="text-red-500">
                    {volume > Number(assetBalance?.balance) &&
                    type == "buy" &&
                    selectedCurrency == to
                      ? "Amount cannot be more than balance"
                      : ""}
                  </p>
                  <p className="text-red-500">
                    {volume > Number(assetBalance?.balance) &&
                    type == "sell" &&
                    selectedCurrency == from
                      ? "Amount cannot be more than balance"
                      : ""}
                  </p>

                  <div className="ml-1 mt-4 flex w-fit items-center gap-2">
                    <input
                      onChange={(e) => {
                        e.target.checked
                          ? void setVolume(assetBalance?.balance)
                          : void setVolume("");
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
                </div>
                <Select
                  value={selectedCurrency}
                  onChange={handleVolumeChange}
                  displayEmpty
                  size="small"
                  className="w-[40%] border-none"
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value={from}>{from}</MenuItem>
                  <MenuItem value={to}>{to}</MenuItem>
                </Select>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-[40%]">Order type</div>
              <div className="flex-1">
                <Select
                  value={orderType}
                  onChange={handleOrderTypeChange}
                  displayEmpty
                  size="small"
                  className="w-full border-none"
                  inputProps={{ "aria-label": "Without label" }}
                >
                  <MenuItem value={"market"}>Market</MenuItem>
                  <MenuItem value={"limit"}>Limit</MenuItem>
                </Select>
              </div>
            </div>

            {orderType === "market" ? (
              <div className="flex items-center">
                <div className="w-[40%]">Est. price</div>
                <div className="flex-1">
                  <TextField
                    type="number"
                    disabled
                    className="w-full"
                    size="small"
                    value={addFxMarkup(Number(prizeFromKraken))?.toFixed(4)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>{to}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-[40%]">Limit price</div>
                <div className="flex-1">
                  <TextField
                    type="number"
                    className="w-full "
                    size="small"
                    value={price === 0 ? "" : price}
                    onChange={handlePriceValue}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <div className="w-[40%]">Total</div>
              <div className="flex-1">
                <TextField
                  type="number"
                  className="w-full "
                  size="small"
                  value={volume && total ? total : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography>
                          {selectedCurrency === from ? to : from}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <p className="text-slate-400">
                  {selectedCurrency === from
                    ? type === "buy"
                      ? `Amount of ${to} to spend`
                      : `Amount of ${to} to receive`
                    : type === "buy"
                    ? `Amount of ${from} to receive`
                    : `Amount of ${from} to spend`}
                </p>
                <p className="text-red-500">
                  {total > Number(assetBalanceUnselected?.balance) &&
                  type == "sell" &&
                  selectedCurrency == to
                    ? "Amount cannot be more than balance"
                    : ""}
                </p>
                <p className="text-red-500">
                  {total > Number(assetBalanceUnselected?.balance) &&
                  type == "buy" &&
                  selectedCurrency == from
                    ? "Amount cannot be more than balance"
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex w-full">
              <div className="w-[40%]"></div>
              <div className="flex-1">
                <Button
                  // disabled={volume > Number(assetBalance?.balance) || !volume || volume > Number(assetBalanceUnselected?.balance)}
                  disabled={
                    !volume ||
                    (type == "buy" &&
                      selectedCurrency == to &&
                      volume > Number(assetBalance?.balance)) ||
                    (type == "buy" &&
                      selectedCurrency == from &&
                      total > Number(assetBalanceUnselected?.balance)) ||
                    (type == "sell" &&
                      volume > Number(assetBalance?.balance) &&
                      selectedCurrency == from) ||
                    (type == "sell" &&
                      total > Number(assetBalanceUnselected?.balance) &&
                      selectedCurrency == to)
                  }
                  onClick={handleConfirm}
                  title={`${type === "buy" ? "Buy" : "Sell"} ${from}  ${
                    type === "buy" ? "with" : "for"
                  } ${to}  `}
                  className={`flex w-full justify-center py-2 text-center text-white ${
                    type === "buy" ? "bg-green-600 " : "bg-red-600"
                  }`}
                />
              </div>
            </div>

            <div className="rounded-md border p-4  ">
              <div className="flex w-full items-center ">
                <div className="w-[40%]">With this exchange you get</div>
                <div className="flex-1">
                  <p className=" text-xl font-bold text-[#C1922E] xl:text-2xl">
                    {volume && estimatedAmountToReceiveWithFees}&nbsp;
                    {receivingCurrency}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center">
                <div className="w-[40%]">Estimated price:</div>
                <div className="flex-1">
                  <p className="flex w-full flex-col text-sm font-semibold text-[#99B2C6] md:flex-row xl:mt-1">
                    <span className=" "> &nbsp;</span>
                    <span>
                      1 {from} = {addFxMarkup(prizeFromKraken)?.toFixed(4)}{" "}
                      &nbsp; {to}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center">
                <div className="w-[40%]">Estimated fee:</div>
                <div className="flex-1">
                  {volume && (
                    <p className="flex w-full flex-col text-sm font-semibold text-[#99B2C6] md:flex-row xl:mt-1">
                      {estimatedFees} &nbsp;
                      {feesCurrency}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Exchange;
