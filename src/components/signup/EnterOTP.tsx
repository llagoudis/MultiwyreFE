import React, { useRef } from "react";
import { useForm, Controller } from "react-hook-form";

interface OtpInputProps {
  onOtpSubmit: (otp: string) => void;
  changeScreen: (screen: string) => void;
  phone: string;
  disableResendButton: boolean;
  resendOTP: () => void;
  time: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  phone,
  onOtpSubmit,
  changeScreen,
  disableResendButton,
  resendOTP,
  time,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const onSubmit = (data: any) => {
    const enteredOtp = Object.values(data).join("");
    onOtpSubmit(enteredOtp);
  };

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

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded bg-white p-8 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 text-3xl font-bold">Signup</div>
          <div className="mb-4 text-lg font-semibold">
            Verify your phone number
          </div>
          <div className="text-xs font-bold text-gray-400">
            Please enter a 6-digit number sent to {phone}
          </div>

          <div className="mb-2 mt-2 text-xs">OTP is valid for 10 minutes</div>
          <div className="mt-10 space-x-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Controller
                key={index}
                name={`otp${index}`}
                control={control}
                defaultValue=""
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    maxLength={1}
                    className={`h-16 w-16 rounded-md border text-center ${
                      errors["otp" + index]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === "Backspace") {
                        e.target.value === "" &&
                          setTimeout(() => focusPrevInput(index), 0);
                      } else if (/^\d$/.test(e.key)) {
                        setTimeout(() => focusNextInput(index), 0);
                      }
                    }}
                  />
                )}
              />
            ))}
          </div>
          {errors.otp0 && (
            <div className="text-sm text-red-500">OTP is required</div>
          )}
          <div className="mt-10 flex">
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
            <span className="ml-auto text-yellow-600">{time}</span>
          </div>
          <div className="mt-20 flex">
            <button type="button" onClick={() => changeScreen("formScreen")}>
              Cancel
            </button>
            <button
              type="submit"
              className="ml-auto rounded-md bg-blue-500 px-20 py-2 text-white hover:bg-blue-800"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpInput;
