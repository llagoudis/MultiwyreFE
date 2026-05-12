import React, { useEffect, useRef, useState } from "react";
import { set, useForm } from "react-hook-form";
import Image from "next/image";
import Back from "~/assets/general/back-arrow.svg";
import ReviewIcon from "../../assets/buyCrypto/search-icon-buycrypto.svg";

import { currencyFlags, currencyFlagsOne } from "./helper";
import { ApiHandler } from "~/service/UtilService";
import {
  fetchPayoutTrxById,
  startPayoutFromMasterWallet,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";

interface PlayWithAppleProps {
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
  changeCardScreen: (screen: string) => void;
}

const OrderInReview: React.FC<PlayWithAppleProps> = ({
  changeScreen,
  changeCardScreen,
  trxDetails,
}) => {
  const {
    handleSubmit,
    formState: {},
  } = useForm<FormData>({
    defaultValues: {},
  });

  const receiverIcon = currencyFlags.find(
    (i) => i.feeCurrencyName === trxDetails?.receiverCurrency,
  )?.flag;
  const fiatIcon = currencyFlagsOne.find(
    (i) => i.subname === trxDetails?.fiatCurrency,
  )?.flag;

  const paymentDetails = [
    {
      label: "Pay",
      value: `${trxDetails?.fiatAmountAfterFees} ${trxDetails?.fiatCurrency}`,
      iconUrl: fiatIcon ?? "",
    },
    {
      label: "Recieve",
      value: `${trxDetails?.receiverAmount?.toFixed(
        8,
      )} ${trxDetails?.receiverCurrency}`,
      iconUrl: receiverIcon ?? "",
    },
    { label: "Unit price", value: `0 ${trxDetails?.fiatCurrency}` },
    {
      label: "Processing fee",
      value: `${trxDetails?.processingFee ?? 0} ${trxDetails?.fiatCurrency}`,
    },
    {
      label: "Networking fee",
      value: `${trxDetails?.networkFee ?? 0} ${trxDetails?.fiatCurrency}`,
    },
    {
      label: "Recipient address",
      value: trxDetails?.receiverAddress,
    },
  ];

  const [loading, setLoading] = useState<"fiatStatus" | "cryptoStatus" | "">(
    "",
  );

  const updateStatus = async () => {
    setLoading("fiatStatus");

    const [res, error] = await ApiHandler<PayoutTransaction>(
      fetchPayoutTrxById,
      {
        trxId: trxDetails?.transactionId,
      },
    );

    if (res?.success && res?.body?.status === "SUBMITTED") {
      changeScreen("success");
    }
    setLoading("");

    if (error) {
      toast.error(error);
      return "";
    }
  };

  async function createTransaction() {
    const [res, error] = await ApiHandler(startPayoutFromMasterWallet, {
      transactionId: trxDetails?.transactionId,
      status: "COMPLETED",
    });

    if (res?.success) {
      void updateStatus();
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void createTransaction();
    }, 5000);

    return () => clearInterval(timer); // cleanup on unmount
  }, []);

  return (
    <form>
      <div className="relative flex min-h-[600px] w-full min-w-[535px] flex-col items-center justify-center gap-6 overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg">
        <button
          type="button"
          className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
          onClick={() => changeCardScreen("screen1")}
        >
          <Image src={Back} alt="back" width={18} height={18} />
        </button>

        <div className=" flex flex-col items-center gap-2">
          <div className=" mb-4  rounded-[5px] p-4">
            <Image
              src={ReviewIcon}
              alt="review icon"
              width={99}
              height={91.67}
            />
          </div>
          <p className=" text-[28px] font-bold">Order in review</p>
          <p className=" flex flex-col text-center text-sm font-light text-[#8C8C8C] ">
            <span>This process may take up to 30 minutes.</span>{" "}
            <span>You will recieve the crypto when it’s approved</span>{" "}
          </p>
        </div>
        <div className="relative w-full max-w-sm space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="absolute top-[-10px] bg-white text-sm font-semibold">
            Your order
          </p>
          <div className="space-y-2">
            {paymentDetails.map((detail, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className=" text-xs font-light">{detail.label}</span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    detail?.label === "Recipient address"
                      ? "max-w-[120px] truncate"
                      : ""
                  }`}
                >
                  {detail.iconUrl && (
                    <Image
                      src={detail.iconUrl}
                      alt={detail.label}
                      className="h-4 w-4"
                    />
                  )}

                  <span
                    className={
                      detail.label === "Recipient address"
                        ? "truncate font-semibold text-[#4C00E9]"
                        : ""
                    }
                  >
                    {detail.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className=" text-sm font-normal text-[#8C8C8C]">
          Order ID: {trxDetails?.transactionId}
        </p>
      </div>
    </form>
  );
};

export default OrderInReview;
