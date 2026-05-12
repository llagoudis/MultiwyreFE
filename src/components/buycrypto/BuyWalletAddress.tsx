import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Back from "~/assets/general/back-arrow.svg";
import USDC from "~/assets/currency/USDC.svg";
import ArrowRight from "~/assets/general/right-arrow.svg";
import Image from "next/image";
import InputField from "./components/InputField";
import ButtonField from "./components/ButtonField";
import { currencyFlags } from "./helper";

type screen = {
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
  updateTrxById: (data: CheckoutTransaction) => void;
  isUpdating: boolean;
};

const BuyWalletAddress: React.FC<screen> = ({
  updateTrxById,
  changeScreen,
  trxDetails,
  isUpdating,
}) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutTransaction>({
    defaultValues: { receiverAddress: "" },
  });

  const onSubmit = (data: CheckoutTransaction) => {
    const reqBody = {
      ...data,
      screen: "screen6",
    };

    void updateTrxById(reqBody);
  };

  const assetId = trxDetails?.receiverCurrency;
  const receiverIcon = currencyFlags.find(
    (i) => i.feeCurrencyName === assetId,
  )?.flag;

  const isDedicatedAddress =
    trxDetails?.Checkoutmerchant?.payoutType === "dedicated" &&
    trxDetails?.Checkoutmerchant?.walletAddress;

  useEffect(() => {
    if (isDedicatedAddress) {
      setValue("receiverAddress", trxDetails?.Checkoutmerchant?.walletAddress);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden rounded-lg bg-white p-8 text-black shadow-lg md:h-[625px] md:w-[535px]">
        {/* Back Arrow */}
        <button
          type="button"
          className="absolute left-4 top-4 rounded-full bg-[#f4f4f4] p-2"
          onClick={() => changeScreen("screen4")}
        >
          <Image src={Back} alt="back" width={18} height={18} />
        </button>

        <div className="flex-grow" />

        {/* Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Email Icon */}
          <div className="rounded-xl bg-[#f4f4f4] p-3">
            <Image
              src={receiverIcon ?? ""}
              alt="email"
              width={45}
              height={45}
            />
          </div>

          {/* Headings */}
          <div className="text-center">
            <h2 className="text-[25px] font-bold">Enter {assetId} address</h2>
            <p className="mt-3 px-2 text-[14px]">
              Use a wallet that supports {assetId}. Make sure the address is
              correct to avoid losing your {assetId}
            </p>
          </div>

          {/* Email Field */}
          <div className="w-full pt-5">
            <InputField
              errors={errors}
              name="receiverAddress"
              control={control}
              disabled={!!isDedicatedAddress}
              rules={{
                required: "Address is required",
              }}
              label={`Your ${assetId} address`}
              placeholder=""
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Continue Button at Bottom */}
        <ButtonField
          loading={isUpdating}
          disabled={isUpdating}
          icon={ArrowRight}
          type="submit"
        >
          Continue
        </ButtonField>
      </div>
    </form>
  );
};

export default BuyWalletAddress;
