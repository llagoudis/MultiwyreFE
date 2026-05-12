import React, { useState } from "react";
import ExchangeInput from "../common/ExchangeInput";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import InputOTP from "../common/InputOTP";
import { ApiHandler } from "~/service/UtilService";
import {
  identityVerifyGetPhoneOtp,
  identityVerifyPhoneOtp,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";
import localStorageService from "~/service/LocalstorageService";
import Router from "next/router";

type props = {
  handleClose: () => void;
};

interface FormData {
  phone: string;
}

const ChangeMobile = ({ handleClose }: props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const [displayMobile, setDisplayMobile] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { phone } = watch();

  const submitMobile = async () => {
    setLoading(true);
    const [data, error] = await ApiHandler(identityVerifyGetPhoneOtp, {
      phone,
    });
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      setDisplayMobile(false);
    }
    setLoading(false);
  };

  const submitOTP = async (otp: string) => {
    setLoading(true);
    const [data, error] = await ApiHandler(identityVerifyPhoneOtp, {
      phone,
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
    if (displayMobile) {
      submitMobile();
    } else {
      const otpData = { ...data };
      otpData.phone = "";
      const otp = Object.values(otpData);
      submitOTP(otp.join(""));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="mb-4 text-xl font-bold">Change Number</div>
      <div className="mt-5">
        {displayMobile ? (
          <ExchangeInput
            control={control}
            label="Phone number"
            name="phone"
            type="text"
            rules={{
              required: "Phone number is required",
              validate: (value: string) => {
                if (!/^[0-9]*$/.test(value)) {
                  return "Mobile number should contain only numbers";
                }
                if (value.length !== 10) {
                  return "Mobile number should contain exactly 10 digits";
                }
                return true;
              },
            }}
          />
        ) : (
          <div className="">
            <div className="mb-2 text-center text-sm">
              Please enter the 6 digit verification code that was sent to
              <span className="ml-2 font-bold">{phone}</span>
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
            displayMobile ? handleClose() : setDisplayMobile(true);
          }}
        >
          {displayMobile ? "Cancel" : "Back"}
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

export default ChangeMobile;
