import Image, { type StaticImageData } from "next/image";
import Sheld from "~/assets/general/sheld.svg";
import { type FC } from "react";
import MuiButton from "~/components/MuiButton";
import { useForm } from "react-hook-form";
import { verify2FAOTP } from "~/service/api/auth";
import toast from "react-hot-toast";

interface TwoFAProps {
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

const TwoFA: FC<TwoFAProps> = ({ onClose, onSubmit }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const verifyOTP = async ({ otp }: { otp: string }) => {
    const [res, err] = await verify2FAOTP(otp);

    if (err) {
      return toast.error(err || "Failed to validate OTP");
    }
    if (res?.success) {
      await onSubmit();
    }
  };

  return (
    <div>
      <div className="flex justify-between border-b-2 border-[#DFDDDD] pb-4">
        <p className=" text-sm font-bold sm:text-base lg:text-lg">
          Authorise action with 2FA
        </p>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#DFDDDD] py-4 md:flex-row">
        <Image src={Sheld as StaticImageData} alt="Sheld" />
        <div>
          <p className=" text-lg font-semibold">
            Enter your
            <span className=" font-bold text-[#C1922E]">2FA code</span>
            authorize this action.
          </p>
          <input
            {...register("otp", {
              required: "Please enter OTP",
              minLength: 6,
              maxLength: 6,
            })}
            className="mt-2 w-full rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4] placeholder:text-sm placeholder:font-normal "
            type="text"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-6 ">
        <button className=" cursor-pointer text-sm font-bold" onClick={onClose}>
          Cancel
        </button>
        <MuiButton
          name={"Continue"}
          onClick={handleSubmit(verifyOTP)}
          useLoading
        />
      </div>
    </div>
  );
};

export default TwoFA;
