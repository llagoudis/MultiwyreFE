import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Big from "big.js";
import Image from "next/image";
import {useEffect, useState} from "react";
import {ToastContainer, toast} from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

import {Box} from "@mui/material";
import {
  getAssets,
  getEconUrlTransaction,
  pricelistFn,
  updateEconUrlTransaction,
} from "~/service/ApiRequests";
import {ApiHandler, withoutProtection} from "~/service/UtilService";
import DownArrow from "../../assets/general/arrow_down.svg";
import MuiButton from "../MuiButton";

interface Asset {
  krakenAssetId: string;
  fireblockAssetId: string;
  icon: string;
  name: string;
  address?: string;
  network: string;
  networkIcon: string;
}

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  setApiResponseData: (data: any) => void;
  onSubmitFee: (value?: any) => void;
};

type Fee = {
  currencyId: string;
  fixedFee: number;
  percent: number;
};

type PriceList = {
  TransferFees: Fee[];
};

const EcomInvoicePayTwo = (props: propType) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isInputVisible, setInputVisible] = useState(false);
  const [coin, setCoin] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [amount, setAmount] = useState<any>("");
  const [projectId, setProjectId] = useState<any>("");
  const [conversionValue, setConversionValue] = useState(0);
  const [withoutNetworkValue, setWithoutNetworkValue] = useState(0);

  const [requestedAsset, setRequestedAsset] = useState<any>("");
  const [getPriceList, setgetPriceList] = useState<any>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceListLoaded, setPriceListLoaded] = useState(false);
  const [percentage, setpercentage] = useState<string | number>("");
  const [fixedFee, setFixedFee] = useState<string | number>("");
  const [markPercentage, setmarkPercentage] = useState<string | number>("");
  const [selectedNetwork, setSelectedNetwork] = useState<{
    name: string;
    icon: string;
  }>({name: "", icon: ""});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchAssets();
    geteconurlTransaction();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchPriceList(projectId).then(() => setPriceListLoaded(true));
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedAsset && amount && priceListLoaded) {
      fetchConversion(selectedAsset?.krakenAssetId, amount);
    }
  }, [selectedAsset, amount, priceListLoaded]);

  const fetchConversion = async (currency: string, amount: string) => {
    const pair = `${currency}/${requestedAsset}`;
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );
      const data = await response.json();

      if (data.result[pair]) {
        const rate = data.result[pair]?.a[0];
        const numericAmount = Number(amount);

        const convertedValue = numericAmount / rate;
        const finalResult = parseFloat(convertedValue.toFixed(6));

        calculateConversionValue(
          getPriceList,
          selectedAsset,
          finalResult,
          setConversionValue,
          setWithoutNetworkValue,
        );
      }
    } catch (error) {
    }
  };

  const geteconurlTransaction = async () => {
    const url = window.location.href;
    const requestBody = {url};

    try {
      const [data, error]: APIResult<{
        requestedAmount: string;
        requestedAssetId: string;
        merchantId: string;
        status: string;
        createdAt: string;
      }> = await ApiHandler(getEconUrlTransaction, requestBody);
      setAmount(data?.body?.requestedAmount);
      setProjectId(data?.body?.merchantId);
      setRequestedAsset(data?.body?.requestedAssetId);
      const updatedObject: any = data?.body;

      if (data?.body?.status === "COMPLETED") {
        props.setApiResponseData(data);
        props.onClose("success");
      }
    } catch (error) {
      toast.error("Error initiating payment");
    }
  };

  const fetchPriceList = async (projectId: string) => {
    try {
      const response = await pricelistFn(projectId);
      setgetPriceList(response.data.body.findPriceList);
    } catch (error) {
    }
  };

  const handleTextClick = () => {
    setInputVisible(true);
    setIsSubmitted(false);
  };

  const handleCancelClick = () => {
    setInputVisible(false);
    setCoin("");
  };

  const handleSendClick = () => {
    setIsSubmitted(true);
    setInputVisible(false);
    setCoin("");
  };

  const handleBreadcrumbClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleContinueClick = async () => {
    if (!selectedAsset) {
      toast.error("Please select an asset");
      return;
    }
    const numericConversionValue = Number(conversionValue);
    const formattedConversionValue = !isNaN(numericConversionValue)
      ? parseFloat(numericConversionValue.toFixed(6))
      : 0;
    const NetworkFee = Number(percentage) + Number(fixedFee);
    const url = window.location.href;
    const requestBody = {
      currency: selectedAsset.fireblockAssetId,
      url,
      conversionValue: formattedConversionValue,
      networkFee: NetworkFee,
      fxmarkUp: markPercentage,
    };
    try {
      setLoading(true);
      const [data, error]: APIResult<{ body: any }> = await withoutProtection(
        updateEconUrlTransaction,
        requestBody,
      );
      setLoading(false);
      toast.success("Payment successfully initiated");
      props.onClose("scanner");
      props.onSubmitFee(NetworkFee);
      const additionalData = {
        conversionValue: formattedConversionValue,
        selectedAsset,
        withoutNetworkValue,
      };
      const combinedData = {
        ...data,
        ...additionalData,
      };
      props.setApiResponseData(combinedData);
    } catch (error) {
      toast.error("Error initiating payment");
    }
  };

  async function fetchAssets() {

    const [data] = await ApiHandler(getAssets);


    const res: any = data?.body ?? [];

    console.table(res);

    const filtered = res.filter(
      (item: Asset) =>
        item?.name.toLowerCase() !== "any" &&
        item?.name.toLowerCase() !== "euro" &&
        item?.name.toLowerCase() !== "usd",
    );

    console.table(filtered);

    const defaultAsset = filtered.find(
      (item: Asset) =>
        item.network === "ETH" &&
        item.name?.toUpperCase().includes("USDC"),
    );


    if (!defaultAsset) {
      console.warn("❌ No default ETH USDC asset found");
    }

    let defaultNetwork = null;

    if (defaultAsset) {
      defaultNetwork = {
        name: defaultAsset.network,
        icon: defaultAsset.networkIcon,
      };


      setSelectedAsset(defaultAsset);
      setSelectedNetwork(defaultNetwork);
    }

    setAssets(filtered);
  }

  const calculateConversionValue = (
    getPriceList: any,
    selectedAsset: any,
    FinalAmount: number | string,
    setFinalAmount: any,
    setWithoutNetworkValue: any,
  ) => {

    // =====================================================================
    const fromCurrencyIds: string[] = [];
    const toCurrencyIds: string[] = [];
    let foundAny = false;
    let MarkupFeePercentage;

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
      getPriceList?.FxMarkupFees.forEach((index: { percent: any }) => {
        MarkupFeePercentage = index.percent;
      });
    } else if (fromCurrencyIds.includes("ANY")) {
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; fromCurrencyId: string }) => {
          if (
            index.fromCurrencyId === "ANY" &&
            toCurrencyIds.includes(selectedAsset.fireblockAssetId)
          ) {
            MarkupFeePercentage = index.percent;
          }
        },
      );
    } else if (toCurrencyIds.includes("ANY")) {
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; toCurrencyId: string }) => {
          if (
            index.toCurrencyId === "ANY" &&
            fromCurrencyIds.includes(requestedAsset)
          ) {
            MarkupFeePercentage = index.percent;
          }
        },
      );
    } else {
      let matched = false;

      getPriceList?.FxMarkupFees.forEach(
        (index: {
          fromCurrencyId: string;
          toCurrencyId: string;
          percent: any;
        }) => {
          if (
            index.fromCurrencyId === requestedAsset &&
            index.toCurrencyId === selectedAsset.fireblockAssetId
          ) {
            matched = true;
            MarkupFeePercentage = index.percent;
          }
        },
      );

      if (!matched) {
        MarkupFeePercentage = "0";
      }
    }

    // =====================================================================
    if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) => fee.currencyId === "ANY",
      )
    ) {
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      setmarkPercentage(markupCalculation.toString());

      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);
      const withFxMarkup = new Big(FinalAmount).plus(markupCalculation);
      setWithoutNetworkValue(withFxMarkup.toString());
      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) =>
          fee.currencyId === selectedAsset.fireblockAssetId,
      )
    ) {
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      setmarkPercentage(markupCalculation.toString());
      setWithoutNetworkValue(amountAfterFXMarkup.toString());
      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) =>
            fee.currencyId === selectedAsset.fireblockAssetId,
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) =>
            fee.currencyId === selectedAsset.fireblockAssetId,
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);

      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else {
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);


      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));

      const afterCalculationmark = Big(FinalAmount).plus(markupCalculation);

      const withFxMarkup = new Big(FinalAmount).plus(markupCalculation);
      setWithoutNetworkValue(withFxMarkup.toString());
      setFinalAmount(afterCalculationmark.toString());
      setmarkPercentage(markupCalculation.toString());
      setpercentage("0");
      setFixedFee("0");
    }
  };

  const networks = [
    ...new Map(
      assets.map((asset) => [
        asset.network,
        {
          name: asset.network,
          icon: asset.networkIcon,
        },
      ]),
    ).values(),
  ];

  function USDC_USDT_icon(token: string, icon: string) {
    if (!token) return icon || null;
    const USDC_ICON = assets?.find(
      (item) => item.network === "ETH" && item?.krakenAssetId === "USDC",
    );
    const USDT_ICON = assets?.find(
      (item) => item.network === "ETH" && item?.krakenAssetId === "USDT",
    );

    const resolved = token.includes("USDC")
      ? (USDC_ICON?.icon ?? icon)
      : token.includes("USDT")
        ? (USDT_ICON?.icon ?? icon)
        : icon;
    return resolved || null;
  }

  const filteredAssets =
    selectedNetwork.name === ""
      ? assets
      : assets.filter(
        asset => asset.network === selectedNetwork.name
      );
  return (
    <div>
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-[#f9fcff] p-4">
        <div className=" w-[90%] space-y-4 rounded-lg border bg-[#f9fcff] p-10 md:w-[700px]">
          <div className="text-center">
            <p className=" text-lg  font-semibold">
              Select the payment currency
            </p>
            <p className=" text-[13px] text-[#898da8]">Amount: {amount}</p>
          </div>

          <div className=" pb-6">
            <p className="text-sm font-semibold text-[#828893]">You pay</p>
            <p className=" text-[20px] font-semibold text-[#15161b]">
              {amount} {requestedAsset} ≈ {withoutNetworkValue}{" "}
              {selectedAsset ? selectedAsset.name : ""}
            </p>
          </div>

          <Box className="flex w-full gap-4">
            {/* TOKEN DROPDOWN */}

            <Box className="relative flex w-1/2 flex-col">
              <span className="mb-1 text-sm">Token</span>
              <div
                className={
                  !selectedNetwork.name ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                <Listbox
                  value={selectedAsset}
                  onChange={setSelectedAsset}
                  disabled={!selectedNetwork.name}
                >
                  <ListboxButton
                    className="flex w-full items-center justify-between rounded-lg bg-[#eff3f4] p-3 pl-4 text-left">
                    <div className="flex items-center gap-2">
                      {selectedAsset &&
                        USDC_USDT_icon(
                          selectedAsset.name,
                          selectedAsset.icon,
                        ) && (
                          <Image
                            src={USDC_USDT_icon(
                              selectedAsset.name,
                              selectedAsset.icon,
                            )}
                            width={24}
                            height={24}
                            alt="token"
                          />
                        )}
                      <p>
                        {selectedAsset
                          ? selectedAsset?.krakenAssetId
                          : "Select Token"}
                      </p>
                    </div>
                    <Image src={DownArrow} alt="arrow" width={12} height={8}/>
                  </ListboxButton>

                  <ListboxOptions
                    className="absolute z-50 mt-2 max-h-[40vh] w-full overflow-y-auto rounded-md bg-white shadow-lg">
                    {filteredAssets.map((asset, i) => {
                      const tokenIcon = USDC_USDT_icon(asset.name, asset.icon);
                      return (
                        <ListboxOption
                          key={i}
                          value={asset}
                          className="cursor-pointer px-4 py-2 hover:bg-[#F4F5FB]"
                        >
                          <div className="flex items-center gap-3">
                            {tokenIcon ? (
                              <Image
                                src={tokenIcon}
                                width={24}
                                height={24}
                                alt="token"
                              />
                            ) : null}
                            {asset?.krakenAssetId}
                          </div>
                        </ListboxOption>
                      );
                    })}
                  </ListboxOptions>
                </Listbox>
              </div>
            </Box>

            {/* NETWORK DROPDOWN */}

            <Box className="relative flex w-1/2 flex-col">
              <span className="mb-1 text-sm">Network</span>
              <div className="">
                <Listbox
                  value={selectedNetwork}

                  onChange={(value) => {
                    setSelectedNetwork(value);

                    if (value.name === "BTC") {
                      const btcAsset = assets.find(
                        (item) => item.network === "BTC",
                      );

                      setSelectedAsset(btcAsset ?? null);
                    } else {
                      if (selectedAsset) {
                        const thisNetworkAssets = assets?.filter(
                          (item) => item?.network === value.name,
                        );

                        // check if current selectedAsset exists in new network
                        const foundNextAsset = thisNetworkAssets.find(
                          (item) =>
                            item.krakenAssetId === selectedAsset.krakenAssetId,
                        );

                        // fallback to first asset if not found
                        setSelectedAsset(
                          foundNextAsset ?? thisNetworkAssets[0] ?? null,
                        );
                      } else {
                        setSelectedAsset(null);
                      }
                    }
                  }}
                >
                  <ListboxButton
                    className="flex w-full items-center justify-between rounded-lg bg-[#eff3f4] p-3 pl-4 text-left">
                    <div className="flex items-center gap-2">
                      {selectedNetwork.icon && (
                        <Image
                          src={selectedNetwork.icon}
                          width={24}
                          height={24}
                          alt={selectedNetwork.name}
                        />
                      )}
                      <p>
                        {selectedNetwork.name
                          ? selectedNetwork.name
                          : "Select Network"}
                      </p>
                    </div>
                    <Image src={DownArrow} alt="arrow" width={12} height={8}/>
                  </ListboxButton>

                  <ListboxOptions
                    className="absolute z-50 mt-2 max-h-[40vh] w-full overflow-y-auto rounded-md bg-white shadow-lg">
                    {networks
                      .filter((network) => network?.name)
                      .map((network) => (
                      <ListboxOption
                        key={network.name}
                        value={network}
                        className="cursor-pointer px-4 py-2 hover:bg-[#F4F5FB]"
                      >
                        <div className="flex items-center gap-3">
                          {network.icon ? (
                            <Image
                              src={network.icon}
                              width={24}
                              height={24}
                              alt="network"
                            />
                          ) : null}
                          {network.name}
                        </div>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Listbox>
              </div>
            </Box>
          </Box>

          <MuiButton
            loading={loading}
            disabled={loading}
            width="100%"
            padding="12px"
            name="Continue"
            onClick={handleContinueClick}
          ></MuiButton>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default EcomInvoicePayTwo;
