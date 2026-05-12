import React from "react";
import AppleLogoWhite from "../../assets/buyCrypto/apple-pay-white.svg";
import AppleLogo from "../../assets/buyCrypto/payment-method-logo-Apple-Pay.svg";
import Image from "next/image";
import { Button } from "@mui/material";

const CompleteYourPayment = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className=" flex flex-col items-center gap-2">
        <div className="apple-pay-logo rounded-[5px] bg-[#F4F4F4] p-4 ">
          <Image src={AppleLogo} alt="Apple play logo" height={18} width={70} />
        </div>
        <p className=" text-[28px] font-bold">10 EUR</p>
        <p className=" text-center text-sm font-normal">
          Click on Apple pay button below to complete your payment.
        </p>
      </div>
      <div className=" flex flex-col items-center gap-2">
        <p className=" text-sm font-semibold">Order ID :</p>
        <p className=" text-sm font-normal">
          7Csdknka-asdkad-adsasdasd-asdasdasd
        </p>
      </div>

      <div className="pseudo h-[8rem] w-full"></div>

      <div className=" absolute bottom-0 w-full p-8">
        <Button
          type="submit"
          variant="contained"
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
          <Image src={AppleLogoWhite} width={60} height={28} alt="Apple logo" />
        </Button>
        <p className=" mt-4 text-center text-xs font-normal text-[#8C8C8C]">
          This window will automatically close after successfull payment
        </p>
      </div>
    </div>
  );
};

export default CompleteYourPayment;
