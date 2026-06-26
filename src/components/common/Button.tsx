import { type FC } from "react";
import LoaderIcon from "../LoaderIcon";

interface ButtonProps {
  title: string;
  variant?: "solid";
  className?: any;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
  icon?: any;
}

const Button: FC<ButtonProps> = ({
  title,
  variant = "solid",
  className,
  onClick,
  disabled = false,
  type = "button",
  loading = false,
  icon = null,
}) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={`
        ${
          variant === "solid"
            ? "rounded-md bg-[#217EFD] text-sm text-slate-100 transition delay-75 ease-in-out hover:bg-blue-900"
            : "border-solid border-zinc-900 text-zinc-700 hover:text-zinc-900"
        }
        ${
          disabled ? "disabled:cursor-not-allowed disabled:opacity-75" : ""
        } ${className}`}
    >
      <span className="flex flex-row items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className="flex items-center justify-center text-sm">
          {loading ? <LoaderIcon className="mr-4 h-4 w-4" /> : null}
          {title}
        </span>
      </span>
    </button>
  );
};

export default Button;
