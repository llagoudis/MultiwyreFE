import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiHandler } from "~/service/UtilService";
import { verifyMerchantKeys } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import ButtonField from "./components/ButtonField";
import InputField from "./components/InputField";

type screen = {
  changeScreen: (screen: string) => void;
  setVerficationResponse: (item: VerificationResponseType) => void;
};

type FormData = {
  privateKey: string;
  publicKey: string;
};

const VerifyKeys: React.FC<screen> = ({
  changeScreen,
  setVerficationResponse,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { privateKey: "", publicKey: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const reqBody = {
      ...data,
      url: window.location.href,
    };

    const [res, error] = await ApiHandler<VerificationResponseType>(
      verifyMerchantKeys,
      reqBody,
    );
    if (error) {
      toast.error(error);
    }

    if (res?.success) {
      if (res?.message) toast.success(res?.message);

      setVerficationResponse(res?.body);
      changeScreen("screen1");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden  rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
        <div className="flex-grow" />

        <div className="text-center">
          <h2 className="text-[28px] font-bold">Verify</h2>
        </div>

        {/* Private Key Field */}
        <div className="w-full pt-5">
          <InputField
            name="privateKey"
            control={control}
            label="Enter private key"
            placeholder="Private key"
            errors={errors}
            rules={{
              required: "Private key is required",
            }}
          />
        </div>

        {/* Public Key Field */}
        <div className="w-full pt-5">
          <InputField
            name="publicKey"
            control={control}
            label="Enter public key"
            placeholder="Public key"
            errors={errors}
            rules={{
              required: "Public key is required",
            }}
          />
        </div>
        {/* Spacer */}
        <div className="flex-grow" />

        {/* Continue Button at Bottom */}
        <ButtonField type="submit" loading={loading}>
          Continue
        </ButtonField>
      </div>
    </form>
  );
};

export default VerifyKeys;
