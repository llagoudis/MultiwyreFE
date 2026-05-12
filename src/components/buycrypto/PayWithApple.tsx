import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import AppleLogo from "../../assets/buyCrypto/payment-method-logo-Apple-Pay.svg";
import QRCodeScanner from "../../assets/buyCrypto/QR-Code-scanner.svg";
import Back from "~/assets/general/back-arrow.svg";

interface PlayWithAppleProps {
  changeAppleScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction; // Replace with the actual type of trxDetails
}

const PayWithApple: React.FC<PlayWithAppleProps> = ({
  trxDetails,
  changeAppleScreen,
}) => {
  const {
    handleSubmit,
    formState: {},
  } = useForm<FormData>({
    defaultValues: {},
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      changeAppleScreen("screen2");
    }, 5000);

    return () => clearTimeout(timer);
  }, [changeAppleScreen]);

  const onSubmit = (data: FormData) => {
    console.log("Submitted Data:", data);
    changeAppleScreen("screen2");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative flex min-h-[600px] w-full max-w-[535px] flex-col items-center justify-center gap-6 overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg">
          <button
            type="button"
            className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
            onClick={() => changeAppleScreen("screen1")}
          >
            <Image src={Back} alt="back" width={18} height={18} />
          </button>
          <div className=" flex flex-col items-center gap-2">
            <div className="apple-pay-logo rounded-[5px] bg-[#F4F4F4] p-4 ">
              <Image
                src={AppleLogo}
                alt="Apple play logo"
                height={18}
                width={70}
              />
            </div>
            <p className=" text-[28px] font-bold">Pay with Apple Pay</p>
            <p className=" text-center text-sm font-normal">
              Your browser or device doesn&apos;t suport Apple Pay.Scan the QR
              code below on your IOS device{" "}
            </p>
          </div>
          <Image src={QRCodeScanner} alt="QR Code" height={150} width={148} />
          <div className=" flex flex-col items-center gap-2">
            <p className=" text-sm font-semibold">Order ID :</p>
            <p className=" text-sm font-normal">{trxDetails?.transactionId}</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PayWithApple;
