import Button from "../../common/Button";
import { useForm } from "react-hook-form";
import Image, { type StaticImageData } from "next/image";
import CloseBtn from "~/assets/general/close.svg";

import InputOTP from "../../common/InputOTP";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  onOtpSubmit: (otp: string) => void;
  disableResendButton: boolean;
  resendOTP: () => void;
  time: string;
  loading: boolean;
}

const EnterOTP: React.FC<VerifyEmailProps> = ({
  close,
  handleChangeScreen,
  disableResendButton,
  time,
  resendOTP,
  onOtpSubmit,
  loading,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    onOtpSubmit(Object.values(data).join(""));
  };

  return (
    <div>
      <div className="mt-6 flex items-center">
        <div className="text-2xl font-bold">Verify your identity</div>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>

      <div className="mt-6 font-semibold">
        Please enter the code sent to your email ID
      </div>

      <div className="mb-2 mt-2 text-xs">OTP is valid for 10 minutes</div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10">
          <InputOTP control={control} errors={errors} />

          <div className="mt-2 flex px-2 text-sm">
            <button
              disabled={disableResendButton}
              className={
                disableResendButton
                  ? "text-gray-400"
                  : "text-yellow-600 hover:text-yellow-500"
              }
              type="button"
              onClick={resendOTP}
            >
              Resend
            </button>
            <span className="ml-auto mr-2 text-yellow-600">{time}</span>
          </div>
        </div>
        <div className="mt-40 flex">
          <button
            type="button"
            className="font-semibold"
            onClick={() => handleChangeScreen("verifyEmailScreen")}
          >
            Back
          </button>
          <Button
            type="submit"
            className="ml-auto px-10 py-3"
            title="Continue"
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default EnterOTP;
