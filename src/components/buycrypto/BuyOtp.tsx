import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@mui/material";
import Back from "~/assets/general/back-arrow.svg";
import Email from "~/assets/general/email-message.svg";
import ArrowRight from "~/assets/general/right-arrow.svg";
import Image, { type StaticImageData } from "next/image";
import ButtonField from "./components/ButtonField";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { verifyOtpToCheckoutEmail } from "~/service/ApiRequests";

type screen = {
  changeScreen: (screen: string) => void;
  // resendOTP: () => void;
  time: string;
  trxDetails: CheckoutTransaction;
};

export type OtpFormData = {
  otp0: string | number;
  otp1: string | number;
  otp2: string | number;
  otp3: string | number;
  otp4: string | number;
  otp5: string | number;
};

const BuyOtp: React.FC<screen> = ({
  changeScreen,
  // resendOTP,
  time,
  trxDetails,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OtpFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: OtpFormData) => {
    const enteredOtp = Object.values(data).join("");
    setLoading(true);

    const reqBody = {
      otp: enteredOtp,
      transactionId: trxDetails?.transactionId,
    };

    const [res, error] = await ApiHandler(verifyOtpToCheckoutEmail, reqBody);
    setLoading(false);

    if (res?.success) {
      changeScreen("screen4");
    }

    if (error) {
      toast.error(error);
      return "";
    }
  };

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpResent, setOtpResent] = useState(false);

  const focusNextInput = (index: number) => {
    if (inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrevInput = (index: number) => {
    if (inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendClick = () => {
    // resendOTP();
    setOtpResent(true); // Set to true when resend OTP is clicked
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
        {/* Back Arrow */}
        <button
          type="button"
          className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
          onClick={() => changeScreen("screen2")}
        >
          <Image src={Back} alt="back" width={18} height={18} />
        </button>

        <div className="flex-grow" />

        {/* Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Email Icon */}
          <div>
            <Image src={Email} alt="email" width={38} height={42} />
          </div>

          {/* Headings */}
          <div className="text-center">
            <h2 className="text-[28px] font-bold">Confirm your email</h2>
            <p className="mt-3 px-4 text-[14px]">
              Please enter the verification code sent to {trxDetails?.email}.
            </p>
          </div>

          {/* Email Field */}
          <div className="w-full pt-5">
            <div className="mt-3 flex justify-center space-x-[7px]">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Controller
                  key={index}
                  name={`otp${index}` as keyof OtpFormData}
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      pattern="\d*"
                      className={`fs-22 cl-primary h-[58px] w-[58px] rounded-md border text-center font-semibold ${
                        errors[`otp${index}` as keyof OtpFormData]
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:border-2 focus:border-[#4D01EA] focus:outline-none`}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // Allow only digits
                        if (value.length <= 1) {
                          field.onChange(value);
                          if (value) focusNextInput(index);
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Backspace" && !e.currentTarget.value) {
                          setTimeout(() => focusPrevInput(index), 0);
                        }
                      }}
                    />
                  )}
                />
              ))}
            </div>
          </div>
          <div className="fs-14 lh-21 mt-2 flex underline decoration-1 underline-offset-2">
            <button
              className="fs-14 ml-2 text-[#2257EE]"
              type="button"
              onClick={handleResendClick}
            >
              {time === "00:00"
                ? "Resend code email:"
                : otpResent
                ? "Resend code email:"
                : "Resend code email:"}
            </button>{" "}
            &nbsp; &nbsp;
            {time}s
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Continue Button at Bottom */}
        <ButtonField icon={ArrowRight} type="submit" loading={loading}>
          Continue
        </ButtonField>
      </div>
    </form>
  );
};

export default BuyOtp;
