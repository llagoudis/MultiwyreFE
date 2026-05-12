"use client";

import React, { useEffect, useState } from "react";
import ArrowRight from "../../assets/general/right-arrow.svg";
import ButtonField from "./components/ButtonField";
import { ApiHandler } from "~/service/UtilService";
import { createIvySession } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { IvyCheckout } from "@getivy/react-sdk";

type ScreenProps = {
  trxDetails: CheckoutTransaction;
};

const IvyPaymentScreen: React.FC<ScreenProps> = ({ trxDetails }) => {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handlePayByBank = async () => {
    if (!trxDetails?.transactionId) {
      toast.error("Transaction ID not found");
      return;
    }

    setLoading(true);

    const payload = {
      transactionId: trxDetails.transactionId,
      fiatAmount: trxDetails.fiatAmountAfterFees || trxDetails.fiatAmount,
      fiatCurrency: trxDetails.fiatCurrency,
      customerEmail: trxDetails.email,
      themeVariant: "light",
    };

    const [res, error] = await ApiHandler<IvyTransaction>(
      createIvySession,
      payload,
    );

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (res?.success && res?.body.ivyPaymentLink) {
      setCheckoutUrl(res.body.ivyPaymentLink);
      toast.success("Loading secure bank payment…");
    } else {
      toast.error("Failed to create payment session");
    }
  };

  // If checkoutUrl exists → render Ivy SDK
  if (checkoutUrl) {
    return (
      <div className="relative flex h-screen w-screen flex-col overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg sm:w-[535px] md:h-[625px]">
        <IvyCheckout
            checkoutUrl={checkoutUrl}
            displayOptions={{ type: "embedded", maxHeight: 625, maxWidth: 535 }} // can also be "modal"
            onSuccess={() => {
              window.location.href = "/buy/success";
            }}
            onCancel={() => {
              window.location.href = "/buy/failed";
            }}
          />
      </div>
    );
  }

  // ===== Your original UI below =====
  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg sm:w-[535px] md:h-[625px]">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-semibold">Payment Summary</h2>
        <p className="text-sm text-gray-600">
          Review your transaction details before proceeding
        </p>
      </div>

      <div className="mb-6 flex-1 space-y-4 overflow-auto">
        {/* Amount Details */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-lg font-semibold">
              {formatCurrency(
                trxDetails.fiatAmount,
                trxDetails.fiatCurrency || "USD",
              )}
            </span>
          </div>

          {trxDetails.fiatAmountAfterFees &&
            trxDetails.fiatAmountAfterFees !== trxDetails.fiatAmount && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fees</span>
                  <span className="text-sm">
                    {formatCurrency(
                      trxDetails.fiatAmount - trxDetails.fiatAmountAfterFees,
                      trxDetails.fiatCurrency || "USD",
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(
                        trxDetails.fiatAmountAfterFees,
                        trxDetails.fiatCurrency || "USD",
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* Crypto Details */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            You will receive
          </h3>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Cryptocurrency</span>
            <span className="font-medium">{trxDetails.receiverCurrency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-medium">
              {trxDetails.receiverAmount} {trxDetails.receiverCurrency}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Customer Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="text-sm">
                {trxDetails.firstName} {trxDetails.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm">{trxDetails.email}</span>
            </div>
            {trxDetails.receiverAddress && (
              <div className="flex flex-col">
                <span className="mb-1 text-sm text-gray-600">
                  Wallet Address
                </span>
                <span className="break-all font-mono text-xs">
                  {trxDetails.receiverAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium text-blue-900">
                Secure Bank Payment
              </h4>
              <p className="text-xs text-blue-700">
                You&apos;ll be redirected to a secure payment page inside this
                window.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <ButtonField
          loading={loading}
          disabled={loading}
          onClick={handlePayByBank}
          icon={ArrowRight}
        >
          {loading ? "Creating Session..." : "Pay by Bank"}
        </ButtonField>
      </div>
    </div>
  );
};

export default IvyPaymentScreen;
