import React, { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@mui/material";
import LoaderIcon from "./LoaderIcon";

type MouseButtonEvent = React.MouseEvent<HTMLButtonElement>;
interface MuiButtonProps extends Omit<ButtonProps, "color"> {
  name: string;
  onClick?: ((event?: MouseButtonEvent) => Promise<void> | void) | undefined;
  width?: string;
  background?: string;
  color?: string;
  padding?: string;
  children?: ReactNode;
  borderRadius?: string;
  loading?: boolean;
  useLoading?: boolean;
  borderColor?: string;
}

const MuiButton: React.FC<MuiButtonProps> = ({
  name,
  onClick,
  width,
  background,
  color,
  padding,
  children,
  borderRadius,
  borderColor,
  useLoading = false,
  loading = false,
  ...props
}) => {
  const [isLoading, setLoading] = useState(false);

  const _onClick = async () => {
    if (onClick) {
      setLoading(true);
      await onClick();
      setLoading(false);
    }
  };
  return (
    <Button
      {...props}
      sx={{
        textTransform: "none",
        width: width,
        background: `linear-gradient(to right, #3B82F6, #6b21c8) !important`, // blue-500 to purple-500
        color: "white",
        border: `1px solid ${borderColor ? borderColor : " #3B82F6"} !important`,
        padding: padding ? padding : "0.4rem 1rem",
        borderRadius: borderRadius ? borderRadius : "0.6rem",
         marginLeft: "10px !important", // Pushes button to the righ
      }}
      className="!font-['Segoe UI'] active:scale-95"
      onClick={useLoading ? _onClick : onClick}
    >
      {loading || isLoading ? <LoaderIcon className="mr-4 h-4 w-4" /> : null}
      {name}
      {children}
    </Button>
  );
};

export default MuiButton;
