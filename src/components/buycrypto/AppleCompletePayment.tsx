import React from "react";
import Image from "next/image";
import AppleLogoWhite from "../../assets/buyCrypto/apple-pay-white.svg";
import AppleLogo from "../../assets/buyCrypto/payment-method-logo-Apple-Pay.svg";
import Back from "~/assets/general/back-arrow.svg";
import { Button } from "@mui/material";

interface PlayWithAppleProps {
  changeAppleScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
}

const AppleCompletePayment: React.FC<PlayWithAppleProps> = ({
  changeAppleScreen,
  trxDetails,
}) => {
  const handleCLick = () => {
    console.log("Payment button clicked");
    changeAppleScreen("screen3");
  };

  return (
    <div>
      <div className="relative flex min-h-[600px] w-full min-w-[535px] flex-col items-center justify-center gap-6 overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg">
        <button
          type="button"
          className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
          onClick={() => changeAppleScreen("screen2")}
        >
          <Image src={Back} alt="back" width={18} height={18} />
        </button>
        <div className="flex flex-col items-center gap-8">
          <div className=" flex flex-col items-center gap-2">
            <div className="apple-pay-logo rounded-[5px] bg-[#F4F4F4] p-4 ">
              <Image
                src={AppleLogo}
                alt="Apple play logo"
                height={18}
                width={70}
              />
            </div>
            <p className=" text-[28px] font-bold">
              {trxDetails?.fiatAmountAfterFees} {trxDetails.fiatCurrency}
            </p>
            <p className=" text-center text-sm font-normal">
              Click on Apple pay button below to complete your payment.
            </p>
          </div>
          <div className=" flex flex-col items-center gap-2">
            <p className=" text-sm font-semibold">Order ID :</p>
            <p className=" text-sm font-normal">{trxDetails?.transactionId}</p>
          </div>

          <div className="pseudo h-[8rem] w-full"></div>

          <div className=" absolute bottom-0 w-full p-8">
            <Button
              type="submit"
              variant="contained"
              onClick={handleCLick}
              sx={{
                backgroundColor: "#000000",
                textTransform: "none",
                minWidth: "100% !important",
                fontWeight: "500",
                borderRadius: "10px",
                height: "45px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#111111",
                },
                position: "relative",
              }}
            >
              <Image
                src={AppleLogoWhite}
                width={60}
                height={28}
                alt="Apple logo"
              />
            </Button>
            <p className=" mt-4 text-center text-xs font-normal text-[#8C8C8C]">
              This window will automatically close after successfull payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleCompletePayment;
