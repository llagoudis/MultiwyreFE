import React from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { type StaticImageData } from "next/image";

interface ButtonFieldProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  icon?: StaticImageData;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const ButtonField: React.FC<ButtonFieldProps> = ({
  onClick,
  type = "button",
  children,
  icon,
  fullWidth = true,
  loading = false,
  disabled = false,
}) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      fullWidth={fullWidth}
      variant="contained"
      disabled={disabled || loading}
      sx={{
        backgroundColor: "#4D00EC",
        mt: 4,
        textTransform: "none",
        fontWeight: "500",
        borderRadius: "10px",
        height: "56px",
        fontFamily: "Manrope, sans-serif",
        fontSize: "16px",
        position: "relative",
        "&:hover": {
          backgroundColor: "#4D00EC",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: "#ffffff" }} />
      ) : (
        <>
          {icon && (
            <span className="absolute right-4">
              <Image src={icon} alt="icon" width={21} height={21} />
            </span>
          )}
          {children}
        </>
      )}
    </Button>
  );
};

export default ButtonField;
