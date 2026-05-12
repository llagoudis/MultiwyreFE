import { Box, Button } from "@mui/material";
import Image from "next/image";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TEST_COINS } from "~/helpers/helper";
import Failed from "../../assets/general/close.png";
import Close from "../../assets/general/close.svg";
import Copy from "../../assets/general/copy.svg";
import Exclamatory from "../../assets/general/exclamatory.svg";
import Timer from "./Timer";

type propType = {
  onClose: (value?: any, status?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  apiResponseData: any;
  invoiceDetails: string | number;
};

declare global {
  interface Window {
    tronWeb: any;
    tronLink: any;
    unisat: any;
  }
}

const EcomInvoiceScannerTwo = (props: propType) => {
  const {
    body,
    conversionValue,
    selectedAsset,
    tmerchant,
    withoutNetworkValue,
  } = props.apiResponseData ?? {};

  const is_TESTNET = process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "development";
  const ETHERSCAN_API_KEY = "I9PP5PGNFQ6SWG7EXH8BRNVXUCC8RGJ7JZ";
  const [blockDataTime, setBlockDataTime] = useState(0);
  const [isSecondDialogOpen, setIsSecondDialogOpen] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [ethProvider, setEthProvider] = useState<any>(null);
  const [currentAccount, setCurrentAccount] = useState<string>();

  useEffect(() => {
    const merchantId = tmerchant?.publicKey;
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      const newWs = new WebSocket(`${wsUrl}?token=${merchantId}`);
      setWs(newWs);

      newWs.onopen = () => {
        console.log("WebSocket connection opened");
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data?.customerId == body?.customerId &&
            data?.assetId == body?.assetId &&
            data?.toAddress == body?.toAddress
          ) {
            setStatus(data);
            props.onClose("success", data);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      newWs.onclose = (event) => {
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (body) {
      let rawDate = body?.updatedAt;

      // Handle case where it's an object like { val: 'CURRENT_TIMESTAMP' }
      if (typeof rawDate === "object" && rawDate?.val) {
        rawDate = rawDate.val;
      }

      // Fallback: if backend only sends "CURRENT_TIMESTAMP", use Date.now()
      const createdAt: any =
        rawDate && rawDate !== "CURRENT_TIMESTAMP"
          ? new Date(rawDate)
          : new Date();

      const updateCountdown = () => {
        const currentTime: any = new Date();
        const timeDiff = Math.floor((currentTime - createdAt) / 1000);
        const countdownTime = 600 - timeDiff;
        setBlockDataTime(countdownTime > 0 ? countdownTime : 0);
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);
      return () => clearInterval(intervalId);
    }
  }, [body]);

  useEffect(() => {
    if (blockDataTime === 0) {
      const timerId = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) return prev - 1;
          clearInterval(timerId);
          window.location.href = body?.failedRedirectURL;
          return 0;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [blockDataTime, body]);

  useEffect(() => {
    const handleAnnounce = (event: any) => {
      const provider = event.detail.provider;

      // pick the first wallet (or add UI to choose later)
      setEthProvider(provider);

      provider
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        });
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounce);

    // Ask wallets to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce);
    };
  }, []);

  const maskAddress = (address: string): string => {
    if (address.length < 8) {
      throw new Error("Address is too short to mask");
    }
    const firstFour = address.slice(0, 4);
    const lastFour = address.slice(-4);
    const masked = `${firstFour}****${lastFour}`;
    return masked;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  function onCloseModel(): void {
    props.onClose("pay");
  }

  const rejectHandler = () => {
    window.location.href = body?.failedRedirectURL;
  };

  async function getGasFromApi(assetId = "ETH") {
    let url,
      defaultValue,
      mainnetValue = "";

    if (assetId === "ETH") {
      const apikey = ETHERSCAN_API_KEY;
      url = `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${apikey}`;
      defaultValue = "50";
      mainnetValue = "0.06";
    } else if (assetId === "BSC") {
      const apikey = ETHERSCAN_API_KEY;
      url = `https://api.etherscan.io/v2/api?chainid=56&module=gastracker&action=gasoracle&apikey=${apikey}`;
      defaultValue = "15";
      mainnetValue = "0.1";
    } else if (assetId === "MATIC") {
      const apikey = ETHERSCAN_API_KEY;
      url = `https://api.etherscan.io/v2/api?chainid=137&module=gastracker&action=gasoracle&apikey=${apikey}`;
      defaultValue = "30";
      mainnetValue = "300";
    }

    let gasValue;

    try {
      let data;
      if (!is_TESTNET) {
        const res = await fetch(url ?? "");
        data = await res.json();
      }

      console.log({ gasdata: data });

      gasValue = is_TESTNET
        ? defaultValue
        : data?.result?.FastGasPrice || mainnetValue;
    } catch (err) {
      console.error("Gas API failed:", err);
      gasValue = is_TESTNET ? defaultValue : mainnetValue;
    }

    return gasValue;
  }

  const sendParameters = async () => {
    try {
      if (
        selectedAsset?.name === TEST_COINS.BTC ||
        selectedAsset?.name === TEST_COINS.BTC_TEST
      ) {
        if (window.unisat) {
          // const accounts = await window.unisat.requestAccounts();
          // console.log("accounts: ", accounts);

          await window.unisat.sendBitcoin(
            body.toAddress,
            Math.floor(conversionValue * 1e8), // sats
          );

          return;
        }
      }

      if (selectedAsset?.base === "TRX") {
        await sendTrc20Transaction();
        return;
      }

      const provider = ethProvider;
      if (!provider) {
        toast.error("Please connect wallet first");
      }

      const dbChainId = Number(selectedAsset?.chainId);
      const chainIdHex = "0x" + dbChainId.toString(16);

      // Switch chain
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });

      const account = currentAccount;

      if (!account) {
        toast.error("Wallet not connected");
        return;
      }

      const recipientAddress = body?.toAddress;
      const tokenContractAddress = selectedAsset?.contract;

      let decimals = 18;

      if (tokenContractAddress) {
        decimals = await fetchTokenDecimals(provider, tokenContractAddress);
      }

      const rawAmount = Number(conversionValue) * 10 ** decimals;
      const amountWei = BigInt(Math.floor(rawAmount));
      const amountHex = "0x" + amountWei.toString(16);

      let tx: any = {};

      if (tokenContractAddress) {
        const cleanAddress = recipientAddress.replace("0x", "");
        const paddedAddress = cleanAddress.padStart(64, "0");
        const paddedAmount = amountWei.toString(16).padStart(64, "0");

        tx = {
          from: account,
          to: tokenContractAddress,
          data: `0xa9059cbb${paddedAddress}${paddedAmount}`,
          value: "0x0",
        };
      } else {
        tx = {
          from: account,
          to: recipientAddress,
          value: amountHex,
        };
      }

      //

      // GAS LIMIT
      const gas = "0x" + Number(200000).toString(16);
      tx.gas = gas;

      // GAS PRICE FROM API
      const assetForGas = selectedAsset?.base ? selectedAsset?.base : "ETH";
      console.log("assetForGas: ", assetForGas);
      const gasPrice = await getGasFromApi(assetForGas);

      function gweiToHex(gwei: string | number) {
        return "0x" + BigInt(Math.floor(Number(gwei) * 1e9)).toString(16);
      }
      tx.gasPrice = gweiToHex(gasPrice);

      await provider.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
    } catch (err: any) {
      toast.error(err.message || "Transaction failed");
    }
  };

  const sendTrc20Transaction = async () => {
    if (!window.tronLink?.ready) {
      toast.error("Please install and unlock TronLink");
      return;
    }

    const tronweb = window?.tronLink.tronWeb;

    const contractAddress = selectedAsset?.contract;
    const contract = await tronweb.contract().at(contractAddress);
    const decimals = await contract.decimals().call();
    const amount = BigInt(
      Math.floor(Number(conversionValue) * 10 ** Number(decimals)),
    ).toString();
    await contract.transfer(body?.toAddress, amount).send();
  };

  const fetchTokenDecimals = async (
    provider: any,
    contractAddress: string,
  ): Promise<number> => {
    try {
      const hexDecimals = await provider.request({
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x313ce567", // decimals()
          },
          "latest",
        ],
      });

      return parseInt(hexDecimals, 16);
    } catch {
      return 18;
    }
  };

  return (
    <Box className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-gray-100 p-4">
        <div className="relative h-[90vh] w-[95%] space-y-4 overflow-y-auto rounded-lg border bg-[#f9fcff] px-5 py-8 md:h-auto md:w-[700px] md:p-10">
          {blockDataTime > 0 ? (
            <>
              <div className="text-center">
                <p className="text-[32px] font-normal">Make a payment</p>
                <p className="text-base text-[#898da8]">
                  Amount: {body?.requestedAmount}{" "}
                  <span>{body?.requestedAssetId}</span>
                </p>
              </div>
              <div className="flex flex-col-reverse rounded-lg bg-white shadow-lg md:flex-row">
                <div className="flex w-full flex-col items-center justify-center border-r border-[#cdcdcd] px-2 py-4 md:min-w-[238px] md:p-2">
                  <QRCode value={body?.toAddress} />
                  <p className="mt-4 w-full break-words text-center text-[10px] text-[#6b7192] ">
                    {body?.toAddress}
                  </p>
                  <p
                    className={`mt-4 h-[50px] w-[50px] rounded-full p-3 px-3 text-white ${
                      blockDataTime < 120 ? "bg-[#F74B60]" : "bg-[#000000]"
                    }`}
                  >
                    <Timer
                      initialTime={blockDataTime}
                      onTimeUp={() => setIsSecondDialogOpen(false)}
                    />
                  </p>
                </div>
                <div className="md-min-w-[320px] w-full">
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">
                        Send exact amount
                      </p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {conversionValue}
                        {"  "}
                        {selectedAsset?.krakenAssetId}
                      </p>
                    </div>
                    <Image
                      onClick={() => copyToClipboard(conversionValue)}
                      className="h-[13.33px] w-[13.33px] cursor-pointer"
                      src={Copy}
                      alt="copy"
                    />
                  </div>
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">To this address</p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {maskAddress(body?.toAddress)}
                      </p>
                    </div>
                    <Image
                      onClick={() => copyToClipboard(body?.toAddress)}
                      className="h-[13.33px] w-[13.33px] cursor-pointer"
                      src={Copy}
                      alt="copy"
                    />
                  </div>
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">Network</p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {selectedAsset?.network}
                      </p>
                    </div>
                  </div>
                  <Box className="m-2">
                    <Button variant="contained" onClick={sendParameters}>
                      Connect wallet
                    </Button>
                  </Box>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-4 py-4 md:flex-row">
                <div className="flex w-full items-start gap-2 p-2 md:w-1/2">
                  <Image
                    src={Exclamatory}
                    alt="Exclamatory"
                    className="h-6 w-6"
                  />
                  <p className="text-sm text-[#6b7192]">
                    Make sure you{" "}
                    <span className=" font-semibold text-black">
                      {" "}
                      make the payment
                    </span>{" "}
                    within 10 minutes. Afterwards the rate will expire and you
                    will have to create a new payment
                    <br />
                    Sending any other currency will results in loss of funds
                  </p>
                </div>
                <div className="flex w-full flex-col gap-4 text-sm text-[#6b7192] md:w-1/2">
                  <div className="flex items-center justify-between">
                    <p>Exchange rate fixed for</p>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <p>Fixed rate</p>
                    <p>
                      {body?.requestedAmount} {body?.requestedAssetId} ={" "}
                      {Number(withoutNetworkValue).toFixed(6)}{" "}
                      {selectedAsset?.krakenAssetId}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <p>Network Fee:</p>
                    <p className=" font-semibold">
                      {Number(props.invoiceDetails).toFixed(6)}{" "}
                      {selectedAsset?.krakenAssetId}{" "}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSecondDialogOpen(false)}
                className="absolute right-3 top-0"
              >
                <Image src={Close} alt="Close" onClick={() => onCloseModel()} />
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <Image
                  src={Failed}
                  alt="Exclamatory"
                  className="w-150 h-150 ml-auto"
                />
                <p className="mt-12 text-[32px] font-normal">
                  Transaction Timeout..!!
                </p>
              </div>
              <p className="py-2 text-center text-[#FF0000]">
                Note: Your transaction is blocked due to timeout
                <p>(Ignore if you have completed the transfer)</p>
              </p>

              <div className="text-center">
                <button
                  onClick={rejectHandler}
                  className="ml-auto mt-4 rounded bg-[#FF0000] px-12 py-3 text-white"
                >
                  OK
                </button>
              </div>

              <button
                onClick={() => setIsSecondDialogOpen(false)}
                className="absolute right-3 top-0"
              >
                <Image src={Close} alt="Close" onClick={() => onCloseModel()} />
              </button>

              <p className="py-2 text-center text-[#000000]">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}
        </div>
      </div>
    </Box>
  );
};

export default EcomInvoiceScannerTwo;
