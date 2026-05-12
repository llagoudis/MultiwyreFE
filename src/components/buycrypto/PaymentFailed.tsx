import React from "react";
import Image from "next/image";
import FailedIcon from "~/assets/general/close.png"; // Replace with your actual icon
import ButtonField from "./components/ButtonField";

const PaymentFailed = () => {
  console.log({ PaymentSuccess: "Rendered" });
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

        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
          {/* Success Icon */}
          <div>
            <Image src={FailedIcon} alt="Success" width={56} height={56} />
          </div>

          {/* Headline */}
          <div className="text-center">
            <h2 className="text-[28px] font-bold">Payment Failed</h2>
            <p className="mt-3 px-4 text-[14px]">
              Your payment has Failed.Please try Again!!
            </p>
          </div>

          {/* Done Button */}
          <div className="w-full pt-6">
            <ButtonField type="button">Done</ButtonField>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
