import { useRef, type FC } from "react";
import { useForm } from "react-hook-form";
import { verify2FAOTP } from "~/service/api/auth";
import toast from "react-hot-toast";
import Image from "next/image";

interface TwoFAProps {
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
}

const TwoFA: FC<TwoFAProps> = ({ onClose, onSubmit }) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { otp: "" },
  });

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const otp = watch("otp") ?? "";

  const setDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const chars = otp.split("");
    chars[index] = sanitized;
    const next = chars.join("").padEnd(0, "").slice(0, 6);
    setValue("otp", next);
    if (sanitized && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setValue("otp", pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verifyOTP = async ({ otp }: { otp: string }) => {
    if (otp.length !== 6) return toast.error("Please enter the 6-digit code");
    const [res, err] = await verify2FAOTP(otp);
    if (err) return toast.error(err || "Failed to validate OTP");
    if (res?.success) await onSubmit();
  };

  return (
    <div className="rounded-2xl bg-white p-6">
      <p className="text-lg font-bold text-black">Authorise action with 2FA</p>
      <p className="mt-1 text-sm text-slate-500">
        For your security, please verify this action two-factor authentication.
      </p>

      <div className="mt-6 flex items-start gap-5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          <Image src={'/assets/icons/ChatGPT Image Apr 28, 2026, 09_56_37 PM 1.svg'} alt="" width={100} height={100} className="h-12 w-12 object-contain" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-black">
            Enter you{" "}
            <span className="font-bold text-pink-500">2FA code</span>
          </p>
          <p className="text-xs text-slate-500">
            Enter the 6-digit code from your authenticator app to authorise
            this action.
          </p>

          <input type="hidden" {...register("otp", { required: true })} />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={otp[i] ?? ""}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                inputMode="numeric"
                maxLength={1}
                className="h-11 w-11 rounded-md border border-slate-200 text-center text-base font-semibold text-black outline-none focus:border-pink-500"
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50/40 px-3 py-2 text-xs text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" />
              <path
                d="M12 8v5M12 16h.01"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            This extra step helps keep your account and transactions safe and
            secure.
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit(verifyOTP)}
          className="rounded-md bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TwoFA;
