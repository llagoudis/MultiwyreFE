"use client";

import React, { use, useEffect, useState } from "react";
import BuyForm from "~/components/buycrypto/BuyForm";
import "@fontsource/manrope/400.css"; // Regular
import "@fontsource/manrope/600.css"; // Semi-bold (optional)
import "@fontsource/manrope/700.css"; // Bold (optional)
import BuyEmail from "~/components/buycrypto/BuyEmail";
import BuyOtp from "~/components/buycrypto/BuyOtp";
import BuyInformation from "~/components/buycrypto/BuyInformation";
import BuyWalletAddress from "~/components/buycrypto/BuyWalletAddress";
import BuySummary from "~/components/buycrypto/BuySummary";
import AppleScreensMain from "~/components/buycrypto/AppleScreensMain";
import GoogleScreensMain from "~/components/buycrypto/GoogleScreensMain";
import CardMainScreen from "~/components/buycrypto/CardMainScreen";
import VerifyKeys from "~/components/buycrypto/VerifyKeys";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import {
  fetchCheckoutTrxById,
  updateCheckoutTrxById,
} from "~/service/ApiRequests";
import PayPalPaymentScreen from "~/components/buycrypto/PayPalPaymentScreen";
import BuyCreditCard from "~/components/buycrypto/BuyCreditCard";
import IvyPaymentScreen from "~/components/buycrypto/IvyPaymentScreen";

type PaymentType = string;

interface Screens {
  screen0: boolean;
  screen1: boolean;
  screen2: boolean;
  screen3: boolean;
  screen4: boolean;
  screen5: boolean;
  screen6: boolean;
  screen7: boolean;
  success: boolean;
  applePayFlow: boolean;
  googlePayFlow: boolean;
}

const BuyCrypto = () => {
  const screenInitialValues = {
    screen0: false,
    screen1: false,
    screen2: false,
    screen3: false,
    screen4: false,
    screen5: false,
    screen6: false,
    screen7: false,
    success: false,
    applePayFlow: false,
    googlePayFlow: false,
  };

  const [displayScreen, setDisplayScreen] =
    useState<Screens>(screenInitialValues);

  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);

  const {
    screen0,
    screen1,
    screen2,
    screen3,
    screen4,
    screen5,
    screen6,
    screen7,
    success,
  } = displayScreen;

  useEffect(() => {
    changeScreen("screen0");
    // executeTimer(20);
  }, []);

  const changeScreen = (name: string) => {
    setDisplayScreen({ ...screenInitialValues, [name]: true });
  };

  const [verificationResponse, setVerficationResponse] =
    useState<VerificationResponseType>({
      transactionId: "",
      availablePayments: [],
      publicKey: "",
    });

  const [trxDetails, setTrxDetails] = useState<any>(null);

  const { transactionId } = verificationResponse;

  const [time, setTime] = useState<string>("20");
  // const executeTimer = (seconds: number) => {
  //   const intervalId = setInterval(() => {
  //     if (seconds <= 0) {
  //       clearInterval(intervalId);
  //     } else {
  //       seconds--;
  //       const remainingSeconds = String(seconds % 60).padStart(2, "0");
  //       const formattedTime = `${remainingSeconds}`;
  //       setTime(formattedTime);
  //     }
  //   }, 1000);
  // };

  // const handleResendOTP = () => {
  //   executeTimer(30);
  // };

  const handlePaymentTypeSelection = (type: PaymentType) => {
    setPaymentType(type);
    if (type === "Apple Pay") {
      changeScreen("applePayFlow");
    } else if (type === "Google Pay") {
      changeScreen("googlePayFlow");
    } else {
      changeScreen("screen7");
    }
  };

  async function trxById(trxId: string | null) {
    const [res, error] = await ApiHandler(fetchCheckoutTrxById, { trxId });

    if (res?.success) {
      setTrxDetails(res);
    }

    if (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    if (transactionId) {
      void trxById(transactionId);
    }
  }, [displayScreen]);

  const [loading, setLoading] = useState(false);

  const updateTrxById = async (data: CheckoutTransaction) => {
    const { screen, ...rest } = data;
    rest.transactionId = transactionId ?? "";

    setLoading(true);
    const [res, error] = await ApiHandler(updateCheckoutTrxById, rest);
    setLoading(false);

    if (res?.success) {
      void trxById(transactionId);
    }

    if (error) {
      toast.error(error);
      return "";
    }

    changeScreen(screen);
  };

  return (
    <div className="bg-black">
      <div
        className="flex h-screen w-full items-center justify-between bg-black text-white md:pl-20 md:pr-[15rem]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {/* Left */}
        <div className="hidden max-w-[435px] md:block">
          <h1 className="text-[70px] font-light leading-[90px]">
            Buy crypto <br />
            with <span className="font-semibold">Ease</span>
          </h1>
        </div>
        {screen0 && (
          <VerifyKeys
            changeScreen={changeScreen}
            setVerficationResponse={setVerficationResponse}
          />
        )}

        {screen1 && (
          <BuyForm
            isUpdating={loading}
            updateTrxById={updateTrxById}
            changeScreen={changeScreen}
            setPaymentType={handlePaymentTypeSelection}
            trxDetails={trxDetails?.body}
            verificationResponse={verificationResponse}
          />
        )}

        {screen2 && (
          <BuyEmail trxDetails={trxDetails?.body} changeScreen={changeScreen} />
        )}
        {screen3 && (
          <BuyOtp
            trxDetails={trxDetails?.body}
            changeScreen={changeScreen}
            // resendOTP={handleResendOTP}
            time={time}
          />
        )}
        {screen4 && (
          <BuyInformation
            isUpdating={loading}
            trxDetails={trxDetails?.body}
            updateTrxById={updateTrxById}
            changeScreen={changeScreen}
          />
        )}
        {screen5 && (
          <BuyWalletAddress
            isUpdating={loading}
            trxDetails={trxDetails?.body}
            changeScreen={changeScreen}
            updateTrxById={updateTrxById}
          />
        )}
        {screen6 && (
          <BuySummary
            trxDetails={trxDetails?.body}
            changeScreen={changeScreen}
            updateTrxById={updateTrxById}
          />
        )}

        {/* On screen7, decide the flow based on paymentType */}
        {screen7 && trxDetails?.body?.paymentMethod === "Card" && (
          <BuyCreditCard
            verificationResponse={verificationResponse}
            trxDetails={trxDetails?.body}
          />
        )}

        {screen7 && trxDetails?.body?.paymentMethod === "Apple Pay" && (
          <AppleScreensMain
            verificationResponse={verificationResponse}
            trxDetails={trxDetails?.body}
          />
        )}

        {screen7 && trxDetails?.body?.paymentMethod === "Google Pay" && (
          <GoogleScreensMain
            verificationResponse={verificationResponse}
            trxDetails={trxDetails?.body}
          />
        )}

        {screen7 && trxDetails?.body?.paymentMethod === "PayPal" && (
          <PayPalPaymentScreen
            verificationResponse={verificationResponse}
            trxDetails={trxDetails?.body}
          />
        )}

        {screen7 && trxDetails?.body?.paymentMethod === "Bank Transfer" && (
          <IvyPaymentScreen trxDetails={trxDetails?.body} />
        )}

        {/* Right */}
      </div>
    </div>
  );
};

export default BuyCrypto;
