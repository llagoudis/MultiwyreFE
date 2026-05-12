import { Controller } from "react-hook-form";
import { useRef } from "react";

interface InputOTPProps {
  control: any;
  errors: any;
}

const InputOTP: React.FC<InputOTPProps> = ({ control, errors }) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
    <>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Controller
          key={index}
          name={`otp${index}`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              maxLength={1}
              className={`m-0.5 h-14 w-14 rounded-md border text-center ${
                errors["otp" + index] ? "border-red-500" : "border-gray-300"
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
      {errors.otp0 && (
        <div className="text-sm text-red-500">OTP is required</div>
      )}
    </>
  );
};

export default InputOTP;
