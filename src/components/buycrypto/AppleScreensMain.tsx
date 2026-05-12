// AppleScreensMain.tsx (Updated: Shows only Apple Pay button if available, no card form)
import React, { useEffect, useState } from "react";

import {
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentRequest as StripePaymentRequest,
} from "@stripe/stripe-js";
import { countryFlags } from "./helper"; // Assuming this is shared
import Image from "next/image";
import AppleLogo from "../../assets/buyCrypto/payment-method-logo-Apple-Pay.svg";

interface PlayWithAppleProps {
  trxDetails: CheckoutTransaction;
  verificationResponse: VerificationResponseType;
}

const AppleCheckoutForm: React.FC<{
  clientSecret: string;
  trxDetails: CheckoutTransaction;
}> = ({ clientSecret, trxDetails }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] =
    useState<StripePaymentRequest | null>(null);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stripe) return;
    setLoading(true);

    const customerName = `${trxDetails.firstName} ${trxDetails.lastName}`;
    const countrySubName = countryFlags.find(
      (item) => item.name === trxDetails.country,
    )?.subname;

    const stripeAmount =
      trxDetails?.fiatAmountAfterFees || trxDetails?.fiatAmount;

    const pr = stripe.paymentRequest({
      country: countrySubName ?? "US",
      currency: trxDetails?.fiatCurrency?.toLowerCase() || "usd",
      total: {
        label: customerName || "Unknown",
        amount: Math.round(stripeAmount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
      // Note: Apple Pay requires domain verification on your backend
    });

    // Listen to Apple Pay event
    pr.on("paymentmethod", async (event) => {
      try {
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: process.env.NEXT_PUBLIC_SUCCESS_URL ?? "",
          },
        });

        // if (error) {
        //   console.error(error.message);
        //   event.complete("fail");
        //   return;
        // }

        // Complete Apple Pay flow
        event.complete("success");

        // Finally redirect user
        window.location.href = process.env.NEXT_PUBLIC_SUCCESS_URL ?? "";
      } catch (err) {
        console.error(err);
        event.complete("fail");
      }
    });

    pr.canMakePayment().then((result) => {
      console.log("Apple Pay availability: ", result);
      if (result?.applePay) {
        setPaymentRequest(pr);
        setApplePayAvailable(true);
      }

      setLoading(false);
    });
  }, [stripe, trxDetails]);

  if (loading) return <>Loading...</>;

  if (!applePayAvailable) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Apple pay not available</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      {paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: "default", // or 'donate', 'buy'
                  theme: "dark", // or 'light'
                  height: "48px",
                },
              },
            }}
          />
        </div>
      )}
      {/* No submit button needed; button handles confirmation automatically */}
    </div>
  );
};

const AppleScreensMain: React.FC<PlayWithAppleProps> = ({
  trxDetails,
  verificationResponse,
}) => {
  const [stripePromise, setStripePriomise] = useState<any>();

  useEffect(() => {
    if (verificationResponse?.publicKey) {
      const stripePromise = loadStripe(verificationResponse?.publicKey ?? "");
      setStripePriomise(stripePromise);
    }
  }, [verificationResponse]);

  if (!trxDetails?.clientSecret) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden bg-white p-8 text-black">
      <div className="flex w-full max-w-[535px] flex-col items-center gap-2">
        <div className=" rounded-[5px] bg-[#F4F4F4] p-4">
          <Image src={AppleLogo} alt="Apple play logo" height={27} width={90} />
        </div>
        <p className="text-[28px] font-bold">Pay with Apple Pay</p>
        <p className="text-center text-sm font-normal">
          You&apos;ll be redirected to the payment window by clicking “Continue
          to payment”.
        </p>
      </div>
      <div className=" h-[8rem] w-full"></div>
      <div className=" absolute bottom-0 w-full p-8 text-center">
        <p className=" mb-4 text-sm font-normal">
          {`By paying, You accept example.com `}{" "}
          <span className=" text-sm font-semibold text-[#4D00EC]">
            Terms of use
          </span>
        </p>
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: trxDetails.clientSecret }}
        >
          <AppleCheckoutForm
            clientSecret={trxDetails.clientSecret}
            trxDetails={trxDetails}
          />
        </Elements>
      </div>
    </div>
  );
};

export default AppleScreensMain;
