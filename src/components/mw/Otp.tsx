import { useEffect, useRef } from "react";

interface OtpProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
  onEnter?: () => void;
}

/**
 * Otp — the design's 6-box code input. Auto-advances on entry, backspace moves
 * focus back, supports paste of the full code, and an inline error state.
 */
const Otp = ({ value, onChange, length = 6, error, autoFocus, onEnter }: OtpProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 60);
  }, [autoFocus]);

  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const setAt = (i: number, ch: string) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join("").slice(0, length));
  };

  return (
    <div className={`code${error ? " err" : ""}`}>
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={ch ? "filled" : ""}
          value={ch}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, digit);
            if (digit && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "Enter" && onEnter) onEnter();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
            if (!d) return;
            onChange(d);
            refs.current[Math.min(d.length, length - 1)]?.focus();
          }}
        />
      ))}
    </div>
  );
};

export default Otp;
