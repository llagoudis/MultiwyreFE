// BuyCreditCard.tsx
import React, { useEffect, useState } from "react";
import ArrowRight from "../../assets/general/right-arrow.svg";
import ButtonField from "./components/ButtonField";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentRequest as StripePaymentRequest,
} from "@stripe/stripe-js";
import { countryFlags } from "./helper";

type screen = {
  trxDetails: CheckoutTransaction;
  verificationResponse: VerificationResponseType;
};

const CheckoutForm: React.FC<{
  clientSecret: string;
  trxDetails: CheckoutTransaction;
}> = ({ clientSecret, trxDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] =
    useState<StripePaymentRequest | null>(null);

  useEffect(() => {
    if (!stripe) return;

    const customerName = `${trxDetails.firstName} ${trxDetails.lastName}`;
    const countrySubName = countryFlags.find(
      (item) => item.name === trxDetails.country,
    )?.subname;

    const stripeAmount =
      trxDetails?.fiatAmountAfterFees || trxDetails?.fiatAmount;

    const pr = stripe.paymentRequest({
      country: countrySubName ?? "US", // ISO 2-letter country code
      currency: trxDetails?.fiatCurrency?.toLowerCase(),
      total: {
        label: customerName || "Unknown",
        amount: Math.round(stripeAmount * 100), // in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, trxDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const countrySubName = countryFlags.find(
      (item) => item.name === trxDetails.country,
    )?.subname;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: process.env.NEXT_PUBLIC_SUCCESS_URL ?? "",
        payment_method_data: {
          billing_details: {
            name: trxDetails.firstName + " " + trxDetails?.lastName,
            address: {
              city: trxDetails.customerCity,
              line1: trxDetails.customerAddress,
              country: countrySubName ?? "US",
              postal_code: trxDetails.customerAddress,
            },
            email: trxDetails.email,
          },
        },
      },
    });

    if (error) {
      //
    }

    setLoading(false);
  };

  return (
    <form className="overflow-auto" onSubmit={handleSubmit}>
      {paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement options={{ paymentRequest }} />
        </div>
      )}
      <PaymentElement className="border p-2" />
      <ButtonField
        loading={loading}
        disabled={loading}
        type="submit"
        icon={ArrowRight}
      >
        Continue
      </ButtonField>
    </form>
  );
};

const PayPalPaymentScreen: React.FC<screen> = ({
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
    <div className="relative flex h-screen w-screen flex-col overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg sm:w-[535px] md:h-[625px]">
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: trxDetails.clientSecret }}
      >
        <CheckoutForm
          clientSecret={trxDetails.clientSecret}
          trxDetails={trxDetails}
        />
      </Elements>
    </div>
  );
};

export default PayPalPaymentScreen;
