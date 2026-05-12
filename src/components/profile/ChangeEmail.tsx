import React, { useState } from "react";
import ExchangeInput from "../common/ExchangeInput";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import InputOTP from "../common/InputOTP";
import { ApiHandler } from "~/service/UtilService";
import {
  identityVerifyGetEmailOtp,
  identityVerifyOtp,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";
import localStorageService from "~/service/LocalstorageService";
import Router from "next/router";

type props = {
  handleClose: () => void;
};

interface FormData {
  email: string;
}

const ChangeEmail = ({ handleClose }: props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const [displayEmail, setDisplayEmail] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { email } = watch();

  const submitEmail = async () => {
    setLoading(true);

    try {
      const [data, error] = await ApiHandler(identityVerifyGetEmailOtp, {
        email,
      });
      if (error) {
        toast.error(error);
      }
      if (data?.success) {
        setDisplayEmail(false);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const submitOTP = async (otp: string) => {
    setLoading(true);
    const [data, error] = await ApiHandler(identityVerifyOtp, {
      email,
      otp,
    });
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      localStorageService.clearStorage();
      void Router.replace("/auth/login");
    }
    setLoading(false);
  };

  const onSubmit = (data: FormData) => {
    if (displayEmail) {
      submitEmail();
    } else {
      const otpData = { ...data };
      otpData.email = "";
      const otp = Object.values(otpData);
      submitOTP(otp.join(""));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="mb-4 text-xl font-bold">Change Email</div>
      <div className="mt-5">
        {displayEmail ? (
          <ExchangeInput
            control={control}
            label="Email"
            name="email"
            type="text"
            rules={{
              required: "Email is required",
              validate: (value: string) => {
                const emailPattern =
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                if (!emailPattern.test(value)) {
                  return "Invalid email address";
                }
                return true; // Return true to indicate the validation passed
              },
            }}
          />
        ) : (
          <div className="">
            <div className="mb-2 text-center text-sm">
              Please enter the 6 digit verification code that was sent to
              <span className="ml-2 font-bold">{email}</span>
            </div>
            <div className="space-x-2 text-center">
              <InputOTP errors={errors} control={control} />
            </div>
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => {
            displayEmail ? handleClose() : setDisplayEmail(true);
          }}
        >
          {displayEmail ? "Cancel" : "Back"}
        </button>
        <Button
          className="ml-8 px-12 py-3"
          title="Continue"
          type="submit"
          onClick={handleSubmit(onSubmit)}
          loading={loading}
        />
      </div>
    </form>
  );
};

export default ChangeEmail;
