import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Back from "~/assets/general/back-arrow.svg";
import Email from "~/assets/general/email-message.svg";
import Image from "next/image";
import ButtonField from "./components/ButtonField";
import InputField from "./components/InputField";
import ArrowRight from "~/assets/general/right-arrow.svg";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { sendOtpToCheckoutEmail } from "~/service/ApiRequests";
type screen = {
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
};

type FormData = {
  email: string;
};

const BuyEmail: React.FC<screen> = ({ changeScreen, trxDetails }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const reqBody = {
      ...data,
      transactionId: trxDetails.transactionId,
    };
    const [res, error] = await ApiHandler(sendOtpToCheckoutEmail, reqBody);
    setLoading(false);

    if (res?.success) {
      changeScreen("screen3");
    }

    if (error) {
      toast.error(error);
      return "";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden  rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
        {/* Back Arrow */}
        <button
          type="button"
          className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
          onClick={() => changeScreen("screen1")}
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
            <h2 className="text-[28px] font-bold">Enter email</h2>
            <p className="mt-3 px-4 text-[14px]">
              We&apos;ll send you a verification code that you&apos;ll need to
              enter on the next step
            </p>
          </div>

          {/* Email Field */}
          <div className="w-full pt-5">
            <InputField
              errors={errors}
              label="Enter email"
              placeholder=""
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              }}
            />
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

export default BuyEmail;
