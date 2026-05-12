import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import Back from "~/assets/general/back-arrow.svg";
import Message from "~/assets/general/message.svg";
import flagOfAc from "~/assets/currency/flagof-ac.svg";
import usdcIcon from "~/assets/currency/USDC.svg";
import ArrowRight from "~/assets/general/right-arrow.svg";
import Image, { type StaticImageData } from "next/image";
import ButtonField from "./components/ButtonField";
import { currencyFlags, currencyFlagsOne } from "./helper";

type screen = {
  changeScreen: (screen: string) => void;
  trxDetails: CheckoutTransaction;
  updateTrxById: (data: CheckoutTransaction) => void;
};

const BuySummary: React.FC<screen> = ({
  changeScreen,
  trxDetails,
  updateTrxById,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutTransaction>({});

  const onSubmit = (data: CheckoutTransaction) => {
    const reqBody = {
      ...data,
      screen: "screen7",
      stripe: true,
    };
    void updateTrxById(reqBody);
  };

  const receiverIcon = currencyFlags.find(
    (i) => i.feeCurrencyName === trxDetails?.receiverCurrency,
  )?.flag;
  const fiatIcon = currencyFlagsOne.find(
    (i) => i.subname === trxDetails?.fiatCurrency,
  )?.flag;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden  rounded-lg bg-white p-6 text-black shadow-lg md:h-[625px] md:w-[535px]">
        {/* Back Arrow */}
        <div>
          <button
            type="button"
            className="rounded-full bg-[#f4f4f4] p-2 "
            onClick={() => changeScreen("screen5")}
          >
            <Image src={Back} alt="back" width={18} height={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col ">
          {/* Headings */}
          <div className="pt-4">
            <h2 className="text-[25px] font-bold">Summary</h2>
          </div>
        </div>
        <div className="pt-6">
          <Controller
            name="receiverAddress"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={trxDetails?.receiverAddress ?? null}
                disabled
                label="Address"
                placeholder=""
                fullWidth
                size="small"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: "bold",
                    color: "#000",
                  },
                }}
                // error={!!errors.address}
                // helperText={errors.address?.message}
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    fontFamily: "Manrope, sans-serif",
                    "& fieldset": {
                      borderColor: "#E5E7EB",
                      border: "1px solid #E5E7EB",
                    },
                    "&:hover fieldset": {
                      borderColor: "#E5E7EB",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#E5E7EB",
                    },
                  },
                  "& label.Mui-focused": {
                    fontWeight: "bold",
                    color: "#000",
                  },
                  "& label": {
                    color: "#000",
                  },
                }}
              />
            )}
          />
        </div>

        {/* Content */}
        <div className="relative mt-3 flex flex-col">
          {/* Heading */}
          <h2 className="absolute left-3 top-1 bg-white p-1 pr-[150px] text-[13px] font-bold">
            Your order
          </h2>

          {/* Order Summary Box */}
          <div className="mt-4 rounded-md border border-gray-200 p-4">
            {/* Pay Row */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text text-[12px] text-[#000]">Pay</span>
              <span className="flex items-center gap-2 text-[12px] font-medium text-black">
                <Image
                  className="rounded-full"
                  src={fiatIcon ?? ""}
                  alt="back"
                  width={18}
                  height={18}
                />
                {trxDetails?.fiatAmountAfterFees} {trxDetails?.fiatCurrency}
              </span>
            </div>

            {/* Receive Row */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] text-[#000]">Receive</span>
              <span className="flex items-center gap-2 text-[12px] font-medium text-black">
                <Image
                  src={receiverIcon ?? ""}
                  className="rounded-full"
                  alt="back"
                  width={18}
                  height={18}
                />
                {trxDetails?.receiverAmount.toFixed(8)}{" "}
                {trxDetails?.receiverCurrency}
              </span>
            </div>

            {/* Unit Price */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] text-[#000]">Unit price</span>
              <span className="text-[12px] font-medium text-black">
                {trxDetails?.price} {trxDetails?.fiatCurrency}
              </span>
            </div>

            {/* Processing fee */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] text-[#000]">Processing fee</span>
              <span className="text-[12px] font-medium text-black">
                {trxDetails?.processingFee ?? 0} {trxDetails?.fiatCurrency}
              </span>
            </div>

            {/* Networking fee */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#000]">Networking fee</span>
              <span className="text-[12px] font-medium text-black">
                {trxDetails?.networkFee ?? 0} {trxDetails?.fiatCurrency}
              </span>
            </div>
          </div>

          {/* Warning Alert Box */}
          <div className="mt-5    rounded-lg border border-red-100 bg-[#F6E6E4] p-4">
            <div className="flex items-start gap-2 rounded-md ">
              <Image src={Message} alt="back" width={18} height={18} />
              <span className="block pb-2 text-[13px] font-bold leading-5 text-[#AA2E26]">
                Sending cryptocurrency to someone else?
              </span>
            </div>
            <p className="text-[13px] leading-5 text-[#AA2E26]">
              Make sure you aren&apos;t sending crypto to any investment scam
              instructed by a third party. There is a big risk of fraud.
              example.com is not affiliated with any third parties and will
              never directly contact you.
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Continue Button at Bottom */}

        <ButtonField type="submit">
          Pay {trxDetails.fiatAmountAfterFees} {trxDetails?.fiatCurrency}
        </ButtonField>
      </div>
    </form>
  );
};

export default BuySummary;
