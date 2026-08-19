import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { FiCopy } from "react-icons/fi";
import { getInvoicesById } from "~/service/ApiRequests";
import { useRouter } from "next/router";
import QRCode from "qrcode.react";
import Timer from "./timer";
import { ApiHandler } from "~/service/UtilService";

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  updateOnTransition: boolean;
  onPaymentSuccess: (data: any) => void;
  onTimerComplete: () => void;
  invoiceDetails: updatePay;
};

interface updatePay {
  NetworkFee: number;
  customerId: string;
  merchantId: string;
  assetId: string;
}

type State = {
  toAddress: string;
};

const InvoiceScanner = (props: propType) => {
  const router = useRouter();
  const { id } = router.query;
  const [getInvoiceData, setgetInvoiceData] = useState<any>("");
  const [state, setState] = useState<State>();
  // const merchantIdRef = useRef<string | undefined>(undefined);

  // console.log("getInvoiceData 1231231", getInvoiceData);

  const formatAmount = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0,00";
    // Format with European style
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchData = async (id: any) => {
    try {
      if (typeof id === "string") {
        const [res, error]: APIResult<any> = await ApiHandler(
          getInvoicesById,
          id,
        );

        // console.log("res?.body", res?.body);
        // console.log(
        //   "res?.body?.transactionDetails?.status",
        //   res?.body?.transactionDetails?.status,
        // );

        if (res?.body) {
          setgetInvoiceData(res?.body);

          setState({
            toAddress: res?.body?.transactionDetails?.toAddress ?? "",
          });

          if (
            res?.body?.transactionDetails?.status === "COMPLETED" ||
            res?.body?.status === "COMPLETED"
          ) {
            props.onPaymentSuccess(res?.body);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  useEffect(() => {
    if (!id) return;

    void fetchData(id);

    const interval = setInterval(() => {
      void fetchData(id);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {}
  };

  const handleTimerComplete = () => {
    props.onTimerComplete();
  };

  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const merchantId = props.invoiceDetails?.merchantId;
    let cancelled = false;
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      const newWs = new WebSocket(`${wsUrl}?token=${merchantId}`);
      wsRef.current = newWs;
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
            data.customerId === props.invoiceDetails?.customerId &&
            data.assetId === props.invoiceDetails?.assetId &&
            data.toAddress === state?.toAddress
          ) {
            props.onPaymentSuccess(data);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      newWs.onclose = () => {
        if (!cancelled) {
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [state]);
  return (
    <Box className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <Box className="bg-white">
        <Box className="flex w-[90vw] flex-col items-start gap-1 px-10 py-5 text-sm font-semibold md:w-[60vw] lg:w-[40vw]">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold">
                Payment status : <span className="text-green-600">Active</span>
              </p>
              <div>
                <p className="text-xl font-bold">{getInvoiceData.name}</p>
                <p className="text-sm font-normal"></p>
              </div>

              <div className="flex flex-col gap-2 py-1">
                <span className="w-12">Description</span>
                <div className="font-normal">
                  {getInvoiceData?.transactionDetails?.billingItems.map(
                    (item: any, index: number) => (
                      <p key={index}>
                        {item.description && (
                          <>
                            {item.description} (
                            <span className="text-[10px] font-bold">
                              {/* {String(getInvoiceData?.currency) === "EUR"
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
                              {getInvoiceData.fiatCurrency}
                            </span>
                          </>
                        )}
                      </p>
                    ),
                  )}
                </div>
              </div>

              <div className="flex  gap-10">
                <span className="w-12">Amount</span>
                <span className="font-medium">
                  {formatAmount(getInvoiceData.amount)}
                  {"  "}
                  {getInvoiceData.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <QRCode
                size={180}
                value={getInvoiceData?.transactionDetails?.toAddress}
              />
            </div>
          </div>

          <Divider className="my-3 w-full" />

          <Timer initialTime={600} onTimerComplete={handleTimerComplete} />

          <Box className="my-3 w-full rounded-lg bg-[#D9D9D933] px-6 py-4">
            <Box className="flex items-center gap-2 py-2 text-[#C2912E]">
              <IoWarningOutline size={27} />
              <p className="text-base font-medium">Pay Attention to </p>
            </Box>

            <ul className="list-inside list-disc text-[#767676]">
              <li>Sending any other currency will result in loss of funds.</li>

              <li>
                If the wallet you are using charges a fee that reduces the total
                amount that is sent, please send enough to cover it.
              </li>
              <li>
                Network Fee:{" "}
                <span className="">
                  {Number(props.invoiceDetails?.NetworkFee).toFixed(6)}{" "}
                </span>
                {getInvoiceData?.transactionDetails?.assetId}
              </li>
            </ul>
          </Box>

          <Divider className="my-3 w-full" />

          <Box className="">
            <p className="font-normal">Amount to Pay</p>

            <Box className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {Number(
                  getInvoiceData?.transactionDetails?.exactAmount,
                ).toFixed(6)}{" "}
                {getInvoiceData?.transactionDetails?.assetId}
              </p>
              <IconButton
                onClick={() =>
                  handleCopy(getInvoiceData?.transactionDetails?.exactAmount)
                }
                edge="end"
              >
                <FiCopy size={15} color="black" />
              </IconButton>
            </Box>
          </Box>

          <Box className="my-2 w-full">
            <p className="pb-2 font-semibold">address to pay</p>

            <TextField
              size="small"
              className="w-full"
              value={getInvoiceData?.transactionDetails?.toAddress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        handleCopy(
                          `${getInvoiceData?.transactionDetails?.toAddress}`,
                        )
                      }
                      edge="end"
                    >
                      <FiCopy size={15} color="black" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <div className="m-auto flex justify-center"></div>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceScanner;
