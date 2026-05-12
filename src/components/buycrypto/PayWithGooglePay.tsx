import React from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import GoogleLogo from "../../assets/buyCrypto/payment-method-logo-for-Google-Pay.svg";
import ArrowRight from "~/assets/general/right-arrow.svg";
import Back from "~/assets/general/back-arrow.svg";
import { Button } from "@mui/material";

interface PlayWithAppleProps {
  changeGoogleScreen: (screen: string) => void;
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
}

const PayWithGooglePay: React.FC<PlayWithAppleProps> = ({
  changeGoogleScreen,
  changeScreen,
}) => {
  const {
    handleSubmit,
    formState: {},
  } = useForm<FormData>({
    defaultValues: {},
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitted Data:", data);
    changeGoogleScreen("screen2");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative flex min-h-[600px] w-full max-w-[535px] flex-col items-center justify-center gap-6 overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg ">
          <button
            type="button"
            className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
            onClick={() => changeScreen("screen1")}
          >
            <Image src={Back} alt="back" width={18} height={18} />
          </button>
          <div className=" flex flex-col items-center gap-2">
            <div className="Google-pay-logo rounded-[5px] bg-[#F4F4F4] p-4 ">
              <Image
                src={GoogleLogo}
                alt="Google play logo"
                height={27}
                width={90}
              />
            </div>
            <p className=" text-[28px] font-bold">Pay with Google Pay</p>
            <p className=" text-center text-sm font-normal">
              You&apos;ll be redirected to the payment window by clicking
              “Continue to payment”.
            </p>
          </div>
          <div className="pseudo h-[8rem] w-full"></div>
          <div className=" absolute bottom-0 w-full p-8 text-center">
            <p className=" mb-4 text-sm font-normal">
              {`By paying, You accept example.com `}{" "}
              <span className=" text-sm font-semibold text-[#4D00EC]">
                Terms of use
              </span>
            </p>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#4D00EC",
                textTransform: "none",
                minWidth: "100% !important",
                fontWeight: "500",
                borderRadius: "10px",
                height: "45px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#5e14f9",
                },
                position: "relative",
              }}
            >
              <span>Continue</span>
              <Image
                className=" absolute right-4"
                src={ArrowRight}
                alt="arrow"
                width={21}
                height={15}
              />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PayWithGooglePay;
