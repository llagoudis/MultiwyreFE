import Button from "../../common/Button";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";

import InputOTP from "../../common/InputOTP";
import { useEffect } from "react";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  onOtpSubmit: (otp: string, hitAPI?: boolean) => void;
  disableResendButton: boolean;
  resendOTP: () => void;
  time: string;
  otp: string;
  email: string;
  loading: boolean;
}

const EnterOTP: React.FC<VerifyEmailProps> = ({
  close,
  handleChangeScreen,
  disableResendButton,
  time,
  resendOTP,
  onOtpSubmit,
  otp,
  email,
  loading,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const onSubmit = (data: any) => {
    onOtpSubmit(Object.values(data).join(""));
  };

  useEffect(() => {
    const otpObj: any = {};
    otp
      .split("")
      .map((val: string, index: number) => (otpObj[`otp${index}`] = val || ""));

    reset(otpObj);
  }, [otp]);

  return (
    <div>
      <div className="mt-6 flex items-center">
        <div className="text-xl font-bold">Company Profile creation</div>

        <button className="ml-auto" onClick={close}>
          <AiOutlineClose />
        </button>
      </div>

      <div className="mt-6">
        Please enter the 6 digit verification code that was sent to{" "}
        <span className="font-bold">{email}</span>. The code is{" "}
        <span className="font-semibold">valid for 30 minutes</span>
      </div>

      <form>
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
              onClick={() => {
                const otpObj: any = {};
                Array(6)
                  .fill(0)
                  .map((_, index: number) => (otpObj[`otp${index}`] = ""));
                reset(otpObj);
                resendOTP();
              }}
            >
              Resend
            </button>
            <span className="ml-auto mr-2 text-yellow-600">{time}</span>
          </div>
        </div>
      </form>

      <div className="mt-40 flex">
        <button
          className="font-semibold"
          onClick={() => {
            onOtpSubmit(Object.values(watch()).join(""), false);
            handleChangeScreen("verifyEmailScreen");
          }}
        >
          Back
        </button>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="ml-auto px-10 py-3"
          title="Continue"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default EnterOTP;
